Game = {};

var bee = require('./bee.js')
Game.beehive = require('./beehive.js')
Game.lastPlayderID = 0;
Game.bees = [];
Game.players = [];
Game.start = function() {
  for(i = 0; i < 5; i++) {
    Game.bees.push(new bee());
  }
  Game.startTime = new Date()
  setInterval(Game.update, 1000);
}

Game.update = function() {
  console.log(Game.startTime.getTime());
}

Game.allObjects = function(){
  return {
    bees: Game.bees,
    players: Game.players,
    flowers: Game.flowers,
    beehive: Game.beehive
  }
}
Game.performActionForBee(moveData) {
  var bee = Game.bees[moveData.beeID];
  return bee.performAction(moveData.action, moveData.target, moveData.targetNr);
}

module.exports = Game;
