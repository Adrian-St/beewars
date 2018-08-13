import Game from './game.js';

class Client {
	constructor() {
		this.room = 'room' + Math.floor(Math.random() * 10);
		this.socket = io.connect();

		console.log(this.room)

		this.socket.on('gameObjects', data => {
			Game.addProperties(data);

			this.socket.on('stateOfBee', bee => {
				// This includes updating the player actions
				Game.updateBee(bee);
			});

			this.socket.on('moveBee', bee => {
				const updatedBee = Game.updateBee(bee);
				if (bee.playerActions.length > 0) Game.moveBee(updatedBee);
			});

			this.socket.on('moveBeeOut', bee => {
				Game.moveBeeFormInsideToOutside(bee);
			});

			this.socket.on('stopBee', bee => {
				const updatedBee = Game.updateBee(bee);
				Game.stopBee(updatedBee);
			});

			this.socket.on('stateOfFlower', flower => {
				Game.outsideState.updateFlower(flower);
			});

			this.socket.on('stateOfBeehive', beehive => {
				Game.updateBeehive(beehive);
			});

			this.socket.on('newBee', bee => {
				Game.insideState.addNewBee(bee);
			});

			this.socket.on('deadBee', bee => {
				Game.removeBee(bee);
			});

			this.socket.on('createWasp', wasp => {
				Game.outsideState.createWasp(wasp);
			});

			this.socket.on('updateWasp', wasp => {
				Game.outsideState.updateWasp(wasp);
			});

			this.socket.on('removeWasp', wasp => {
				Game.outsideState.removeWasp(wasp);
			});

			this.socket.on('updateWeather', weather => {
				Game.updateWeater(weather);
			});

			this.socket.on('dayPassed', () => {
				Game.dayPassed();
			});

			this.socket.on('showMessage', (message) => {
				Game.showMessage(message);
			});
		});
	}

	registerNewPlayer() {
		this.socket.emit('newplayer', this.room);
	}

	requestMovement(moveData) {
		moveData.timestamp = Date.now();
		this.socket.emit('requestMovement', moveData); // Movedata is a light version of playerAction and it must have 'target', 'timespan' and 'beeId'
	}
}

export default new Client();
