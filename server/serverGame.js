const {Bee, BeeTypes} = require('./serverBee.js');
const Wasp = require('./serverWasp.js');
const Flower = require('./serverFlower.js');
const Frog = require('./serverFrog.js')
const Player = require('./player.js');
const Weather = require('./weather.js');

exports.DAY_DURATION = 5000;

let connection; // = require('./connection.js');
exports.beehive = require('./serverBeehive.js');

exports.lastPlayerID = 0;
exports.lastBeeID = 0;
exports.lastFlowerID = 0;
exports.lastFrogID = 0;
exports.lastWaspID = 0;
exports.lastActionId = 0;
exports.flowers = [];
exports.frogs = [];
exports.bees = [];
exports.players = [];
exports.enemies = [];
exports.weather = {};
exports.centerPoints = [];

const outsideMapJson = require('./../assets/map/outside_map.json');
const insideMapJson = require('./../assets/map/inside_map.json');

exports.setConnection = newConnection => {
	connection = newConnection;
};

exports.start = () => {

	for (let i = 0; i < outsideMapJson.layers[3].objects.length; i++) {
		const tmpFlower = new Flower(exports.lastFlowerID);
		tmpFlower.x = outsideMapJson.layers[3].objects[i].x;
		tmpFlower.y =
			outsideMapJson.layers[3].objects[i].y - outsideMapJson.layers[3].objects[i].height;
		exports.flowers.push(tmpFlower);
		exports.lastFlowerID++;
	}
	for (let i = 0; i < outsideMapJson.layers[4].objects.length; i++) {
		const tmpFrog = new Frog(
			exports.lastFrogID,
			outsideMapJson.layers[4].objects[i].x,
			outsideMapJson.layers[4].objects[i].y - outsideMapJson.layers[4].objects[i].height);
		exports.frogs.push(tmpFrog);
		exports.lastFrogID++;
	}
	for (let i = 0; i < 5; i++) {
		let tmpBee = new Bee(exports.lastBeeID);
		tmpBee.type = BeeTypes.OUTSIDEBEE;
		exports.bees.push(tmpBee);
		exports.lastBeeID++;
	}
	for (let j = 0; j < 5; j++) {
		let tmpBee = new Bee(exports.lastBeeID);
		tmpBee.type = BeeTypes.INSIDEBEE;
		exports.bees.push(tmpBee); 
		exports.lastBeeID++;
	}
	exports.startTime = new Date();
	exports.weather = new Weather();
	exports.weather.startSimulation();
	setInterval(exports.spawnLarvae, 15000);
	setInterval(exports.advanceDay, exports.DAY_DURATION);
	setInterval(exports.spawnEnemy, 60000);

	for (let i = 0; i < insideMapJson.layers[2].objects.length; i++) {
		const tmpX = insideMapJson.layers[2].objects[i].centerX + insideMapJson.layers[2].objects[i].x;
		const tmpY = insideMapJson.layers[2].objects[i].centerY + insideMapJson.layers[2].objects[i].y;
		this.centerPoints.push({x: tmpX, y: tmpY});
	}
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
		bees: exports.beesWithUpdatedPosition(exports.outsideBees()),
		insideBees: exports.beesWithUpdatedPosition(exports.insideBees()),
		players: exports.players,
		flowers: exports.flowers,
		beehive: exports.beehive,
		enemies: exports.waspsWithUpdatedPosition()
	};
};

exports.calculatePlayerExperienceAfterBeeArrived = bee => {
	const positiveContributer = bee.playerActions[0].playerIDs;
	positiveContributer.forEach(playerID =>
		exports.raiseExperienceForPlayer(playerID, 0.1)
	);
};

exports.raiseExperienceForPlayer = (playerID, value) => {
	const currPlayer = exports.players.find(player => player.id === playerID);
	if (currPlayer) currPlayer.raiseExpBy(value);
};

exports.beeForId = id => {
	return exports.bees.find(bee => {
		return bee.id === id;
	});
};

