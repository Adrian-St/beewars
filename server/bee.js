var Bee = function() {
  this.age = 0;
  this.status = states.IDLE
  this.health = 100;
  this.energy = 100;
};
Bee.prototype.capacity = 100;
Bee.prototype.states = {
  IDLE: 0,
  WORKING: 1,
  DEAD: 2
};
Bee.prototype.reduceHealth = function(amount) {
  this.health -= amount;
  if (this.health <= 0) {
    this.health = 0;
    this.status = states.DEAD;
  }
};
Bee.prototype.performAction(action, target, targetNr = 0) {
  //calculate here what action to perform
}
module.exports = Bee;
