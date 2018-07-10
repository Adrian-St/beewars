import Game from './game.js';

class Client {
	constructor() {
		this.socket = io.connect();
		this.socket.on('newplayer', data => {
			Game.addNewPlayer(data);
		});
		this.socket.on('gameObjects', data => {
			Game.addProperties(data);

			this.socket.on('stateOfBee', bee => {
				// This includes updating the player actions
				const updatedBee = Game.updateBee(bee);
				if (bee.playerActions.length > 0) Game.moveBee(updatedBee);
			});

			this.socket.on('stateOfFlower', flower => {
				Game.updateFlower(flower);
			});

			this.socket.on('stateOfBeehive', beehive => {
				Game.updateBeehive(beehive);
			});
		});
	}

	registerNewPlayer() {
		this.socket.emit('newplayer');
	}

	requestMovement(moveData) {
		moveData.timestamp = Date.now();
		this.socket.emit('requestMovement', moveData); // Movedata is a light version of playerAction and it must have 'target', 'timespan' and 'beeId'
	}
}

export default new Client();
