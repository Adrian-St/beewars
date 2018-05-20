Game = {};

var Bee = require('./bee.js');
var Flower = require('./flower.js');
var Player = require('./player.js');
var connection = require('./connection.js');
Game.beehive = require('./beehive.js');
Game.lastPlayerID = 0;
Game.lastBeeID = 0;
Game.lastFlowerID = 0;
Game.flowers = [];
Game.bees = [];
Game.players = [];

Game.start = (gameObjects) => {
  for(i = 0; i < gameObjects.flowers; i++) {
    Game.flowers.push(new Flower(Game.lastFlowerID));
    Game.lastFlowerID++;
  }
  for(i = 0; i < 5; i++) {
    Game.bees.push(new Bee(Game.lastBeeID));
    Game.lastBeeID++;
  }
  Game.startTime = new Date()
  setInterval(Game.update, 5000);
};

Game.update = () => {
  for(i = 0; i < Game.bees.length; i++) {
    Game.bees[i].increaseAge();
  }
};

Game.newPlayer = () => {
  var player = new Player(Game.lastPlayderID);
  Game.lastPlayerID++;
  Game.players.push(player);
  return player;
};

Game.allObjects = () => {
  return {
    bees: Game.bees,
    players: Game.players,
    flowers: Game.flowers,
    beehive: Game.beehive
  };
};

Game.performActionForBee = (moveData) => {
  var bee = Game.bees[moveData.beeID];
  return bee.performAction(moveData);
};

Game.handleRessources = (ressourcesData) => {
  Game.beehive.honey += ressourcesData;
  return Game.beehive.honey;
}

module.exports = Game;
