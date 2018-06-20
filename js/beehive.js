var Beewars = Beewars || {};

Beewars.Beehive = function(serverBeehive, sprite) {
  this.pollen = serverBeehive.pollen;
  this.honey = serverBeehive.honey;
  this.honeycombs = serverBeehive.honeycombs;
  this.sprite = sprite;
};

Beewars.Beehive.prototype.getSendableBeehive = function() {
  return {
    pollen: this.pollen,
    honey: this.honey,
    honeycombs: this.honeycombs
  };
};
