const { Bee, BeeTypes } = require('./serverBee.js');
const Wasp = require('./serverWasp.js');
const Flower = require('./serverFlower.js');
const Frog = require('./serverFrog.js');
const Player = require('./player.js');
const Weather = require('./weather.js');
const Beehive = require('./serverBeehive.js');

let connection;

const outsideMapJson = require('./../assets/map/outside_map.json');
const insideMapJson = require('./../assets/map/inside_map.json');

class Game {
	constructor(roomName) {
		this.DAY_DURATION = 5000;
		this.STARTING_BEES_INSIDE = 3;
		this.STARTING_BEES_OUTSIDE = 3;
		this.START_EXP_DAY = 5;
		this.day = 0;
		this.lastPlayerID = 0;
		this.lastBeeID = 0;
		this.lastFlowerID = 0;
		this.lastFrogID = 0;
		this.lastWaspID = 0;
		this.lastActionId = 0;
		this.flowers = [];
		this.frogs = [];
		this.bees = [];
		this.players = [];
		this.enemies = [];
		this.weather = {};
		this.centerPoints = [];
		this.defaultAreaTopLeft = null;
		this.defaultAreaBottomRight = null;
		this.beehive = new Beehive();
		this.roomName = roomName; // This is used to distinguish between multiple gameInstances
	}

	setConnection(newConnection) {
		connection = newConnection;
	}

	start() {
		const offset = 160; // Caused by difference in map generator, needs to be changed on client site too!
		const firstLayer = insideMapJson.layers[3].objects[0];
		this.defaultAreaTopLeft = { x: firstLayer.x, y: firstLayer.y - offset };
		this.defaultAreaBottomRight = {
			x: firstLayer.x + firstLayer.width,
			y: firstLayer.y + firstLayer.height - offset
		};

		for (let i = 0; i < outsideMapJson.layers[3].objects.length; i++) {
			const tmpFlower = new Flower(this.lastFlowerID);
			tmpFlower.x = outsideMapJson.layers[3].objects[i].x;
			tmpFlower.y =
				outsideMapJson.layers[3].objects[i].y -
				outsideMapJson.layers[3].objects[i].height;
			tmpFlower.color = outsideMapJson.layers[3].objects[i].name;
			this.flowers.push(tmpFlower);
			this.lastFlowerID++;
		}
		for (let i = 0; i < outsideMapJson.layers[4].objects.length; i++) {
			const tmpFrog = new Frog(
				this.lastFrogID,
				outsideMapJson.layers[4].objects[i].x,
				outsideMapJson.layers[4].objects[i].y -
					outsideMapJson.layers[4].objects[i].height
			);
			this.frogs.push(tmpFrog);
			this.lastFrogID++;
		}
		for (let i = 0; i < this.STARTING_BEES_INSIDE; i++) {
			const tmpX = this.randomInt(
				this.defaultAreaTopLeft.x,
				this.defaultAreaBottomRight.x
			);
			const tmpY = this.randomInt(
				this.defaultAreaTopLeft.y,
				this.defaultAreaBottomRight.y
			);
			const tmpBee = new Bee(this.lastBeeID, this, tmpX, tmpY);
			tmpBee.type = BeeTypes.INSIDEBEE;
			tmpBee.age = i;
			this.bees.push(tmpBee);
			this.lastBeeID++;
		}
		for (let j = 0; j < this.STARTING_BEES_OUTSIDE; j++) {
			const tmpX = this.randomInt(100, 400);
			const tmpY = this.randomInt(100, 400);
			const tmpBee = new Bee(this.lastBeeID, this, tmpX, tmpY);
			tmpBee.type = BeeTypes.OUTSIDEBEE;
			tmpBee.age = j;
			this.bees.push(tmpBee);
			this.lastBeeID++;
		}
		this.startTime = new Date();
		this.weather = new Weather(this);
		this.weather.startSimulation();
		setInterval(this.spawnLarvae.bind(this), 3 * this.DAY_DURATION);
		setInterval(this.advanceDay.bind(this), this.DAY_DURATION);
		setInterval(this.spawnEnemy.bind(this), 6 * this.DAY_DURATION);

		for (let i = 0; i < insideMapJson.layers[3].objects.length; i++) {
			const tmpX =
				insideMapJson.layers[3].objects[i].x +
				insideMapJson.layers[3].objects[i].width / 2;
			const tmpY =
				insideMapJson.layers[3].objects[i].y +
				insideMapJson.layers[3].objects[i].height / 2 -
				offset;
			this.centerPoints.push({ x: tmpX, y: tmpY });
		}
	}

	spawnEnemy() {
		const tmpX = this.randomInt(100, 400);
		const tmpY = this.randomInt(100, 400);
		const wasp = new Wasp(this.lastWaspID, this, tmpX, tmpY);
		this.enemies.push(wasp);
		this.lastWaspID++;
		connection.createWasp(wasp.getSendableWasp(), this.roomName);
		wasp.flyToFlower();
	}

