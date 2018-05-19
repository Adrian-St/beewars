Flower = function() {
  this.nectar = 200;
  this.pollen = 200;
}
Flower.prototype.collectPollen = function (amount){
  this.pollen -= amount;
  if (this.pollen < 0) {
    var actualAmount = amount + this.pollen;
    this.pollen = 0;
    return actualAmount;
  }
  else {
    return amount;
  }
}
Flower.prototype.collectNectar = function (amount){
  this.pollen -= amount;
  if (this.pollen < 0) {
    var actualAmount = amount + this.pollen;
    this.pollen = 0;
    return actualAmount;
  }
  else {
    return amount;
  }
}

exports.Flower = Flower;
