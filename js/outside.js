import { game } from './main.js';
import Menu from './menu.js';
import Client from './client.js';
import Beehive from './beehive.js';
import Flower from './flower.js';
import Wasp from './wasp.js';
import Game from './game.js';
import State from './state.js';

class Outside extends State {
	constructor() {
		super();

		this.beehiveSprite = {}; // A Sprite
		this.flowerSprites = {}; // A Group of sprites
		this.flowers = [];
		this.wasps = [];
		this.rain = null;
		this.rainDisplay = null;
		this.rainDisplayMinOffset = 27;
		this.rainDisplayMaxOffset = 276;
		this.rainPointer = null;
		this.temperatureDisplay = null;
		this.temperatureDisplayMinOffset = 40;
		this.temperatureDisplayMaxOffset = 288;
		this.temperaturePointer = null;
		this.frogSprites = null;
		this.beehivePosition = {
			x: 0,
			y: 0
		};
		this.outsideButton = null;
		this.outsideMap = null;
		this.outsideLayers = [];
		this.stateName = 'OUTSIDE';
	}

	enableState() {
		super.enableState();

		this.beehiveSprite.visible = true;
		this.flowers.forEach(flower => {
			flower.sprite.visible = true;
		});
		this.wasps.forEach(wasp => {
			wasp.sprite.visible = true;
		});
		this.outsideLayers.forEach(layer => {
			layer.visible = true;
		});
		this.frogSprites.children.forEach(object => {
			object.visible = true;
		});
		this.graphics.visible = true;
		this.outsideMap.visible = true;
		this.outsideButton.visible = true;
		this.rain.visible = true;
		this.rainDisplay.visible = true;
		this.rainPointer.visible = true;
		this.temperatureDisplay.visible = true;
		this.temperaturePointer.visible = true;
	}

	disableState() {
		super.disableState();

		this.beehiveSprite.visible = false;
		this.flowers.forEach(flower => {
			flower.sprite.visible = false;
		});
		this.wasps.forEach(wasp => {
			wasp.sprite.visible = false;
		});
		this.outsideLayers.forEach(layer => {
			layer.visible = false;
		});
		this.frogSprites.children.forEach(object => {
			object.visible = false;
		});
		this.graphics.visible = false;
		this.outsideMap.visible = false;
		this.outsideButton.visible = false;
		this.rain.visible = false;
		this.rainDisplay.visible = false;
		this.rainPointer.visible = false;
		this.temperatureDisplay.visible = false;
		this.temperaturePointer.visible = false;
	}

	initialize() {
		super.initialize();

		this.outsideMap = Game.add.tilemap('map');
		this.addBackground();
		this.addFlowers();
		this.addFrogs();
		this.addRain();
		this.addBeehive();
		this.addTopMenu();
		this.graphics = Game.add.graphics(0, 0);
	}

	addBackground() {
		this.outsideMap.addTilesetImage('Honeycomb-Background')
		this.outsideMap.addTilesetImage('grass');
		this.outsideMap.addTilesetImage('tree');
		this.outsideMap.addTilesetImage('river');
		this.outsideLayers.push(this.outsideMap.createLayer('Background'));
		this.outsideLayers[0].resizeWorld();
		this.outsideLayers[0].inputEnabled = true;
		this.outsideLayers[0].events.onInputUp.add(() => {
			Menu.createHiveMenu(Game.beehive, this.bees.length);
			this.deactivateAllOtherShadows({});
			this.stopAllOtherShadowTweens({});
			this.graphics.clear();
		}, this);
		this.outsideLayers.push(this.outsideMap.createLayer('TreeAndRiver'));
	}

	addTopMenu() {
		super.addTopMenu();
		this.outsideButton = game.add.button(6, 6, 'switch', Game.switchToInside, Game, 1, 0, 2);
		this.rainDisplay = game.add.image(320, 6, 'rain-button');
		this.rainPointer = game.add.sprite(400, 16, 'pointer');
		this.temperatureDisplay = game.add.image(640, 6, 'temperature-button');
		this.temperaturePointer = game.add.sprite(700, 16, 'pointer');
	}

