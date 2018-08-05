const Bee = require('./serverBee.js');
const Wasp = require('./serverWasp.js');
const Flower = require('./serverFlower.js');
const Player = require('./player.js');

let connection; // = require('./connection.js');
exports.beehive = require('./serverBeehive.js');

exports.lastPlayerID = 0;
exports.lastBeeID = 0;
exports.lastFlowerID = 0;
exports.lastWaspID = 0;
exports.lastActionId = 0;
exports.flowers = [];
exports.bees = [];
exports.hiveBees = []; //
exports.players = [];
exports.enemies = [];

const mapJson = require('./../assets/map/outside_map.json');

exports.setConnection = newConnection => {
	connection = newConnection;
};

exports.start = () => {
	for (let i = 0; i < mapJson.layers[2].objects.length; i++) {
		const tmpFlower = new Flower(exports.lastFlowerID);
		tmpFlower.x = mapJson.layers[2].objects[i].x;
		tmpFlower.y =
			mapJson.layers[2].objects[i].y - mapJson.layers[2].objects[i].height;
		exports.flowers.push(tmpFlower);
		exports.lastFlowerID++;
	}
	for (let i = 0; i < 5; i++) {
		let tmpBee = new Bee(exports.lastBeeID);
		tmpBee.type = 1;
		exports.bees.push(tmpBee);
		exports.lastBeeID++;
	}
	for (let j = 0; j < 5; j++) {
		//exports.bees.push(new Bee(exports.lastBeeID)); // quick and dirty fix (needs to be improved)
		exports.hiveBees.push(new Bee(exports.lastBeeID)); 
		exports.lastBeeID++;
	}
	exports.startTime = new Date();
	setInterval(exports.updateAge, 5000);
	setInterval(exports.spawnEnemy, 30000);
};

exports.spawnEnemy = () => {
	var wasp = new Wasp(exports.lastWaspID);
	exports.enemies.push(wasp);
	exports.lastWaspID++;
	connection.createWasp(wasp.getSendableWasp());
	wasp.flyToNearestFlower();
}

exports.newPlayer = () => {
	const player = new Player(exports.lastPlayerID);
	exports.players.push(player);
	exports.lastPlayerID++;
	return player;
};

exports.allObjects = () => {
	return {
		bees: exports.bees.map(bee => bee.getSendableBee()),
		hiveBees: exports.hiveBees.map(bee => bee.getSendableBee()),
		players: exports.players,
		flowers: exports.flowers,
		beehive: exports.beehive
	};
};

exports.performActionForBee = (playerID, playerAction) => {
	let bee = exports.beeForId(playerAction.beeID);
	if(!bee) bee = exports.hiveBees.find(b => {return b.id === playerAction.beeID}); //bee from inside (quick and dirty fix)
	playerAction.playerID = playerID;
	playerAction.stop = false;
	bee.performAction(playerAction);
};

exports.calculatePlayerExperienceAfterBeeArrived = bee => {
	const positiveContributer = bee.playerActions[0].playerIDs;
	positiveContributer.forEach(playerID =>
		exports.raiseExperienceForPlayer(playerID, 0.1)
	);
};

exports.raiseExperienceForPlayer = (playerID, value) => {
	exports.players.find(player => player.id === playerID).raiseExpBy(value);
};

exports.beeForId = id => {
	return exports.bees.find(bee => {
		return bee.id === id;
	});
};

exports.flowerForId = id => {
	return exports.flowers.find(flower => {
		return flower.id === id;
	});
};

exports.handleBeeIsIdleForTooLong = beeId => {
	const bee = exports.beeForId(beeId);
	let participatingPlayerIds = [];
	bee.playerActions.forEach(a => {
		participatingPlayerIds = participatingPlayerIds.concat(a.playerIDs);
	});
	exports.players.forEach(player => {
		if (!(player.id in participatingPlayerIds)) player.raiseExpBy(-0.1);
	});
};

exports.handleMovementRequest = (playerId, moveData) => {
	const bee = exports.beeForId(moveData.beeID);
	if(!bee){ // this is a quick and dirty fix that needs to be improved in the near future
		const bee = exports.hiveBees.find(b => {return b.id === moveData.beeID}); //bee from inside
		if (bee.status === Bee.STATES.INACTIVE) {
		console.log('Bee is beesy');
		} else {
			exports.performActionForBee(playerId, moveData);
			connection.updateBee(bee.getSendableBee());
		}
		return
	}
	if (bee.status === Bee.STATES.INACTIVE) {
		console.log('Bee is beesy');
	} else {
		exports.performActionForBee(playerId, moveData);
		if (bee.playerActions[0].stop) {
			bee.resetFlyTimer();
			bee.startIdleTimer();
		} else {
			bee.startFlyTimer(moveData.target);
			bee.resetIdleTimer();
		}
		connection.updateBee(bee.getSendableBee());
	}
};

exports.updateAge = () => {
	exports.bees.forEach((bee) => {
		bee.increaseAge();
		connection.updateBee(bee.getSendableBee());
	});
};

exports.addNectarToBee = (bee, flower) => {
	bee.pollen += 10;
	flower.pollen -= 10;
	bee.nectar += 10;
	flower.nectar -= 10;
	connection.updateFlower(flower);
	connection.updateBee(bee.getSendableBee());
};

exports.returnNectar = bee => {
	exports.beehive.pollen += bee.pollen;
	exports.beehive.honey += bee.nectar;
	bee.pollen = 0;
	bee.nectar = 0;
	connection.updateBeehive(exports.beehive);
	connection.updateBee(bee.getSendableBee());
};

exports.getFlowerForPosition = position => {
	for (let i = 0; i < exports.flowers.length; i++) {
		if (
			exports.flowers[i].x === position.x &&
			exports.flowers[i].y === position.y
		)
			return exports.flowers[i]; // Investigate why we need to add 64
	}
};

exports.clearPlayerActionsForBee = bee => {
	bee.playerActions = [];
	connection.updateBee(bee.getSendableBee());
};

exports.waspArrivedAtFlower = wasp => {
	connection.updateWasp(wasp.getSendableWasp());
};

exports.waspStartsFlying = wasp => {
	connection.updateWasp(wasp.getSendableWasp());
};

exports.removeWasp = (wasp) => {
	var index = this.enemies.indexOf(wasp);
	this.enemies.splice(index, 1);
	wasp.cancelAllTimeEvents();
	connection.removeWasp(wasp.getSendableWasp());
	delete wasp;
};

exports.updateBee = bee => {
	connection.updateBee(bee.getSendableBee());
}

exports.removeBee = (bee) => {
	var index = this.bees.indexOf(bee);
	this.bees.splice(index, 1);
	bee.cancelAllTimeEvents();
	connection.killBee(bee.getSendableBee());
	delete bee;
};

exports.reduceHealth = (bee) => {
	connection.updateBee(bee.getSendableBee());
};
