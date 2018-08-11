const Connection = {};
let io;
const game = require('./serverGame.js');

Connection.start = param => {
	io = param;
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

Connection.moveBeeToOutside = updatedBee => {
	io.emit('moveBeeOut', updatedBee);
};

Connection.moveBee = updatedBee => {
	io.emit('moveBee', updatedBee);
};

Connection.stopBee = updatedBee => {
	io.emit('stopBee', updatedBee);
};

Connection.updateBeehive = updatedBeehive => {
	io.emit('stateOfBeehive', updatedBeehive);
};

Connection.updateFlower = updatedFlower => {
	io.emit('stateOfFlower', updatedFlower);
};

Connection.spawnNewBee = bee => {
	io.emit('newBee', bee);
};

Connection.killBee = bee => {
	io.emit('deadBee', bee);
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
};

Connection.advanceDay = () => {
	io.emit('dayPassed');
};

Connection.sendMessageToClients = (message, clients) => {
	Object.keys(io.sockets.connected).forEach(function(socketID){
        const socket = io.sockets.connected[socketID];
        const player = socket.player;
        if(player){
        	if(clients.includes(player.id)) Connection.sendMessageToClient(message, socket);
        } //console.log(io.sockets.connected[socketID])
    });
}

Connection.sendMessageToClient = (message, socket) => {
	socket.emit('showMessage', message);
};

Connection.broadcastMessage = (message, socket) => {
	io.emit('showMessage', message);
};

module.exports = Connection;
