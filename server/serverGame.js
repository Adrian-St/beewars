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
var mapJson = require('./../assets/map/outside_map.json');

Game.setConnection = (newConnection) => {
  connection = newConnection;
}

Game.start = (gameObjects) => {
  for(i = 0; i < gameObjects.flowers; i++) {
    tmpFlower = new Flower(Game.lastFlowerID);
    tmpFlower.x = mapJson.layers[2].objects[i].x;
    tmpFlower.y = mapJson.layers[2].objects[i].y;
    Game.flowers.push(tmpFlower);
    Game.lastFlowerID++;
  }
  for(i = 0; i < 5; i++) {
    var tmpBee = new Bee(Game.lastBeeID);
    tmpBee.onArriveAtDestination = onArriveAtDestination;
    tmpBee.onIdleForTooLong = onIdleForTooLong;
    Game.bees.push(tmpBee);
    Game.lastBeeID++;
  }
  Game.startTime = new Date()
  setInterval(Game.update, 5000);
};
/*
Game.update = () => {
  for(i = 0; i < Game.bees.length; i++) {
    Game.bees[i].increaseAge();
    connection.updateGameObject({type: 'bee', content: Game.bees[i]});
  }
};
*/

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
  playerAction.stop = false;
  return bee.performAction(playerAction);
};

/*
Game.emptyActionLogOfBee = beeID => {
  if(Game.beeForId(beeID).playerActions.length > 0) Game.calculatePlayerExperienceAfterBeeArrived(beeID);
  Game.beeForId(beeID).playerActions = [];
  return {type: 'bee', content: Game.beeForId(beeID)}
}
*/

Game.calculatePlayerExperienceAfterBeeArrived = bee => {
  let positiveContributer = bee.playerActions[0].playerIDs;
  positiveContributer.forEach(playerID => Game.raiseExperienceForPlayer(playerID, 0.1));
}

Game.raiseExperienceForPlayer = (playerID, value) => {
  Game.players.find(player => player.id == playerID).raiseExpBy(value);
}

/*
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
*/

Game.beeForId = id => {
  return Game.bees.find(bee => {return bee.id === id;});
}

Game.flowerForId = id => {
  return Game.flowers.find(flower => {return flower.id === id;});
}

Game.handleBeeIsIdleForTooLong = beeId => {
  var bee = Game.beeForId(beeId);
  var participatingPlayerIds = [];
  bee.playerActions.map(a => participatingPlayerIds = participatingPlayerIds.concat(a.playerIDs));
  Game.players.forEach(player => {
    if(!(player.id in participatingPlayerIds)) player.raiseExpBy(-0.1);
  })
}

// NEW -------------------------------------------------------------------------------------------------------------------------
Game.handleMovementRequest = (playerId, moveData) => {
  var bee = Game.beeForId(moveData.beeID);
  if (bee.status != 3) {
    Game.performActionForBee(playerId, moveData);
    if(bee.playerActions[0].stop){
      bee.resetFlyTimer();
      bee.startIdleTimer();
    }else{
      bee.startFlyTimer(moveData.target);
      bee.resetIdleTimer();
    }
    //console.log('updatedBee after handleMovementRequest', bee);
    connection.updateBee(bee.getSendableBee());
  }
  else console.log("Bee is beesy");
}

Game.update = () => {
  for(i = 0; i < Game.bees.length; i++) {
    Game.bees[i].increaseAge();
    connection.updateBee(Game.bees[i].getSendableBee());
  }
};

Game.addNectarToBee = (bee, flower) => { 
    bee.pollen += 10;
    flower.pollen -= 10;
    bee.nectar += 10;
    flower.nectar -= 10;
    connection.updateFlower(flower);
    connection.updateBee(bee.getSendableBee());
  };

Game.returnNectar = (bee) => { 
    Game.beehive.pollen += bee.pollen;
    Game.beehive.honey += bee.nectar;
    bee.pollen = 0;
    bee.nectar = 0;
    connection.updateBeehive(Game.beehive);
    connection.updateBee(bee.getSendableBee());
  };

function onArriveAtDestination(bee){ 
  if(bee.destination == null) console.log('[WARNING] destination ist null but it shouldnt');

  if (bee.destination.x == Game.beehive.x && bee.destination.y == Game.beehive.y) {
    Game.returnNectar(bee);
  }
  else {
    const flower = Game.getFlowerForPosition(bee.destination);
    if(flower == null) console.log('[WARNING] no flower found for this position')
    Game.addNectarToBee(bee, flower);
  }

  Game.calculatePlayerExperienceAfterBeeArrived(bee);
  bee.x = bee.destination.x;
  bee.y = bee.destination.y;
  bee.destination = null;
  bee.startIdleTimer();
  Game.clearPlayerActionsForBee(bee);
  // --------------------------------------------------------------------------------------------------------------------
}

Game.getFlowerForPosition = (position) => {
  for (var i = 0; i < Game.flowers.length; i++) {
    if(Game.flowers[i].x == position.x && Game.flowers[i].y == position.y + 64) return Game.flowers[i]; //investigate why we need to add 64
  }
}

Game.clearPlayerActionsForBee = (bee) => {
  bee.playerActions = [];
  connection.updateBee(bee.getSendableBee());
}

function onIdleForTooLong(bee){ 
  Game.handleBeeIsIdleForTooLong(bee.id)
}

module.exports = Game;