exports.outsideBees = () => {
	return exports.bees.filter(bee => (bee.type === BeeTypes.OUTSIDEBEE));
};

exports.insideBees = () => {
	return exports.bees.filter(bee => (bee.type === BeeTypes.INSIDEBEE));
};

exports.beesWithUpdatedPosition = (bees) => {
	return bees.map(bee => 
		{
			if(bee.destination) bee.calculateNewPosition();
			return bee.getSendableBee();
		});
}

exports.waspsWithUpdatedPosition = () => {
	return exports.enemies.map(wasp => 
		{
			if(wasp.destination) wasp.calculateNewPosition();
			return wasp.getSendableWasp();
		});
}

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
	if (bee.status === Bee.STATES.INACTIVE) {
		console.log('Bee is beesy');
	} else {
		moveData.playerID = playerId;
		const result = bee.performAction(moveData);
		if (result === 'changed') {
			bee.startFlying(bee.playerActions[0].target);
			connection.moveBee(bee.getSendableBee());
		}
		else if(result === 'stop') {
			bee.stopFlying();
			connection.stopBee(bee.getSendableBee());
		}
	}
};

exports.isFrogPosition = (x,y) => {
	const frog = this.frogs.find((frog) => {
		return frog.contains(x,y);
	});
	return (frog !== undefined);
};

exports.advanceDay = () => {
	exports.bees.forEach((bee) => {
		bee.increaseAge();
	});
	exports.enemies.forEach((wasp) => {
		wasp.increaseAge();
	});
	connection.advanceDay();
};

exports.spawnLarvae = () => {
	console.log('new larvae');
	if(exports.beehive.geleeRoyal > 0) {
		exports.beehive.geleeRoyal -= 1;
		if (exports.beehive.freeHoneycombs > 0){
			exports.beehive.freeHoneycombs -= 1;
			exports.beehive.geleeRoyal -= 1;
			setTimeout(exports.spawnBee, 60000); // 60 sec
		}
		connection.updateBeehive(exports.beehive);
	} else {
		console.log('The Queen is too hungry to produce larvae')
	}	
};

exports.spawnBee = () => {
	console.log('new bee');
	const newBee = new Bee(exports.lastBeeID);
	exports.lastBeeID++;
	exports.beehive.freeHoneycombs += 1;
	exports.beehive.dirtyHoneycombs += 1;
	exports.bees.push(newBee);
	connection.spawnNewBee(newBee);
	connection.updateBeehive(exports.beehive);
};

exports.moveBeeToOutside = (bee) => {
	connection.moveBeeToOutside(bee);
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
};

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

exports.updateWeather = (weather) => {
	connection.updateWeather(weather.getSendableWeather());
};

exports.handleBuilding = () => {
	if (this.beehive.honey >= 10) {
		this.beehive.freeHoneycombs += 1;
		this.beehive.honeycombs += 1;
		this.beehive.honey -= 10;
	} else {
		console.log('Not enough honey for building');
		exports.sendMessage('Not enough honey for building');
	}
	connection.updateBeehive(this.beehive);
}

exports.produceGeleeRoyal = () => {
	if (this.beehive.pollen >= 5) {
		this.beehive.pollen -= 5;
		this.beehive.geleeRoyal += 1;
	} else {
		console.log('Not enough pollen for producing gelee-royal');
		exports.sendMessage('Not enough pollen for producing gelee-royal');
	}
	connection.updateBeehive(this.beehive);
}

exports.handleCleaning = () => {
	if (this.beehive.dirtyHoneycombs > 0) {
		this.beehive.freeHoneycombs += 1;
		this.beehive.dirtyHoneycombs -= 1;
	} else {
		console.log('There are no honeycombs to be cleaned');
		exports.sendMessage('There are no honeycombs to be cleaned');
	}
	connection.updateBeehive(this.beehive);
}

exports.sendMessage = (message) => {
	connection.sendMessage(message);
}
