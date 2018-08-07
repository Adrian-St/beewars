import Game from './game.js';

class Client {
	constructor() {
		this.socket = io.connect();
		this.socket.on('gameObjects', data => {
			Game.addProperties(data);

			this.socket.on('stateOfBee', bee => {
				// This includes updating the player actions
				const updatedBee = Game.updateBee(bee);
			});

			this.socket.on('moveBee', bee => {
				const updatedBee = Game.updateBee(bee);
				if (bee.playerActions.length > 0) Game.moveBee(updatedBee);
			});

			this.socket.on('stopBee', bee => {
				const updatedBee = Game.updateBee(bee);
				Game.stopBee(updatedBee);
			});

			this.socket.on('stateOfFlower', flower => {
				Game.updateFlower(flower);
			});

			this.socket.on('stateOfBeehive', beehive => {
				Game.updateBeehive(beehive);
			});

			this.socket.on('deadBee', bee => {
				Game.removeBee(bee);
			});

			this.socket.on('createWasp', wasp => {
				Game.createWasp(wasp);
			});

			this.socket.on('updateWasp', wasp => {
				Game.updateWasp(wasp);
			});

			this.socket.on('removeWasp', wasp => {
				Game.removeWasp(wasp);
			});

			this.socket.on('updateWeather', weather => {
				Game.updateWeater(weather);
			});

			this.socket.on('dayPassed', () => {
				Game.dayPassed();
			})
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
