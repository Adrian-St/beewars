function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

Flower = function(id) {
  this.id = id
  this.nectar = randomInt(100, 200);
  this.pollen = randomInt(100, 200);
}
Flower.prototype.collectPollen = function(amount) {
  this.pollen -= amount;
  if (this.pollen < 0) {
    var actualAmount = amount + this.pollen;
    this.pollen = 0;
    return actualAmount;
  } else {
    return amount;
  }
}
Flower.prototype.collectNectar = function(amount) {
  this.pollen -= amount;
  if (this.pollen < 0) {
    var actualAmount = amount + this.pollen;
    this.pollen = 0;
    return actualAmount;
  } else {
    return amount;
  }
}

module.exports = Flower;
