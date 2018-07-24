const Connection = {};
let io;
const game = require('./serverGame.js');

Connection.start = param => {
	io = param;
	game.setConnection(Connection);
	io.on('connection', socket => {
		socket.on('newplayer', gameObjects => {
			if (game.lastPlayerID === 0) {
				game.start(gameObjects);
				socket.emit('newGame');
			}
			socket.player = game.newPlayer();
			socket.emit('gameObjects', game.allObjects());

			socket.broadcast.emit('newplayer', socket.player);

			socket.on('goTo', moveData => {
				const currentBee = Connection.getBeeFromId(moveData.beeID);
				if (moveData.type === 1) {
					if (currentBee.status !== 3) {
						io.emit('move', game.performActionForBee(socket.player.id, moveData));
					}
				} else {
					if (currentBee.status !== 3) {
						io.emit('move', game.performActionForBee(socket.player.id, moveData));
					}
				}
			});

			socket.on('synchronizeBeehive', updatedBeehive => {
				Connection.updateGameObject(
					game.handleSynchronizeBeehive(updatedBeehive)
				); // Io.emit('updateGameObject', game.handleSynchronizeBeehive(updatedBeehive));
			});

			socket.on('synchronizeBee', updatedBee => {
				Connection.updateGameObject(game.handleSynchronizeBee(updatedBee));
			});

			socket.on('synchronizeFlower', updatedFlower => {
				Connection.updateGameObject(
					game.handleSynchronizeFlower(updatedFlower)
				);
			});

			socket.on('emptyActions', beeId => {
				Connection.updateGameObject(game.emptyActionLogOfBee(beeId));
			});

			socket.on('beeIsIdleForTooLong', beeId => {
				game.handleBeeIsIdleForTooLong(beeId);
			});

			socket.on('setTimerForBee', bee, seconds => {
				game.setTimerForBee(bee, seconds);
			}

			socket.on('disconnect', () => {
				game.players.splice(socket.player.id, 1);
				io.emit('remove', socket.player.id);
			});
		});
	});
};

Connection.activateBee = bee => {
	io.emit('activateBee', bee);
}

Connection.getBeeFromId = id => {
	let bee = game.bees.find(item => item.id === id);
	if (bee === undefined) {
			bee = game.hiveBees.find(item => item.id === id);
	}
	return bee;
}

Connection.updateBees = bees => {
	io.emit('updateBees', bees);
};

Connection.updateGameObject = updatedGameObject => {
	io.emit('updateGameObject', updatedGameObject);
};

Connection.switchHiveBeesOutside = bee => {
	io.emit('switchHiveBeesOutside', bee);
}

module.exports = Connection;
