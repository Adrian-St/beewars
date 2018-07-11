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
		Game.bees.push(new Bee(Game.lastBeeID, 0));
		Game.lastBeeID++;
	}
	for (let j = 0; j < 5; j++) {
		Game.hiveBees.push(new Bee(Game.lastBeeID, 1));
		Game.lastBeeID++;
	}
	Game.startTime = new Date();
	setInterval(Game.update, 5000);
};

Game.switchHiveBeesOutside = bee => {
	//delete bee from hiveBees
	//put bee in bees
	connection.switchHiveBeesOutside(bee);
	Game.hiveBees.splice( Game.hiveBees.indexOf(bee), 1 );
	Game.bees.push(bee);
}

Game.update = () => {
	for (let i = 0; i < Game.bees.length; i++) {
		connection.updateGameObject({ type: 'bee', content: Game.bees[i]});
		Game.bees[i].increaseAge(Game.bees[i],0);
		if (Game.hiveBees[i] != undefined) {
			connection.updateGameObject({ type: 'bee', content: Game.bees[i] });
		}
	}
	for (let i = 0; i < Game.hiveBees.length; i++) {
		connection.updateGameObject({ type: 'bee', content: Game.hiveBees[i]})
		Game.hiveBees[i].increaseAge(Game.hiveBees[i],1);
		if (Game.hiveBees[i] != undefined) {
			connection.updateGameObject({ type: 'bee', content: Game.hiveBees[i] });
		}
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
	if (Game.getBeeFromId(beeID).playerActions.length > 0) {
		Game.calculatePlayerExperienceAfterBeeArrived(beeID);
	}
	Game.getBeeFromId(beeID).playerActions = [];
	return { type: 'bee', content: Game.getBeeFromId(beeID) };
};

Game.calculatePlayerExperienceAfterBeeArrived = beeID => {
	const { playerActions } = Game.getBeeFromId(beeID);
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
	const beeToBeUpdated = Game.getBeeFromId(updatedBee.id);
	beeToBeUpdated.age = updatedBee.age;
	beeToBeUpdated.x = updatedBee.x;
	beeToBeUpdated.y = updatedBee.y;
	beeToBeUpdated.status = updatedBee.status;
	beeToBeUpdated.health = updatedBee.health;
	beeToBeUpdated.energy = updatedBee.energy;
	beeToBeUpdated.pollen = updatedBee.pollen;
	beeToBeUpdated.nectar = updatedBee.nectar;
	beeToBeUpdated.capacity = updatedBee.capacity;
	beeToBeUpdated.type = updatedBee.type;
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

Game.flowerForId = id => {
	return Game.flowers.find(flower => {
		return flower.id === id;
	});
};

Game.handleBeeIsIdleForTooLong = beeId => {
	const bee = Game.getBeeFromId(beeId);
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