	newPlayer() {
		const player = new Player(this.lastPlayerID);
		this.players.push(player);
		this.lastPlayerID++;
		return player;
	}

	allObjects() {
		return {
			bees: this.beesWithUpdatedPosition(this.outsideBees()),
			insideBees: this.beesWithUpdatedPosition(this.insideBees()),
			players: this.players,
			flowers: this.flowers,
			beehive: this.beehive,
			enemies: this.waspsWithUpdatedPosition()
		};
	}

	changeExperienceForPlayers(playerIDs, value = 0.1) {
		if (this.day > this.START_EXP_DAY) { // To protect player who play the game for the first time
			playerIDs.forEach(playerID =>
				this.changeExperienceForPlayer(playerID, value)
			);
		}
	}

	changeExperienceForPlayer(playerID, value) {
		const currPlayer = this.players.find(player => player.id === playerID);
		if (currPlayer) currPlayer.raiseExpBy(value);
	}

	beeForId(id) {
		return this.bees.find(bee => {
			return bee.id === id;
		});
	}

	outsideBees() {
		return this.bees.filter(bee => bee.type === BeeTypes.OUTSIDEBEE);
	}

	insideBees() {
		return this.bees.filter(bee => bee.type === BeeTypes.INSIDEBEE);
	}

	beesWithUpdatedPosition(bees) {
		return bees.map(bee => {
			if (bee.destination) bee.calculateNewPosition();
			return bee.getSendableBee();
		});
	}

	waspsWithUpdatedPosition() {
		return this.enemies.map(wasp => {
			if (wasp.destination) wasp.calculateNewPosition();
			return wasp.getSendableWasp();
		});
	}

	flowerForId(id) {
		return this.flowers.find(flower => {
			return flower.id === id;
		});
	}

	handleBeeIsIdleForTooLong(beeId) {
		const bee = this.beeForId(beeId);
		let participatingPlayerIds = [];
		bee.playerActions.forEach(a => {
			participatingPlayerIds = participatingPlayerIds.concat(a.playerIDs);
		});
		if(this.day > this.START_EXP_DAY) {
			this.players.forEach(player => {
				if (!(player.id in participatingPlayerIds)) player.raiseExpBy(-0.2);
			});
		}
	}

	handleMovementRequest(playerId, moveData) {
		const bee = this.beeForId(moveData.beeID);
		if (!bee) return;

		// Remove "defaultAreaActions" of bee
		bee.playerActions = bee.playerActions.filter(
			action => !action.defaultAreaAction
		);

		if (bee.status === Bee.STATES.INACTIVE) {
			console.log('Bee is beesy');
		} else {
			moveData.playerID = playerId;
			const result = bee.performAction(moveData);
			if (result === 'stop') {
				bee.stopFlying();
				connection.stopBee(bee.getSendableBee(), this.roomName);
			} else {
				bee.startFlying(bee.playerActions[0].target);
				connection.moveBee(bee.getSendableBee(), this.roomName);
			}
		}
	}

	isFrogPosition(x, y) {
		const frog = this.frogs.find(frog => {
			return frog.contains(x, y);
		});
		return frog !== undefined;
	}

	advanceDay() {
		this.bees.forEach(bee => {
			bee.increaseAge();
		});
		this.enemies.forEach(wasp => {
			wasp.increaseAge();
		});
		this.day++;
		connection.advanceDay(this.day, this.roomName);
	}

	spawnLarvae() {
		if (this.beehive.geleeRoyal > 0) {
			this.beehive.geleeRoyal -= 1;
			if (this.beehive.freeHoneycombs > 0) {
				this.beehive.freeHoneycombs -= 1;
				this.beehive.occupiedHoneycombs += 1;
				setTimeout(this.spawnBee.bind(this), this.DAY_DURATION * 10);
			} else {
				connection.broadcastMessage('No honeycombs free', this.roomName);
			}
			connection.updateBeehive(this.beehive, this.roomName);
		} else {
			connection.broadcastMessage(
				'The Queen is too hungry to produce larvae',
				this.roomName
			);
		}
	}

	spawnBee() {
		const tmpX = this.randomInt(
			this.defaultAreaTopLeft.x,
			this.defaultAreaBottomRight.x
		);
		const tmpY = this.randomInt(
			this.defaultAreaTopLeft.y,
			this.defaultAreaBottomRight.y
		);
		const newBee = new Bee(this.lastBeeID, this, tmpX, tmpY);
		this.lastBeeID++;
		this.beehive.occupiedHoneycombs -= 1;
		this.beehive.dirtyHoneycombs += 1;
		this.bees.push(newBee);
		connection.spawnNewBee(newBee.getSendableBee(), this.roomName);
		connection.updateBeehive(this.beehive, this.roomName);
	}

	moveBeeToOutside(bee) {
		connection.moveBeeToOutside(bee.getSendableBee(), this.roomName);
		if (this.insideBees().length === 1)
			connection.broadcastMessage(
				'Only one bee inside the hive',
				this.roomName
			);
		if (this.insideBees().length === 0)
			connection.broadcastMessage('No more bees inside', this.roomName);
	}

