import { game } from './main.js';
import Menu from './menu.js';
import Client from './client.js';
import Beehive from './beehive.js';
import Flower from './flower.js';
import Bee from './bee.js';
import Wasp from './wasp.js';
import Inside from './inside.js';
import Outside from './outside.js';

class Game {
	constructor() {
		this.beehive = null; // the attributes from beehive are used in inside and outside but the sprite is only shown outside
		this.outsideState = null;
		this.insideState = null;
		this.currentState = '';
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
		game.load.spritesheet(
			'switch',
			'assets/sprites/button_sprite_sheet.png',
			193,
			71
		);
		game.load.image('sprite', 'assets/sprites/bees64px-version2.png');
		game.load.image('wasp', 'assets/sprites/wasp.png')
		game.load.image('progressbar', 'assets/sprites/innerProgessBar.png');
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
		this.insideState.addBees(data.insideBees);
		this.switchToOutside(); // 

		Menu.createHiveMenu(this.beehive.getSendableBeehive(), this.outsideState.length);
		//this.setUpUserInput();
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
		//the bee that needs to be updated is either in this.insideState.bees or in this.outsideState.bees
		const insideBee = this.insideState.updateBee(bee);
		const outsideBee = this.outsideState.updateBee(bee);
		const beeToBeUpdated = (insideBee)? insideBee : outsideBee;
		return beeToBeUpdated;
	}

	moveBeeFormInsideToOutside(serverBee) {
		let bee = this.insideState.beeForId(serverBee.id);
		const index = this.insideState.bees.indexOf(bee);
		bee.sprite.visible = !bee.sprite.visible
		bee.sprite.position.x = serverBee.x;
		bee.sprite.position.y = serverBee.y;
		this.outsideState.setUpUserInputForBee(bee);
		this.outsideState.bees.push(bee);
		this.insideState.bees.splice(index,1);
	}

	moveBee(bee) {
		const action = bee.playerActions[0];

		bee.stopTween(); // In case the bee was flying to another flower (or hive)
		if (bee.shadowTween) {
			bee.stopShadowTween();
		}

		if (action.stop) {
			if (bee.shadow) Game.showAllActions(bee);
			return;
		}

		bee.startTween({ x: action.target.x, y: action.target.y });

		if (bee.shadow) {
			bee.startShadowTween({ x: action.target.x, y: action.target.y });
		}
	}

	removeBee(bee) {
		this.insideState.removeBee(bee);
		this.outsideState.removeBee(bee);
	}

}

export default new Game();
// Singleton
