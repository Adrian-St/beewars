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
  this.idleTimer = null;
  this.flyTimer = null;
  this.onIdleForTooLong = null
  this.onArriveAtDestination = null;
  this.destination = null;
};

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
  //const weight = Game.players.find(player => player.id == playerAction.playerID).experience;
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
    console.log('weight diff', this.playerActions[0].weight - this.playerActions[1].weight)
    if(this.playerActions[0].weight - this.playerActions[1].weight < 0.2) {
      var newPlayerActions = [];
      newPlayerActions.push({beeID: this.id, stop: true});
      this.playerActions.forEach(action => newPlayerActions.push(action));
      this.destination = null;
      this.playerActions = newPlayerActions;
      console.log('server Actions: ', this.playerActions)
      return newPlayerActions;
    }
  }
  if(this.playerActions.length > 0) this.destination = this.playerActions[0].target;

  return this.playerActions;
}

Bee.prototype.removeStopActions = function() {
  this.playerActions = this.playerActions.filter(action => !action.stop)
  console.log(this.playerActions)
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

module.exports = Bee;

/*
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

// NEW -------------------------------------------------------------------------------
Bee.prototype.initializeTween = function (){
  this.tween = Beewars.game.add.tween(this.sprite);
}

Bee.prototype.startTween = function (destination){
    var duration = Phaser.Math.distance(this.sprite.position.x, this.sprite.position.y, destination.x, destination.y) * 10;
    this.initializeTween();
    this.tween.to(destination, duration);
    this.tween.onComplete.add(Beewars.Game.moveCallback, this);
    this.tween.start();
    this.tween.onUpdateCallback(Beewars.Game.onTweenRunning, this);
}

Bee.prototype.stopTween = function (){
  if(this.tween){
        this.tween.stop();
        this.tween = null;
    }
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
  //this.timer = Beewars.game.time.events.add(Phaser.Timer.SECOND * 10, onElapsedTime, this)
}

/*
function onIdleForTooLong(){ 
  console.log('idleTimer');
  Game.handleBeeIsIdleForTooLong(this.id)
}
*/

Bee.prototype.resetFlyTimer = function (){ 
  if(this.flyTimer != null){
    console.log('cancle flyTimer', this.flyTimer)
    clearTimeout(this.flyTimer);
    console.log('test');
    //Beewars.game.time.events.remove(this.timer);
    this.flyTimer = null;
  }
}

Bee.prototype.startFlyTimer = function (destination){ 
  console.log('start')
  this.resetFlyTimer();
  var distance = Math.sqrt((this.x - destination.x) * (this.x - destination.x) + (this.y - destination.y) * (this.y - destination.y));
  var duration = distance * 10;
  this.flyTimer = setTimeout(this.onArriveAtDestination, duration, this); 
  //this.flyTimer = {test: 'test'};
}
/*
Bee.prototype.onArriveAtDestination = function (){ 
  console.log('arrived at destination');
  // --------------------------------------------------------------------------------------------------------------------
}
*/
