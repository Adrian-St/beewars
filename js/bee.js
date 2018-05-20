Beewars = Beewars || {};
Beewars.Bee = function(serverBee, sprite) {
  this.id = serverBee.id;
  this.age = serverBee.age;
  this.status = serverBee.status;
  this.health = serverBee.health;
  this.energy = serverBee.energy;
  this.pollen = serverBee.pollen;
  this.nectar = serverBee.nectar;
  this.capacity = serverBee.capacity;
  this.sprite = sprite;
}