	addFlowers() {
		this.outsideMap.addTilesetImage('flowers');
		this.flowerSprites = Game.add.group();
		this.outsideMap.createFromObjects(
			'Flowers',
			'flower-white',
			'flowers',
			0,
			true,
			false,
			this.flowerSprites
		);
		this.outsideMap.createFromObjects(
			'Flowers',
			'flower-purple',
			'flowers',
			1,
			true,
			false,
			this.flowerSprites
		);
		this.outsideMap.createFromObjects(
			'Flowers',
			'flower-red',
			'flowers',
			2,
			true,
			false,
			this.flowerSprites
		);
		this.outsideMap.createFromObjects(
			'Flowers',
			'flower-yellow',
			'flowers',
			3,
			true,
			false,
			this.flowerSprites
		);
		this.flowerSprites.children.forEach(object => {
			object.anchor.setTo(0.5);
			object.inputEnabled = true;
			object.events.onInputUp.add(this.getCoordinates, this);
		});
	}

	addBeehive() {
		this.outsideMap.addTilesetImage('beehive');
		const beehiveGroup = Game.add.group();
		this.outsideMap.createFromObjects(
			'Beehive',
			'beehive',
			'beehive',
			0,
			true,
			false,
			beehiveGroup
		);
		this.beehiveSprite = beehiveGroup.getAt(0);
		this.beehiveSprite.inputEnabled = true;
		this.beehiveSprite.events.onInputUp.add(this.getCoordinates, this);

		// This is the exact position of the entrance of the beehive-image
		this.beehivePosition.x = this.beehiveSprite.centerX + 30;
		this.beehivePosition.y = this.beehiveSprite.centerY + 50;
	}

	addBeehiveObject(beehive) {
		Game.beehive = new Beehive(beehive, this.beehiveSprite);
	}

	addEnemies(waspCollection) {
		for (let i = 0; i < waspCollection.length; i++) {
			this.createWasp(waspCollection[i]);
		}
	}

	addRain() {
		this.rain = game.add.emitter(game.world.centerX, 0, 400);

		this.rain.width = game.world.width;
		// Emitter.angle = 30; // uncomment to set an angle for the rain.

		this.rain.makeParticles('rain');

		this.rain.minParticleScale = 0.1;
		this.rain.maxParticleScale = 0.5;

		this.rain.setYSpeed(300, 500);
		this.rain.setXSpeed(-5, 5);

		this.rain.minRotation = 0;
		this.rain.maxRotation = 0;

		this.rain.start(false, 1600, 5, 0);
		this.rain.on = false;
	}

	addFrogs() {
		this.outsideMap.addTilesetImage('frog');
		this.frogSprites = game.add.group();
		this.outsideMap.createFromObjects(
			'Frogs',
			'',
			'frog',
			0,
			true,
			false,
			this.frogSprites
		);
		this.frogSprites.children.forEach(object => {
			object.anchor.setTo(0.5);
		});
	}

	addNewBee(serverBee) {
		const addedBee = super.addNewBee(serverBee);
		if (Game.currentState === 'INSIDE') addedBee.sprite.visible = false;
	}


	addFlowerObjects(flowers) {
		for (let i = 0; i < flowers.length; i++) {
			this.flowers.push(new Flower(flowers[i], this.flowerSprites.children[i]));
		}
	}

	flowerForId(id) {
		return this.flowers.find(flower => {
			return flower.id === id;
		});
	}

	getFlowerForSprite(sprite) {
		for (let i = 0; i < this.flowers.length; i++) {
			if (this.flowers[i].sprite === sprite) {
				return this.flowers[i];
			}
		}
	}

	getFlowerForPosition(position) {
		for (let i = 0; i < this.flowers.length; i++) {
			if (
				this.flowers[i].sprite.position.x === position.x &&
				this.flowers[i].sprite.position.y === position.y
			) {
				return this.flowers[i];
			}
		}
	}

