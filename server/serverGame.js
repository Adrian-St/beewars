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

Game.start = () => {
  for(i = 0; i < mapJson.layers[2].objects.length; i++) {
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
    tmpBee.onActivateBee = onActivateBee;
    Game.bees.push(tmpBee);
    Game.lastBeeID++;
  }
  Game.startTime = new Date()
  setInterval(Game.updateAge, 5000);
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
  playerAction.stop = false;
  bee.performAction(playerAction);
};

Game.calculatePlayerExperienceAfterBeeArrived = bee => {
  let positiveContributer = bee.playerActions[0].playerIDs;
  positiveContributer.forEach(playerID => Game.raiseExperienceForPlayer(playerID, 0.1));
}

Game.raiseExperienceForPlayer = (playerID, value) => {
  Game.players.find(player => player.id == playerID).raiseExpBy(value);
}

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

Game.handleMovementRequest = (playerId, moveData) => {
  var bee = Game.beeForId(moveData.beeID);
  console.log(bee.status)
  if (bee.status != bee.states.INACTIVE) {
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

Game.updateAge = () => {
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
  console.log('idle for too long');
  Game.handleBeeIsIdleForTooLong(bee.id)
}

function onArriveAtDestination(bee){ 
  console.log('arrived at destination');
  bee.calculateFlownDistancePercentage();
  if(bee.destination == null) console.log('[WARNING] destination ist null but it shouldnt');

  if (bee.destination.x == Game.beehive.x && bee.destination.y == Game.beehive.y) {
    Game.returnNectar(bee);
  }
  else {
    const flower = Game.getFlowerForPosition(bee.destination);
    if(flower == null) console.log('[WARNING] no flower found for this position')
    Game.addNectarToBee(bee, flower);
  }
  bee.resetFlyTimer();
  Game.calculatePlayerExperienceAfterBeeArrived(bee);
  bee.x = bee.destination.x;
  bee.y = bee.destination.y;
  bee.setDestination(null);
  bee.setInactive();
  bee.startIdleTimer();
  Game.clearPlayerActionsForBee(bee);
  connection.updateBee(bee.getSendableBee());
  // --------------------------------------------------------------------------------------------------------------------
}

function onActivateBee(bee){ 
  console.log('active again');
  bee.status = bee.states.IDLE;
  connection.updateBee(bee.getSendableBee());
}

module.exports = Game;
