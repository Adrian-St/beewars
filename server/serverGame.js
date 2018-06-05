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
  connection = newConnection;
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
    connection.updateGameObject({type: 'bee', content: Game.bees[i]});
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
  Game.beeForId(beeID).playerActions = [];
  return {type: 'bee', content: Game.beeForId(beeID)}
}


Game.handleSynchronizeBeehive = (updatedBeehive) => {
  Game.beehive.pollen = updatedBeehive.pollen;
  Game.beehive.honey = updatedBeehive.honey;
  Game.beehive.honeycombs = updatedBeehive.honeycombs;
  return {type: 'beehive', content: Game.beehive};
}

Game.handleSynchronizeBee = (updatedBee) => {
  var beeToBeUpdated = Game.beeForId(updatedBee.id);
  beeToBeUpdated.age = updatedBee.age;
  beeToBeUpdated.x = updatedBee.x;
  beeToBeUpdated.y = updatedBee.y;  
  beeToBeUpdated.status = updatedBee.status;
  beeToBeUpdated.health = updatedBee.health;
  beeToBeUpdated.energy = updatedBee.energy;
  beeToBeUpdated.pollen = updatedBee.pollen;
  beeToBeUpdated.nectar = updatedBee.nectar;
  beeToBeUpdated.capacity = updatedBee.capacity;

  return {type: 'bee', content: beeToBeUpdated};
}

Game.handleSynchronizeFlower = (updatedFlower) => {
  var flowerToBeUpdated = Game.flowerForId(updatedFlower.id);
  flowerToBeUpdated.pollen = updatedFlower.pollen;
  flowerToBeUpdated.nectar = updatedFlower.nectar;

  return {type: 'flower', content: flowerToBeUpdated};
}

Game.beeForId = id => {
  return Game.bees.find(bee => {return bee.id === id;});
}

Game.flowerForId = id => {
  return Game.flowers.find(flower => {return flower.id === id;});
}

module.exports = Game;
