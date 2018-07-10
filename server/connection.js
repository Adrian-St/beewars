const Connection = {};
let io;
const game = require('./serverGame.js');

Connection.start = param => {
	io = param;
	console.log(game)
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

			socket.on('requestMovement', moveData => {
				game.handleMovementRequest(socket.player.id, moveData);
				// The server answers with the (updated) bee
			});

			socket.on('disconnect', () => {
				game.players.splice(socket.player.id, 1);
				io.emit('remove', socket.player.id);
			});
		});
	});
};

Connection.updateBee = updatedBee => {
	io.emit('stateOfBee', updatedBee);
};

Connection.updateBeehive = updatedBeehive => {
	io.emit('stateOfBeehive', updatedBeehive);
};

Connection.updateFlower = updatedFlower => {
	io.emit('stateOfFlower', updatedFlower);
};

module.exports = Connection;
