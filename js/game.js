import { game } from './main.js';
import Menu from './menu.js';
import Client from './client.js';
import Bee from './bee.js';
import Inside from './inside.js';
import Outside from './outside.js';

class Game {
	init() {
		this.resetVariables();
		game.stage.disableVisibilityChange = true;
	}

	preload() {
		game.load.tilemap(
			'map',
			'/assets/map/outside_map.json',
			null,
			Phaser.Tilemap.TILED_JSON
		);
		game.load.tilemap(
			'inside_map',
			'/assets/map/inside_map.json',
			null,
			Phaser.Tilemap.TILED_JSON
		);
		game.load.spritesheet('grass', '/assets/map/grass.png', 32, 32);
		game.load.spritesheet('flowers', '/assets/map/flowers.png', 64, 64);
		game.load.spritesheet('beehive', '/assets/map/beehive.png', 128, 160);
		game.load.spritesheet(
			'Full-Beehive',
			'/assets/honeycombs/Full-Beehive.png',
			448,
			134
		);
		game.load.spritesheet('inside-tree', '/assets/map/inside-tree.png', 32, 32);
		game.load.spritesheet(
			'Workarea-icons',
			'/assets/honeycombs/Workarea-icons.png',
			100,
			72
		);
		game.load.spritesheet(
			'inside-button',
			'/assets/Menu/inside-button.png',
			254,
			52
		);
		game.load.spritesheet('outside-button', '/assets/Menu/button.png', 254, 52);
		game.load.spritesheet(
			'quit-button',
			'/assets/Menu/quit-button.png',
			100,
			52
		);
		game.load.spritesheet(
			'sprite',
			'/assets/sprites/bee-with-borders.png',
			32,
			32
		);
		game.load.spritesheet(
			'wasp',
			'/assets/sprites/wasp-with-borders.png',
			32,
			32
		);
		game.load.image('progressbar', '/assets/sprites/innerProgessBar.png');
		game.load.image(
			'message-background',
			'/assets/sprites/message-background.png'
		);
		game.load.spritesheet('rain', '/assets/sprites/rain.png', 17, 17);
		game.load.spritesheet('frog', '/assets/sprites/frog.png', 64, 64);
		game.load.spritesheet(
			'Honeycomb-Background',
			'/assets/map/Honeycomb-Background.png',
			64,
			64
		);
		game.load.image('tree', '/assets/map/tree.png');
		game.load.image('river', '/assets/map/river.png');
		game.load.image('rain-button', '/assets/Menu/rain-button.png');
		game.load.image(
			'temperature-button',
			'/assets/Menu/temperature-button.png'
		);
		game.load.image('pointer', '/assets/Menu/pointer.png');
	}

	create() {
		this.outsideState = new Outside();
		this.insideState = new Inside();
		this.outsideState.initialize();
		this.addTopMenu();
		document.getElementById('menu').style.display = 'block';
		Client.startConnection();
		Client.registerNewPlayer();
	}

	resetVariables() {
		this.beehive = {}; // The attributes from beehive are used in inside and outside but the sprite is only shown outside
		this.outsideState = null;
		this.insideState = null;
		this.currentState = null;
		this.day = 0;
		this.msgBox = null;
		this.dayDisplay = null;
		this.quitButton = null;
		this.initialTipTimer = null;
		this.insideTipTimer = null;
	}

	addTopMenu() {
		this.dayDisplay = game.add.text(1020, 8, 'Day: 0', {
			font: 'bold 28pt Arial'
		});
		this.quitButton = this.add.button(
			6,
			6,
			'quit-button',
			() => window.location.replace('/'),
			2,
			1,
			0
		);
	}

	addProperties(data) {
		this.outsideState.addFlowerObjects(data.flowers);
		this.outsideState.addBeehiveObject(data.beehive);
		this.outsideState.addBees(data.bees);
		this.outsideState.addEnemies(data.enemies);
		this.insideState.addBees(data.insideBees);
		this.switchToOutside(); //

		Menu.createHiveMenu(
			this.beehive.getSendableBeehive(),
			this.outsideState.bees.length,
			this.outsideState.name
		);
		this.initialTipTimer = setTimeout(this.showInitialTip.bind(this), 5000);
		this.insideTipTimer = setTimeout(this.showInsideTip.bind(this), 30000);
		// This.setUpUserInput();
	}

	addNewBee(serverBee) {
		const sprite = game.add.sprite(serverBee.x, serverBee.y, 'sprite');
		sprite.anchor.setTo(0.5);
		sprite.inputEnabled = true;
		sprite.events.onInputUp.add(this.onUp, this);
		const bee = new Bee(serverBee, sprite);
		this.bees.push(bee);
	}

	switchToInside() {
		this.currentState = this.insideState;
		this.outsideState.disableState();
		this.insideState.enableState();
		if (this.insideTipTimer) clearTimeout(this.insideTipTimer);
	}

