import { game } from './main.js';
import Menu from './menu.js';
import Client from './client.js';
import Bee from './bee.js';
import Inside from './inside.js';
import Outside from './outside.js';

class Game {
	constructor() {
		this.beehive = {}; // The attributes from beehive are used in inside and outside but the sprite is only shown outside
		this.outsideState = null;
		this.insideState = null;
		this.currentState = '';
		this.day = 0;
		this.msgBox = null;
	}

	init() {
		game.stage.disableVisibilityChange = true;
	}

	preload() {
		game.load.tilemap(
			'map',
			'assets/map/outside_map.json',
			null,
			Phaser.Tilemap.TILED_JSON
		);
		game.load.tilemap(
			'inside_map',
			'assets/map/inside_map.json',
			null,
			Phaser.Tilemap.TILED_JSON
		);
		game.load.spritesheet('grass', 'assets/map/grass.png', 32, 32);
		game.load.spritesheet('flowers', 'assets/map/flowers.png', 64, 64);
		game.load.spritesheet('beehive', 'assets/map/beehive.png', 128, 160);
		game.load.spritesheet(
			'Honeycomb-Tileset-double',
			'assets/honeycombs/Honeycomb-Tileset-double.png',
			32,
			24
		);
		game.load.spritesheet('switch', 'assets/Menu/button.png', 254, 52);
		game.load.image('sprite', 'assets/sprites/bees64px-version2.png');
		game.load.image('wasp', 'assets/sprites/wasp.png');
		game.load.image('progressbar', 'assets/sprites/innerProgessBar.png');
		game.load.image('message-background', 'assets/sprites/message-background.png');
		game.load.spritesheet('rain', 'assets/sprites/rain.png', 17, 17);
		game.load.spritesheet('frog', 'assets/sprites/frog.png', 64, 64);
		game.load.spritesheet(
			'Honeycomb-Background',
			'assets/map/Honeycomb-Background.png',
			64,
			64
		);
		game.load.image('tree', 'assets/map/tree.png');
		game.load.image('river', 'assets/map/river.png');
		game.load.image('rain-button', 'assets/Menu/rain-button.png');
		game.load.image('temperature-button', 'assets/Menu/temperature-button.png');
		game.load.image('pointer', 'assets/Menu/pointer.png');
	}

	create() {
		this.outsideState = new Outside();
		this.insideState = new Inside();
		this.outsideState.initialize();

		Client.registerNewPlayer();
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
			this.outsideState.length
		);
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
		this.currentState = 'INSIDE';
		this.outsideState.disableState();
		this.insideState.enableState();
	}

	switchToOutside() {
		this.currentState = 'OUTSIDE';
		this.insideState.disableState();
		this.outsideState.enableState();
	}

	deactivateBee(bee, seconds) {
		bee.status = Bee.STATES.INACTIVE;

		this.createProgressBar(
			bee.sprite.x,
			bee.sprite.y,
			'progressbar',
			50,
			10,
			seconds,
			0
		);
		this.time.events.add(
			Phaser.Timer.SECOND * seconds,
			() => {
				this.activateBee(bee);
			},
			this
		);
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
		if (bee.shadow) {
			bee.shadow.destroy();
			bee.shadow = null;
		}
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

	dayPassed() {
		// This.insideState.dayPassed();
		this.outsideState.dayPassed();
		this.day++;
	}

	showMessage(message) {
		this.createMessage(message);
		setTimeout(this.destroyMessage.bind(this), 4000); // destroy message after 4 sec
	}

	createMessage(message, w = 600, h = 50) {
	    this.destroyMessage();

        this.msgBox = game.add.group();
        var back = game.add.sprite(0, 0, 'message-background');
        var text = game.add.text(0, 0, message);
        text.wordWrap = true;
        text.wordWrapWidth = w * .9;
        text.setStyle({font: "22px Arial"});

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
}

export default new Game();
// Singleton