	getCoordinates(object) {
		if (object.name === 'beehive') {
			if (this.isABeeSelected()) {
				this.requestGoToHive();
			} else {
				Menu.createHiveMenu(Game.beehive, this.bees.length);
			}
		} else if (
			['flower-white', 'flower-red', 'flower-purple', 'flower-yellow'].includes(
				object.name
			)
		) {
			if (this.isABeeSelected()) {
				const flower = this.getFlowerForSprite(object);
				this.requestGoToFlower(flower);
			} else {
				Menu.createFlowerMenu(this.getFlowerForSprite(object));
			}
		}
	}

	requestGoToHive() {
		if (this.isABeeSelected()) {
			const { x } = this.beehivePosition;
			const { y } = this.beehivePosition;
			Client.requestMovement(this.createMoveData(x, y));
		}
	}

	requestGoToFlower(flower) {
		if (this.isABeeSelected()) {
			const { x } = flower.sprite.position;
			const { y } = flower.sprite.position;
			Client.requestMovement(this.createMoveData(x, y));
		}
	}

	waspForId(id) {
		return this.wasps.find(wasp => {
			return wasp.id === id;
		});
	}

	createWasp(serverWasp) {
		const sprite = game.add.sprite(serverWasp.x, serverWasp.y, 'wasp');
		sprite.anchor.setTo(0.5);
		const wasp = new Wasp(serverWasp, sprite);
		this.wasps.push(wasp);
	}

	updateWasp(serverWasp) {
		const wasp = this.waspForId(serverWasp.id);
		wasp.health = serverWasp.health;
		wasp.speed = serverWasp.speed;

		if (serverWasp.moving) {
			wasp.startTween({ x: serverWasp.target.x, y: serverWasp.target.y });
		}
	}

	removeWasp(serverWasp) {
		const deletedWasp = this.waspForId(serverWasp.id);
		deletedWasp.sprite.destroy();
		const index = this.wasps.indexOf(deletedWasp);
		this.wasps.splice(index, 1);
	}

	updateFlower(flower) {
		const flowerToBeUpdated = this.flowerForId(flower.id);
		flowerToBeUpdated.pollen = flower.pollen;
		flowerToBeUpdated.nectar = flower.nectar;

		if (
			document.getElementById('menu').firstChild.id ===
			'flowerMenu-' + flowerToBeUpdated.id
		) {
			Menu.createFlowerMenu(flowerToBeUpdated);
		}
	}

	updateBeehive(beehive) {
		Game.beehive.pollen = beehive.pollen;
		Game.beehive.honey = beehive.honey;
		Game.beehive.honeycombs = beehive.honeycombs;
		Game.beehive.freeHoneycombs = beehive.freeHoneycombs;
		Game.beehive.dirtyHoneycombs = beehive.dirtyHoneycombs;
		Game.beehive.occupiedHoneycombs = beehive.occupiedHoneycombs;
		Game.beehive.geleeRoyal = beehive.geleeRoyal;

		if (document.getElementById('menu').firstChild.id === 'hiveMenu') {
			Menu.createHiveMenu(Game.beehive, this.bees.length);
		}
	}

	updateWeater(weather) {
		const normedChanceOfRain = this.calculateNormedValue(weather.chanceOfRain, 0, 100);
		this.rainPointer.x = this.calculatePostion(
			this.rainDisplay.x + this.rainDisplayMinOffset,
			this.rainDisplay.x + this.rainDisplayMaxOffset,
			normedChanceOfRain);
		const normedTemperature = this.calculateNormedValue(weather.temperature, -20, 40);
		this.temperaturePointer.x = this.calculatePostion(
			this.temperatureDisplay.x + this.temperatureDisplayMinOffset,
			this.temperatureDisplay.x + this.temperatureDisplayMaxOffset,
			normedTemperature);
		if(weather.raining) {
			this.rain.on = true;
		}
		else {
			this.rain.on = false;
		}
	}

	calculateNormedValue(value, min, max) {
		return ((value - min) / (max - min));
	}

	calculatePostion(x, y, value) {
		return (x*(1 - value) + y*value);
	}
}

export default Outside;
