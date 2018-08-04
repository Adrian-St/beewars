const Connection = {};
let io;
const game = require('./serverGame.js');

Connection.start = param => {
	io = param;
	console.log(game);
	game.setConnection(Connection);
	io.on('connection', socket => {
		socket.on('newplayer', () => {
			if (game.lastPlayerID === 0) {
				game.start();
				socket.emit('newGame');
			}

			socket.player = game.newPlayer();
			socket.emit('gameObjects', game.allObjects());

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

Connection.killBee = bee => {
	io.emit('deadBee', bee );
};

Connection.createWasp = wasp => {
	io.emit('createWasp', wasp);
};

Connection.updateWasp = wasp => {
	io.emit('updateWasp', wasp);
};

Connection.removeWasp = wasp => {
	io.emit('removeWasp', wasp);
};

Connection.updateWeather = weather => {
	io.emit('updateWeather', weather);
}

module.exports = Connection;