	addNectarToBee(bee, flower, value = 10) {
		if (bee.capacity >= bee.pollen + bee.nectar + 2 * value) {
			bee.pollen += flower.collectPollen();
			bee.nectar += flower.collectNectar();
			bee.changePlayerExperience(0.1);
		} else {
			console.log('Bee is full');
			bee.changePlayerExperience(-0.2);
		}
		connection.updateFlower(flower, this.roomName);
		connection.updateBee(bee.getSendableBee(), this.roomName);
	}

	returnNectar(bee) {
		this.beehive.pollen += bee.pollen;
		this.beehive.honey += bee.nectar;
		bee.pollen = 0;
		bee.nectar = 0;
		connection.updateBeehive(this.beehive, this.roomName);
		connection.updateBee(bee.getSendableBee(), this.roomName);
		if(this.weather.raining || bee.health < 100) {
			bee.changePlayerExperience(0.1);
		}
		if(!this.weather.raining && bee.health == 100 && bee.pollen == 0 && bee.nectar == 0) {
			bee.changePlayerExperience(-0.1);
		}
		else {
			bee.changePlayerExperience(0.1);
		}
	}

	getFlowerForPosition(position) {
		for (let i = 0; i < this.flowers.length; i++) {
			if (this.flowers[i].x === position.x && this.flowers[i].y === position.y)
				return this.flowers[i]; // Investigate why we need to add 64
		}
	}

	clearPlayerActionsForBee(bee) {
		bee.oldPlayerActions = bee.playerActions.slice();
		bee.playerActions = [];
		connection.updateBee(bee.getSendableBee(), this.roomName);
	}

	waspArrivedAtFlower(wasp) {
		connection.updateWasp(wasp.getSendableWasp(), this.roomName);
	}

	waspStartsFlying(wasp) {
		connection.updateWasp(wasp.getSendableWasp(), this.roomName);
	}

	removeWasp(wasp) {
		const index = this.enemies.indexOf(wasp);
		this.enemies.splice(index, 1);
		wasp.cancelAllTimeEvents();
		connection.removeWasp(wasp.getSendableWasp(), this.roomName);
		// Delete wasp;
	}

	updateBee(bee) {
		connection.updateBee(bee.getSendableBee(), this.roomName);
	}

	removeBee(bee) {
		const index = this.bees.indexOf(bee);
		this.bees.splice(index, 1);
		bee.cancelAllTimeEvents();
		connection.killBee(bee.getSendableBee(), this.roomName);
		this.checkGameOver();
		// Delete bee;
	}

	reduceHealth(bee) {
		connection.updateBee(bee.getSendableBee(), this.roomName);
	}

	updateWeather(weather) {
		connection.updateWeather(weather.getSendableWeather(), this.roomName);
	}

	handleBuilding(workingBee) {
		let success;
		if (this.beehive.honey >= 5 && this.beehive.pollen >= 3) {
			this.beehive.freeHoneycombs += 1;
			this.beehive.honeycombs += 1;
			this.beehive.honey -= 5;
			this.beehive.pollen -= 3;
			success = true;
		} else {
			this.sendMessage(
				'Not enough ressources for building',
				workingBee.playerActions[0].playerIDs
			);
			success = false;
		}
		connection.updateBeehive(this.beehive, this.roomName);
		return success;
	}

	produceGeleeRoyal(workingBee) {
		let success;
		if (this.beehive.pollen >= 10 && this.beehive.honey >= 10) {
			this.beehive.pollen -= 10;
			this.beehive.honey -= 10;
			this.beehive.geleeRoyal += 1;
			success = true;
		} else {
			this.sendMessage(
				'Not enough ressources for producing gelee-royal',
				workingBee.playerActions[0].playerIDs
			);
			success = false;
		}
		connection.updateBeehive(this.beehive, this.roomName);
		return success;
	}

	handleCleaning(workingBee) {
		let success;
		if (this.beehive.dirtyHoneycombs > 0) {
			this.beehive.freeHoneycombs += 1;
			this.beehive.dirtyHoneycombs -= 1;
			success = true;
		} else {
			this.sendMessage(
				'There are no honeycombs to be cleaned',
				workingBee.playerActions[0].playerIDs
			);
			success = false;
		}
		connection.updateBeehive(this.beehive, this.roomName);
		return success;
	}

	sendMessage(message, clients) {
		connection.sendMessageToClients(message, clients, this.roomName);
	}

	removePlayer(playerID) {
		this.players.splice(playerID, 1);
		return this.players.length;
	}

	randomInt(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	}

	checkGameOver() {
		if (
			this.bees.length === 0 &&
			this.beehive.occupiedHoneycombs === 0 &&
			this.beehive.geleeRoyal === 0
		) {
			connection.gameOver(this.roomName, this.day, this.players);
		}
	}
}

module.exports = Game;
