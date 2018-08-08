import { game } from './main.js';
import Menu from './menu.js';
import Client from './client.js';
import Bee from './bee.js';
import Inside from './inside.js';
import Outside from './outside.js';

class Game {
	constructor() {
<<<<<<< HEAD
		this.beehive = null; // The attributes from beehive are used in inside and outside but the sprite is only shown outside
		this.outsideState = null;
		this.insideState = null;
		this.currentState = '';
=======
		this.beehiveSprite = {}; // A Sprite
		this.flowerSprites = {}; // A Group of sprites
		this.beehive = {};
		this.flowers = [];
		this.bees = [];
		this.wasps = [];
		this.ressourceLabel = '';
		this.beeLabel = '';
		this.beehivePosition = {
			x: 0,
			y: 0
		};
		this.line = null;
		this.graphics = null;
		this.rain = null;
		this.multipleBeeSelectionStatus = false;
		this.multipleBeeSelectionPosition = {
			x: 0,
			y: 0
		};
		this.multipleBeeSelectionCollection = [];
		this.insideMap = null;
		this.insideButton = null;
		this.insideLayers = [];
		this.insideWorkareas = {};
		this.insideGraphics = null;
		this.day = 0;
		this.dayDisplay = null;
		this.rainDisplay = null;
		this.rainDisplayMinOffset = 27;
		this.rainDisplayMaxOffset = 276;
		this.rainPointer = null;
		this.temperatureDisplay = null;
		this.temperatureDisplayMinOffset = 40;
		this.temperatureDisplayMaxOffset = 288;
		this.temperaturePointer = null;
>>>>>>> 783e7cabd7245c669df29a51f78ba49022022e96
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
			'assets/menu/button.png',
			254,
			52
		);
		game.load.image('sprite', 'assets/sprites/bees64px-version2.png');
		game.load.image('wasp', 'assets/sprites/wasp.png');
		game.load.image('progressbar', 'assets/sprites/innerProgessBar.png');
		game.load.spritesheet('rain', 'assets/sprites/rain.png', 17, 17);
		game.load.spritesheet('frog', 'assets/sprites/frog.png', 64, 64);
		game.load.spritesheet('Honeycomb-Background', 'assets/map/Honeycomb-Background.png', 64, 64);
		game.load.image('tree', 'assets/map/tree.png');
		game.load.image('river', 'assets/map/river.png');
		game.load.image('rain-button', 'assets/menu/rain-button.png');
		game.load.image('temperature-button', 'assets/menu/temperature-button.png');
		game.load.image('pointer', 'assets/menu/pointer.png');
	}

	create() {
<<<<<<< HEAD
		this.outsideState = new Outside();
		this.insideState = new Inside();
		this.outsideState.initialize();
=======
		const map = game.add.tilemap('map');
		this.addBackground(map);
		this.addFlowers(map);
		this.addFrogs(map);
		this.addBeehive(map);
		this.addRain();
		this.addTopMenu();
		this.graphics = game.add.graphics(0, 0);
		Client.registerNewPlayer();
	}

	addBackground(map) {
		map.addTilesetImage('Honeycomb-Background')
		map.addTilesetImage('grass');
		map.addTilesetImage('tree');
		map.addTilesetImage('river');
		const layer = map.createLayer('Background');
		layer.resizeWorld();
		layer.inputEnabled = true;
		layer.events.onInputUp.add(() => {
			Menu.createHiveMenu(this.beehive, this.bees.length);
			this.deactivateAllOtherShadows({});
			this.stopAllOtherShadowTweens({});
			this.graphics.clear();
		}, this);
		map.createLayer('TreeAndRiver')
	}

	addTopMenu() {
		game.add.button(6, 6, 'switch', this.switchToInside, this, 1, 0, 2);
		this.rainDisplay = game.add.image(320, 6, 'rain-button');
		this.rainPointer = game.add.sprite(400, 16, 'pointer');
		this.temperatureDisplay = game.add.image(640, 6, 'temperature-button');
		this.temperaturePointer = game.add.sprite(700, 16, 'pointer');
		this.dayDisplay = game.add.text(1000, 8, 'Day: 0', {font: 'bold 28pt Raleway'});
	}

	addRain() {
		this.rain = game.add.emitter(game.world.centerX, 0, 400);

		this.rain.width = game.world.width;
		// emitter.angle = 30; // uncomment to set an angle for the rain.

		this.rain.makeParticles('rain');

		this.rain.minParticleScale = 0.1;
		this.rain.maxParticleScale = 0.5;

		this.rain.setYSpeed(300, 500);
		this.rain.setXSpeed(-5, 5);

		this.rain.minRotation = 0;
		this.rain.maxRotation = 0;
>>>>>>> 783e7cabd7245c669df29a51f78ba49022022e96

		Client.registerNewPlayer();
	}

	addProperties(data) {
		this.outsideState.addFlowerObjects(data.flowers);
		this.outsideState.addBeehiveObject(data.beehive);
		this.outsideState.addBees(data.bees);
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
		this.bees.forEach(bee => {
			bee.age ++;
			if(bee.isSelected()) {
				Menu.createBeeMenu(bee);
			}
		});
		this.advanceDay();
	}

	advanceDay() {
		this.day++;
		this.dayDisplay.text = 'Day: ' + this.day;
	}
}

export default new Game();
// Singleton
