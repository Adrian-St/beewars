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
};

var playerActions = [];

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

Bee.prototype.states = {
  IDLE: 0,
  WORKING: 1,
  DEAD: 2
};

Bee.prototype.increaseAge = () => {
  this.age += 1;
  if (this.age >= 45) {
    this.status = this.states.DEAD;
  }
}

Bee.prototype.reduceHealth = (amount) => {
  this.health -= amount;
  if (this.health <= 0) {
    this.health = 0;
    this.status = this.states.DEAD;
  }
};

Bee.prototype.performAction = (moveData) => {
  //calculate here what action to perform
  //current Implementation always accepts newest action
  return moveData
}
module.exports = Bee;
