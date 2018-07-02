Player = function(id) {
  this.id = id;
  this.experience = 1;
};

Player.prototype.raiseExpBy = function (value) {
  this.experience = Math.max(this.experience + value, 0)
}


module.exports = Player;