	switchToOutside() {
		this.currentState = this.outsideState;
		this.insideState.disableState();
		this.outsideState.enableState();
	}

	onTweenRunning() {
		this.insideState.onTweenRunning();
		this.outsideState.onTweenRunning();
	}

	updateBee(bee) {
		// The bee that needs to be updated is either in this.insideState.bees or in this.outsideState.bees
		const insideBee = this.insideState.updateBee(bee);
		const outsideBee = this.outsideState.updateBee(bee);
		const beeToBeUpdated = insideBee ? insideBee : outsideBee;
		return beeToBeUpdated;
	}

	moveBeeFormInsideToOutside(serverBee) {
		const bee = this.insideState.beeForId(serverBee.id);
		const index = this.insideState.bees.indexOf(bee);
		bee.sprite.visible = !bee.sprite.visible;
		bee.sprite.position.x = serverBee.x;
		bee.sprite.position.y = serverBee.y;
		bee.sprite.scale.setTo(1.3, 1.3);
		if (bee.shadow) {
			bee.shadow.destroy();
			bee.shadow = null;
		}
		if (bee.innerProgressBar) {
			bee.innerProgressBar.destroy();
			bee.innerProgressBar = null;
		}
		bee.status = Bee.STATES.IDLE;
		bee.type = 0; // Outside bee
		this.outsideState.setUpUserInputForBee(bee);
		this.outsideState.bees.push(bee);
		this.insideState.bees.splice(index, 1);
	}

	moveBee(bee) {
		const action = bee.playerActions[0];

		bee.stopTween(); // In case the bee was flying to another flower (or hive)
		if (bee.shadowTween) {
			bee.stopShadowTween();
		}
		bee.startTween({ x: action.target.x, y: action.target.y });

		if (bee.shadow) {
			bee.startShadowTween({ x: action.target.x, y: action.target.y });
		}
	}

	stopBee(bee) {
		bee.stopTween(); // In case the bee was flying to another flower (or hive)
		if (bee.shadowTween) {
			bee.stopShadowTween();
		}

		if (bee.shadow) {
			if (this.outsideState.bees.includes(bee))
				this.outsideState.showAllActions(bee);
			if (this.insideState.bees.includes(bee))
				this.insideState.showAllActions(bee);
		}
	}

	removeBee(bee) {
		this.insideState.removeBee(bee);
		this.outsideState.removeBee(bee);
	}

	dayPassed(day) {
		this.outsideState.bees.forEach(bee => {
			bee.age++;
			if (bee.isSelected()) {
				Menu.createBeeMenu(bee);
			}
		});
		this.insideState.bees.forEach(bee => {
			bee.age++;
			if (bee.isSelected()) {
				Menu.createBeeMenu(bee);
			}
		});
		this.day = day;
		this.dayDisplay.text = 'Day: ' + this.day;
	}

	updateBeehive(beehive) {
		this.beehive.pollen = beehive.pollen;
		this.beehive.honey = beehive.honey;
		this.beehive.honeycombs = beehive.honeycombs;
		this.beehive.freeHoneycombs = beehive.freeHoneycombs;
		this.beehive.dirtyHoneycombs = beehive.dirtyHoneycombs;
		this.beehive.occupiedHoneycombs = beehive.occupiedHoneycombs;
		this.beehive.geleeRoyal = beehive.geleeRoyal;

		this.insideState.updateBeehiveDisplay(beehive);
		if (document.getElementById('menu').firstChild.id === 'hiveMenu') {
			Menu.createHiveMenu(
				this.beehive,
				this.currentState.bees.length,
				this.currentState.name
			);
		}
	}

	showMessage(message, timer = 4000) {
		this.createMessage(message);
		setTimeout(this.destroyMessage.bind(this), timer);
	}

	createMessage(message, w = 600, h = 50) {
		this.destroyMessage();

		this.msgBox = game.add.group();
		const back = game.add.sprite(0, 0, 'message-background');
		const text = game.add.text(0, 0, message);
		text.wordWrap = true;
		text.wordWrapWidth = w * 0.9;
		text.setStyle({ font: '22px Arial' });

		back.width = w;
		back.height = h;

		this.msgBox.add(back);
		this.msgBox.add(text);

		this.msgBox.x = game.width / 2 - this.msgBox.width / 2;
		this.msgBox.y = 75;

		text.x = back.width / 2 - text.width / 2;
		text.y = back.height / 2 - text.height / 2;
	}

	destroyMessage() {
		if (this.msgBox) {
			this.msgBox.destroy();
		}
	}

	showInitialTip() {
		this.showMessage('1. Select a bee', 3000);
		setTimeout(
			() => this.showMessage('2. Select a flower as a destination'),
			3000
		);
	}

	showInsideTip() {
		this.showMessage("Click 'Switch inside'");
	}
}

export default new Game();
// Singleton
