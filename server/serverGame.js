const Bee = require('./serverBee.js');
const Flower = require('./serverFlower.js');
const Player = require('./player.js');

let connection; // = require('./connection.js');
exports.beehive = require('./serverBeehive.js');

exports.lastPlayerID = 0;
exports.lastBeeID = 0;
exports.lastFlowerID = 0;
exports.lastActionId = 0;
exports.flowers = [];
exports.bees = [];
exports.players = [];
const mapJson = require('./../assets/map/outside_map.json');

exports.setConnection = newConnection => {
	connection = newConnection;
};

exports.start = () => {
	for (let i = 0; i < mapJson.layers[2].objects.length; i++) {
		const tmpFlower = new Flower(exports.lastFlowerID);
		tmpFlower.x = mapJson.layers[2].objects[i].x;
		tmpFlower.y = mapJson.layers[2].objects[i].y;
		exports.flowers.push(tmpFlower);
		exports.lastFlowerID++;
	}
	for (let i = 0; i < 5; i++) {
		const tmpBee = new Bee(exports.lastBeeID);
		tmpBee.onArriveAtDestination = exports.onArriveAtDestination;
		tmpBee.onIdleForTooLong = exports.onIdleForTooLong;
		tmpBee.onActivateBee = exports.onActivateBee;
		exports.bees.push(tmpBee);
		exports.lastBeeID++;
	}
	exports.startTime = new Date();
	setInterval(exports.updateAge, 5000);
};

exports.newPlayer = () => {
	const player = new Player(exports.lastPlayerID);
	exports.players.push(player);
	exports.lastPlayerID++;
	return player;
};

exports.allObjects = () => {
	return {
		bees: exports.bees.map(bee => bee.getSendableBee()),
		players: exports.players,
		flowers: exports.flowers,
		beehive: exports.beehive
	};
};

exports.performActionForBee = (playerID, playerAction) => {
	const bee = exports.bees[playerAction.beeID];
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
	if (bee.status === bee.states.INACTIVE) {
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
	for (let i = 0; i < exports.bees.length; i++) {
		exports.bees[i].increaseAge();
		connection.updateBee(exports.bees[i].getSendableBee());
	}
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
			exports.flowers[i].y === position.y + 64
		)
			return exports.flowers[i]; // Investigate why we need to add 64
	}
};

exports.clearPlayerActionsForBee = bee => {
	bee.playerActions = [];
	connection.updateBee(bee.getSendableBee());
};

exports.onIdleForTooLong = bee => {
	exports.handleBeeIsIdleForTooLong(bee.id);
};

exports.onArriveAtDestination = bee => {
	bee.calculateFlownDistancePercentage();
	if (bee.destination === null)
		console.log('[WARNING] destination is null but it shouldnt');

	if (
		bee.destination.x === exports.beehive.x &&
		bee.destination.y === exports.beehive.y
	) {
		exports.returnNectar(bee);
	} else {
		const flower = exports.getFlowerForPosition(bee.destination);
		if (!flower) console.log('[WARNING] no flower found for this position');
		exports.addNectarToBee(bee, flower);
	}
	bee.resetFlyTimer();
	exports.calculatePlayerExperienceAfterBeeArrived(bee);
	bee.x = bee.destination.x;
	bee.y = bee.destination.y;
	bee.setDestination(null);
	bee.setInactive();
	bee.startIdleTimer();
	exports.clearPlayerActionsForBee(bee);
	connection.updateBee(bee.getSendableBee());
};

exports.onActivateBee = bee => {
	bee.status = bee.states.IDLE;
	connection.updateBee(bee.getSendableBee());
};
