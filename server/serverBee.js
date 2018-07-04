function Bee (id)  {
  this.id = id;
  this.x = randomInt(100, 400);
  this.y = randomInt(100,400);
  this.age = 0;
  this.status = this.states.IDLE;
  this.health = 100;
  this.energy = 100;
  this.pollen = 0;
  this.nectar = 0;
  this.capacity = 100;
  this.playerActions = [];
  this.idleTimer = null; // meassures the time since the bee performed the last action
  this.flyTimer = null; 
  this.inactiveTimer = null; // blocks the bee for a while after an action is performed 
  this.onIdleForTooLong = null
  this.onArriveAtDestination = null;
  this.onActivateBee = null;
  this.destination = null;
  this.flyDuration = 0;
};

/* Schema of a playerAction
playerAction {
  id: int,
  timestamp: long,
  target: position,
  beeID: int,
  playerIDs: [int],
  weight: int,
  stop: boolean // gets always overridden from server
}
*/

Game.lastActionId = 0;

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

Bee.prototype.states = {
  IDLE: 0,
  WORKING: 1,
  DEAD: 2,
  INACTIVE: 3
};

Bee.prototype.increaseAge = function(){
  this.age += 1;
  if (this.age >= 45) {
    this.status = this.states.DEAD;
  }
}

Bee.prototype.reduceHealth = function(amount){
  this.health -= amount;
  if (this.health <= 0) {
    this.health = 0;
    this.status = this.states.DEAD;
  }
};

Bee.prototype.performAction = function(playerAction) {
  //calculate here what action to perform
  this.removeStopActions();

  const indexOfExistingAction = this.playerActions.findIndex(action => action.target.x === playerAction.target.x && action.target.y === playerAction.target.y)
  const indexOfOldPlayerAction = this.playerActions.findIndex(action => action.playerIDs.includes(playerAction.playerID));
  if(indexOfExistingAction != -1){
    if(indexOfOldPlayerAction != indexOfExistingAction){
      this.playerActions[indexOfExistingAction].timestamp = playerAction.timestamp;
      this.playerActions[indexOfExistingAction].playerIDs.push(playerAction.playerID)
      this.removeOldPlayerAction(playerAction.playerID, indexOfOldPlayerAction);
    }
  } else {
    if(indexOfOldPlayerAction != -1){
      this.removeOldPlayerAction(playerAction.playerID, indexOfOldPlayerAction);
    }    
    playerAction.id = Game.lastActionId;
    playerAction.playerIDs = [playerAction.playerID];
    this.playerActions.push(playerAction);
    Game.lastActionId++;
  }
  this.calculateWeightsForActions();

  this.playerActions.sort((a,b) => {return b.weight - a.weight});

  if(this.playerActions.length > 1) {
    if(this.playerActions[0].weight - this.playerActions[1].weight < 0.2) {
      var newPlayerActions = [];
      newPlayerActions.push({beeID: this.id, stop: true});
      this.playerActions.forEach(action => newPlayerActions.push(action));
      this.playerActions = newPlayerActions;
      return
    }
  }
  if(this.playerActions.length > 0) this.setDestination(this.playerActions[0].target);
}

Bee.prototype.removeStopActions = function() {
  this.playerActions = this.playerActions.filter(action => !action.stop)
}

Bee.prototype.removeOldPlayerAction = function(playerID, indexOfOldPlayerAction) {
  this.playerActions[indexOfOldPlayerAction].playerIDs.splice(this.playerActions[indexOfOldPlayerAction].playerIDs.indexOf(playerID), 1);
  if(this.playerActions[indexOfOldPlayerAction].playerIDs.length === 0)
    this.playerActions.splice(indexOfOldPlayerAction, 1);
}

Bee.prototype.calculateWeightsForActions = function() {
  this.playerActions = this.playerActions.map(action => {
    action.weight = action.playerIDs.reduce((total, playerID) => {
      return total + Game.players.find(player => player.id == playerID).experience
    }, 0);
    return action;
  });
}

Bee.prototype.setInactive = function (){
  this.status = this.states.INACTIVE;
  this.startInactiveTimer();
}

Bee.prototype.getSendableBee = function (){
  return {
    id: this.id,
    x: this.x,
    y: this.y,
    age: this.age,
    status: this.status,
    health: this.health,
    energy: this.energy,
    pollen: this.pollen,
    nectar: this.nectar,
    capacity: this.capacity,
    playerActions: this.playerActions
  }
}

Bee.prototype.resetIdleTimer = function (){ 
  if(this.idleTimer != null){
    clearTimeout(this.idleTimer);
    this.idleTimer = null;
  }
}

Bee.prototype.startIdleTimer = function (){
  this.resetIdleTimer();
  this.idleTimer = setTimeout(this.onIdleForTooLong, 10000, this); // 10ces
}

Bee.prototype.resetInactiveTimer = function (){ 
  // this method is not needed because the inactiveTimer can not be called again before the timer runs out
  // but this makes it more safe to operate with the timer
  if(this.inactiveTimer != null){
    clearTimeout(this.inactiveTimer);
    this.inactiveTimer = null;
  }
}

Bee.prototype.startInactiveTimer = function (){
  this.resetInactiveTimer();
  this.inactiveTimer = setTimeout(this.onActivateBee, 4000, this); // 4sec
}

Bee.prototype.startFlyTimer = function (destination){ 
  this.resetFlyTimer();
  this.setDestination(destination);
  this.flyTimer = setTimeout(this.onArriveAtDestination, this.flyDuration, this); 
}

Bee.prototype.resetFlyTimer = function (){ 
  if(this.flyTimer != null){
    // everytime the timer resets we calculate the new x and y
    // this is the case when there is a conflict
    this.calculateNewPosition();
    clearTimeout(this.flyTimer);
    this.flyTimer = null;
  }
}

Bee.prototype.setDestination = function (destination){ 
  this.destination = destination
  if(destination == null) this.flyDuration = 0;
  else this.flyDuration = this.calculateDistance(destination)*10;
}

Bee.prototype.calculateFlownDistancePercentage = function (){ 
  return (1 - (getTimeLeft(this.flyTimer)/this.flyDuration));
}

Bee.prototype.calculateNewPosition = function (){ 
  this.x = this.x + (this.destination.x - this.x)*this.calculateFlownDistancePercentage();
  this.y = this.y + (this.destination.y - this.y)*this.calculateFlownDistancePercentage();
}

Bee.prototype.calculateDistance = function (destination){ 
  return Math.sqrt((this.x - destination.x) * (this.x - destination.x) + (this.y - destination.y) * (this.y - destination.y));
}

function getTimeLeft(timeout) {
  return Math.ceil((timeout._idleStart + timeout._idleTimeout - (process.uptime()*1000)));
}

module.exports = Bee;