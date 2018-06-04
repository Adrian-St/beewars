Game = {};

var Bee = require('./serverBee.js');
var Flower = require('./serverFlower.js');
var Player = require('./player.js');
var connection; // = require('./connection.js');
Game.beehive = require('./serverBeehive.js');
Game.lastPlayerID = 0;
Game.lastBeeID = 0;
Game.lastFlowerID = 0;
Game.flowers = [];
Game.bees = [];
Game.players = [];

Game.setConnection = (newConnection) => {
  console.log("newConnection", newConnection);
  connection = newConnection;
  console.log("newConnection2", connection);
}

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
    console.log(connection);
    //connection.updateGameObject({type: 'bee', content: Game.bees[i]});
  }
};

Game.newPlayer = () => {
  var player = new Player(Game.lastPlayerID);
  Game.players.push(player);
  Game.lastPlayerID++;
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

Game.performActionForBee = (playerID, playerAction) => {
  var bee = Game.bees[playerAction.beeID];
  playerAction.playerID = playerID;
  return bee.performAction(playerAction);
};

Game.emptyActionLogOfBee = beeID => {
  Game.bees[beeID].playerActions = [];
  return {type: 'bee', content: Game.bees[beeID]}
}


Game.handleSynchronizeBeehive = (updatedBeehive) => {
  Game.beehive.pollen = updatedBeehive.pollen;
  Game.beehive.honey = updatedBeehive.honey;
  Game.beehive.honeycombs = updatedBeehive.honeycombs;
  return {type: 'beehive', content: Game.beehive};
}

Game.handleSynchronizeBee = (updatedBee) => {
  var beeToBeUpdated;
  for(i = 0; i < Game.bees.length; i++) {
    if(Gane.bees[i].id == updatedBee.id) beeToBeUpdated = Game.bees[i];
  }
  beeToBeUpdated.age = updatedBee.age;
  beeToBeUpdated.status = updatedBee.status;
  beeToBeUpdated.health = updatedBee.health;
  beeToBeUpdated.energy = updatedBee.energy;
  beeToBeUpdated.pollen = updatedBee.pollen;
  beeToBeUpdated.nectar = updatedBee.nectar;
  beeToBeUpdated.capazity = updatedBee.capazity;

  Game.beehive.pollen = updatedBeehive.pollen;
  Game.beehive.honey = updatedBeehive.honey;
  Game.beehive.honeycombs = updatedBeehive.honeycombs;
  return {type: 'bee', content: beeToBeUpdated};
}

module.exports = Game;
