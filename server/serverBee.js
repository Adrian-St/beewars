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
  DEAD: 2
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
  if(indexOfExistingAction != -1){
    this.playerActions[indexOfExistingAction].weight += weight;
    this.playerActions[indexOfExistingAction].timestamp = playerAction.timestamp;
  } else {
    playerAction.id = Game.lastActionId;
    playerAction.weight = weight;
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
module.exports = Bee;

/*
playerAction {
  id: int,
  timestamp: long,
  target: position,
  beeID: int,
  playerID: int,
  weight: int,
  stop: boolean // gets always overridden from server
}
*/