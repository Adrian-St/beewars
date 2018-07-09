Game = {};

const Bee = require('./serverBee.js');
const Flower = require('./serverFlower.js');
const Player = require('./player.js');

let connection; // = require('./connection.js');
Game.beehive = require('./serverBeehive.js');

Game.lastPlayerID = 0;
Game.lastBeeID = 0;
Game.lastFlowerID = 0;
Game.flowers = [];
Game.bees = [];
Game.hiveBees = [];
Game.players = [];

Game.setConnection = newConnection => {
	connection = newConnection;
};

Game.start = gameObjects => {
	for (let i = 0; i < gameObjects.flowers; i++) {
		Game.flowers.push(new Flower(Game.lastFlowerID));
		Game.lastFlowerID++;
	}
	for (let j = 0; j < 5; j++) {
		Game.bees.push(new Bee(Game.lastBeeID));
		Game.lastBeeID++;
	}
	for (let j = 0; j < 5; j++) {
		Game.hiveBees.push(new Bee(Game.lastBeeID));
		Game.lastBeeID++;
	}
	Game.startTime = new Date();
	setInterval(Game.update, 5000);
};

Game.update = () => {
	for (let i = 0; i < Game.bees.length; i++) {
		Game.bees[i].increaseAge();
		connection.updateGameObject({ type: 'bee', content: Game.bees[i] });
	}
};

Game.newPlayer = () => {
	const player = new Player(Game.lastPlayerID);
	Game.players.push(player);
	Game.lastPlayerID++;
	return player;
};

Game.allObjects = () => {
	return {
		bees: Game.bees,
		hiveBees: Game.hiveBees,
		players: Game.players,
		flowers: Game.flowers,
		beehive: Game.beehive
	};
};

Game.getBeeFromId = id => {
	let bee = Game.bees.find(item => item.id === id);
	if (bee === undefined) {
			bee = Game.hiveBees.find(item => item.id === id);
	}
	return bee;
}

Game.performActionForBee = (playerID, playerAction) => {
	const bee = Game.getBeeFromId(playerAction.beeID);	
	playerAction.playerID = playerID;
	return bee.performAction(playerAction);
};

Game.emptyActionLogOfBee = beeID => {
	if (Game.beeForId(beeID).playerActions.length > 0) {
		Game.calculatePlayerExperienceAfterBeeArrived(beeID);
	}
	Game.beeForId(beeID).playerActions = [];
	return { type: 'bee', content: Game.beeForId(beeID) };
};

Game.calculatePlayerExperienceAfterBeeArrived = beeID => {
	const { playerActions } = Game.beeForId(beeID);
	const positiveContributer = playerActions[0].playerIDs;
	positiveContributer.forEach(playerID =>
		Game.raiseExperienceForPlayer(playerID, 0.1)
	);
};

Game.raiseExperienceForPlayer = (playerID, value) => {
	Game.players.find(player => player.id === playerID).raiseExpBy(value);
};

Game.handleSynchronizeBeehive = updatedBeehive => {
	Game.beehive.pollen = updatedBeehive.pollen;
	Game.beehive.honey = updatedBeehive.honey;
	Game.beehive.honeycombs = updatedBeehive.honeycombs;
	return {
		type: 'beehive',
		content: Game.beehive
	};
};

Game.handleSynchronizeBee = updatedBee => {
	const beeToBeUpdated = Game.beeForId(updatedBee.id);
	beeToBeUpdated.age = updatedBee.age;
	beeToBeUpdated.x = updatedBee.x;
	beeToBeUpdated.y = updatedBee.y;
	beeToBeUpdated.status = updatedBee.status;
	beeToBeUpdated.health = updatedBee.health;
	beeToBeUpdated.energy = updatedBee.energy;
	beeToBeUpdated.pollen = updatedBee.pollen;
	beeToBeUpdated.nectar = updatedBee.nectar;
	beeToBeUpdated.capacity = updatedBee.capacity;
	return {
		type: 'bee',
		content: beeToBeUpdated
	};
};

Game.handleSynchronizeFlower = updatedFlower => {
	const flowerToBeUpdated = Game.flowerForId(updatedFlower.id);
	flowerToBeUpdated.pollen = updatedFlower.pollen;
	flowerToBeUpdated.nectar = updatedFlower.nectar;

	return {
		type: 'flower',
		content: flowerToBeUpdated
	};
};

Game.beeForId = id => {
	return Game.bees.find(bee => {
		return bee.id === id;
	});
};

Game.flowerForId = id => {
	return Game.flowers.find(flower => {
		return flower.id === id;
	});
};

Game.handleBeeIsIdleForTooLong = beeId => {
	const bee = Game.beeForId(beeId);
	let participatingPlayerIds = [];
	bee.playerActions.forEach(a => {
		participatingPlayerIds = participatingPlayerIds.concat(a.playerIDs);
	});
	Game.players.forEach(player => {
		if (!(player.id in participatingPlayerIds)) player.raiseExpBy(-0.1);
	});
	Game.players.forEach(a => console.log(a.experience));
};

module.exports = Game;
