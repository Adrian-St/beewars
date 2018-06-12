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
  //current Implementation always accepts newest action
  const weight = Game.players.find(player => player.id == playerAction.playerID).experience;
  const indexOfExistingAction = this.playerActions.findIndex(action => action.target.x === playerAction.target.x && action.target.y === playerAction.target.y)
  const indexOfOldPlayerAction = this.playerActions.findIndex(action => action.playerIDs.includes(playerAction.playerID));
  if(indexOfExistingAction != -1){
    if(indexOfOldPlayerAction != indexOfExistingAction){
      this.playerActions[indexOfExistingAction].weight += weight;
      this.playerActions[indexOfExistingAction].timestamp = playerAction.timestamp;
      this.playerActions[indexOfExistingAction].playerIDs.push(playerAction.playerID)
      this.removeOldPlayerAction(weight, playerAction.playerID, indexOfOldPlayerAction);
    }
  } else {
    if(indexOfOldPlayerAction != -1){
      this.removeOldPlayerAction(weight, playerAction.playerID, indexOfOldPlayerAction);
    }
    
    playerAction.id = Game.lastActionId;
    playerAction.weight = weight;
    playerAction.playerIDs = [playerAction.playerID];
    this.playerActions.push(playerAction);
    Game.lastActionId++;
  }
  this.playerActions.sort((a,b) => {return b.weight - a.weight});

  if(this.playerActions.length > 1) {
    if(this.playerActions[0].weight - this.playerActions[1].weight < 0.2) {
      var newPlayerActions = [];
      newPlayerActions.push({beeID: this.id, stop: true});
      this.playerActions.forEach(action => newPlayerActions.push(action));
      return newPlayerActions;
    }
  }
  return this.playerActions;
}

Bee.prototype.removeOldPlayerAction = function(weight, playerID, indexOfOldPlayerAction) {
  this.playerActions[indexOfOldPlayerAction].weight -= weight;
  this.playerActions[indexOfOldPlayerAction].playerIDs.splice(this.playerActions[indexOfOldPlayerAction].playerIDs.indexOf(playerID), 1);
  if(this.playerActions[indexOfOldPlayerAction].weight <= 0)
    this.playerActions.splice(indexOfOldPlayerAction, 1);
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