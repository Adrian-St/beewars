import Menu from './menu.js';
import Game from './game.js';

class Client {
	constructor() {
		this.socket = io.connect();
		this.socket.on('newplayer', data => {
			Game.addNewPlayer(data);
		});
		this.socket.on('gameObjects', data => {
			Game.addProperties(data);

			this.socket.on('move', playerActions => {
				Game.playerActions(playerActions);
				Game.moveBee(playerActions[0]);
			});

			this.socket.on('remove', id => {
				Game.removePlayer(id);
			});

			this.socket.on('activateBee', bee => {
				Game.activateBee(bee);
			});

			this.socket.on('updateGameObject', updatedObject => {
				Game.updateGameObject(updatedObject);
			});

			this.socket.on('switchHiveBeesOutside', bee => {
				Game.switchHiveBeesOutside(bee);
			});
		});
	}

	askNewPlayer(gameObjects) {
		this.socket.emit('newplayer', gameObjects);
	}

	goTo(playerAction) {
		playerAction.timestamp = Date.now();
		this.socket.emit('goTo', playerAction);
	}

	synchronizeBeehive(beehive) {
		this.socket.emit('synchronizeBeehive', beehive);
		if (document.getElementById('menu').firstChild.id === 'hiveMenu') {
			Menu.createHiveMenu(beehive, Game.bees.length);
		}
	}

	synchronizeFlower(flower) {
		this.socket.emit('synchronizeFlower', flower);
		if (
			document.getElementById('menu').firstChild.id ===
			'flowerMenu' + flower.id
		) {
			Menu.createFlowerMenu(flower);
		}
	}

	synchronizeBee(bee) {
		this.socket.emit('synchronizeBee', bee);
		if (document.getElementById('menu').firstChild.id === 'beeMenu' + bee.id) {
			Menu.createBeeMenu(bee);
		}
	}

	emptyActions(bee) {
		this.socket.emit('emptyActions', bee.id);
	}

	beeIsIdleForTooLong(bee) {
		this.socket.emit('beeIsIdleForTooLong', bee.id);
	}

	setTimerForBee(bee, seconds) {
		this.socket.emit('setTimerForBee', bee, seconds);
	}
}

export default new Client();
