import { game } from './main.js';
import Menu from './menu.js';
import Client from './client.js';
import Beehive from './beehive.js';
import Flower from './flower.js';
import Bee from './bee.js';

class Game {
	constructor() {
		this.beehiveSprite = {}; // A Sprite
		this.flowerSprites = {}; // A Group of sprites
		this.beehive = {};
		this.flowers = [];
		this.bees = [];
		this.ressourceLabel = '';
		this.beeLabel = '';
		this.beehivePosition = {
			x: 0,
			y: 0
		};
		this.line = null;
		this.graphics = null;
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
		game.load.image('progressbar', 'assets/sprites/innerProgessBar.png');
	}

	create() {
		const map = game.add.tilemap('map');
		this.addBackground(map);
		this.addFlowers(map);
		this.addBeehive(map);
		game.add.button(20, 20, 'switch', this.switchToInside, this, 2, 1, 0);
		this.graphics = game.add.graphics(0, 0);
		Client.registerNewPlayer();
	}

	addBackground(map) {
		map.addTilesetImage('grass'); // Tilesheet is the key of the tileset in map's JSON file
		const layer = map.createLayer('Background');
		layer.resizeWorld();
		layer.inputEnabled = true;
		layer.events.onInputUp.add(() => {
			Menu.createHiveMenu(this.beehive, this.bees.length);
			this.deactivateAllOtherShadows({});
			this.stopAllOtherShadowTweens({});
			this.graphics.clear();
		}, this);
	}

	addFlowers(map) {
		map.addTilesetImage('flowers');
		this.flowerSprites = game.add.group();
		map.createFromObjects(
			'Flowers',
			'flower-white',
			'flowers',
			0,
			true,
			false,
			this.flowerSprites
		);
		map.createFromObjects(
			'Flowers',
			'flower-purple',
			'flowers',
			1,
			true,
			false,
			this.flowerSprites
		);
		map.createFromObjects(
			'Flowers',
			'flower-red',
			'flowers',
			2,
			true,
			false,
			this.flowerSprites
		);
		map.createFromObjects(
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

	addBeehive(map) {
		map.addTilesetImage('beehive');
		const beehiveGroup = game.add.group();
		map.createFromObjects(
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

		this.beehivePosition.x = this.beehiveSprite.centerX + 30;
		this.beehivePosition.y = this.beehiveSprite.centerY + 50;
	}

	addBeehiveObject(beehive) {
		this.beehive = new Beehive(beehive, this.beehiveSprite);
	}

	addFlowerObjects(flowers) {
		for (let i = 0; i < flowers.length; i++) {
			this.flowers.push(new Flower(flowers[i], this.flowerSprites.children[i]));
		}
	}

	addProperties(data) {
		this.addFlowerObjects(data.flowers);
		this.addBeehiveObject(data.beehive);
		for (let i = 0; i < data.bees.length; i++) {
			this.addNewBee(data.bees[i]);
		}
		Menu.createHiveMenu(this.beehive.getSendableBeehive(), this.bees.length);
		this.setUpUserInput();
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
		this.insideMap = game.add.tilemap('inside_map');
		this.addTaskAreas(this.insideMap);
		this.insideButton = game.add.button(
			20,
			20,
			'switch',
			this.switchToOutside,
			this,
			2,
			1,
			0
		);
	}

	switchToOutside() {
		this.insideMap.destroy();
		this.insideButton.destroy();
		this.insideLayers.forEach(layer => {
			layer.destroy();
		});
		this.insideLayers = [];
		this.insideGraphics.destroy();
	}

	addTaskAreas(map) {
		map.addTilesetImage('grass');
		this.insideLayers.push(map.createLayer('Grass'));
		map.addTilesetImage('Honeycomb-Tileset-double');
		this.insideLayers.push(map.createLayer('Honeycombs'));
		this.insideLayers[1].resizeWorld();
		this.insideLayers[1].inputEnabled = true;
		this.insideLayers[1].events.onInputUp.add(this.getWorkarea, this);
		this.insideGraphics = game.add.graphics(0, 0);
		map.objects['Inner Beehive'].forEach(object => {
			const points = [object.polygon.length];
			for (let i = 0; i < object.polygon.length; i++) {
				points[i] = {
					x: object.x + object.polygon[i][0],
					y: object.y + object.polygon[i][1]
				};
			}
			this.insideWorkareas[object.name] = new Phaser.Polygon(points);
			this.insideGraphics.lineStyle(10, 0xffd900, 1);
			this.insideGraphics.drawPolygon(this.insideWorkareas[object.name].points);
		});
	}

	getWorkarea(layer, pointer) {
		Object.keys(this.insideWorkareas).forEach(key => {
			const area = this.insideWorkareas[key];
			if (area.contains(pointer.worldX, pointer.worldY)) {
				this.sendClick(key);
			}
		});
	}

	sendClick(key) {
		// Logic of Clicking on an Area inside the hive
		console.log(key);
	}

	setUpUserInput() {
		this.bees.forEach(currentBee => {
			currentBee.sprite.events.onInputOver.add(() => {
				this.onBeeInputOver(currentBee);
			}, this);
			currentBee.sprite.events.onInputOut.add(() => {
				this.onBeeInputOut(currentBee);
			}, this);
		});
	}

	onBeeInputOver(currentBee) {
		const allBees = this.getAllBeesAtPosition(currentBee);
		const originalPosition = allBees[0].sprite.position.clone();

		if (allBees.length > 1 && !this.multipleBeeSelectionStatus) {
			this.displayMultipleBees(allBees, originalPosition);
			this.multipleBeeSelectionPosition.x = originalPosition.x;
			this.multipleBeeSelectionPosition.y = originalPosition.y;
			this.multipleBeeSelectionCollection = allBees.slice(0);
			this.multipleBeeSelectionStatus = true;
		}
	}

	onBeeInputOut(currentBee) {
		if (this.multipleBeeSelectionStatus) {
			if (this.multipleBeeSelectionCollection.indexOf(currentBee) > -1) {
				this.displaySingleBeeGroup();
				this.multipleBeeSelectionStatus = false;
			}
		}
	}

	displayMultipleBees(allBees, originalPosition) {
		const length = allBees.length * 40;
		const leftX = originalPosition.x - length / 2;

		for (let i = 0; i < allBees.length; i++) {
			const temp = leftX + i * allBees[i].sprite.width;
			allBees[i].sprite.position.x = temp;
		}
	}

	displaySingleBeeGroup() {
		for (let i = 0; i < this.multipleBeeSelectionCollection.length; i++) {
			this.multipleBeeSelectionCollection[
				i
			].sprite.position.x = this.multipleBeeSelectionPosition.x;
			this.multipleBeeSelectionCollection[
				i
			].sprite.position.y = this.multipleBeeSelectionPosition.y;
		}
	}

	createProgressBar(x, y, image, barWidth, barHeight, seconds, type) {
		// Type: 0 = decreasing | 1 = increasing

		const innerProgressBar = this.add.sprite(
			x - barWidth / 2,
			y - barWidth,
			image
		);
		innerProgressBar.inputEnabled = false;
		if (type === 0) {
			innerProgressBar.width = barWidth;
		} else if (type === 1) {
			innerProgressBar.width = 0;
		}

		innerProgressBar.height = barHeight;
		innerProgressBar.progress = barWidth / seconds;

		this.time.events.repeat(
			Phaser.Timer.SECOND,
			seconds,
			() => {
				this.updateProgressBar(innerProgressBar, type);
			},
			this
		);
	}

	updateProgressBar(progressBar, type) {
		if (type === 0) {
			progressBar.width -= progressBar.progress;
		} else if (type === 1) {
			progressBar.width += progressBar.progress;
		}
	}

	activateBee(bee) {
		return bee;
		// Bee.status = 0;
		// Client.synchronizeBee(bee.getSendableBee());
	}

	deactivateBee(bee, seconds) {
		bee.status = 3;

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

	getBeeForSprite(sprite) {
		for (let i = 0; i < this.bees.length; i++) {
			if (this.bees[i].sprite === sprite) {
				return this.bees[i];
			}
		}
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

	deselectBee(bee) {
		Menu.createHiveMenu(this.beehive.getSendableBeehive(), this.bees.length);
		bee.deactivateShadow();
		this.graphics.clear();
	}

	getAllBeesAtPosition(bee) {
		const { x } = bee.sprite.position;
		const { y } = bee.sprite.position;
		const radius = 20;
		const allBees = this.bees.filter(
			item =>
				item.sprite.position.x > x - radius &&
				item.sprite.position.x < x + radius &&
				item.sprite.position.y > y - radius &&
				item.sprite.position.y < y + radius
		);
		return allBees;
	}

	onUp(sprite) {
		const clickedBee = this.bees.find(item => item.sprite === sprite);

		this.stopAllOtherShadowTweens(clickedBee);
		this.deactivateAllOtherShadows(clickedBee);

		if (clickedBee.shadow) {
			// The bee had already a shadow
			this.deselectBee(clickedBee);
			return;
		}
		if (!clickedBee.shadow) {
			// The bee wasn't selected before
			Menu.createBeeMenu(clickedBee.getSendableBee());
			clickedBee.activateShadow();
			this.showAllActions(clickedBee);
		}
		if (clickedBee.shadowTween) {
			// The bee was selected but moving to another (or the same) flower
			clickedBee.startShadowTween({ x: sprite.x, y: sprite.y });
		}
		if (clickedBee.tween && clickedBee.tween.isRunning) {
			// In case the 'new' bee is (already) flying
			clickedBee.startShadowTween({
				x: clickedBee.tween.properties.x,
				y: clickedBee.tween.properties.y
			});
		}
	}

	onTweenRunning() {
		if (
			this.isABeeSelected() &&
			this.getSelectedBee().shadow &&
			this.getSelectedBee().tween
		) {
			const curBee = this.getSelectedBee();
			this.showAllActions(curBee);
		} else {
			this.graphics.clear(); // This is called way to often...
		}
	}

	showAllActions(bee) {
		this.graphics.clear();
		bee.getActions().forEach(action => {
			this.graphics.lineStyle(10, 0xffd900, 1);
			this.graphics.moveTo(bee.sprite.x, bee.sprite.y);
			this.graphics.lineTo(action.x, action.y);
		});
	}

	stopAllOtherShadowTweens(bee) {
		for (let i = 0; i < this.bees.length; i++) {
			const b = this.bees[i];
			if (b.id !== bee.id) {
				b.stopShadowTween();
			}
		}
	}

	deactivateAllOtherShadows(bee) {
		for (let i = 0; i < this.bees.length; i++) {
			const b = this.bees[i];
			if (b.id !== bee.id) {
				b.deactivateShadow();
			}
		}
	}

	isABeeSelected() {
		for (let i = 0; i < this.bees.length; i++) {
			if (this.bees[i].shadow) {
				return true;
			}
		}
		return false;
	}

	getSelectedBee() {
		for (let i = 0; i < this.bees.length; i++) {
			if (this.bees[i].shadow) {
				return this.bees[i];
			}
		}
	}

	beeForId(id) {
		return this.bees.find(bee => {
			return bee.id === id;
		});
	}

	flowerForId(id) {
		return this.flowers.find(flower => {
			return flower.id === id;
		});
	}

	updateBee(bee) {
		const beeToBeUpdated = this.beeForId(bee.id);
		if (beeToBeUpdated.status === 3) {
			// Bee was blocked
			if (bee.status === 0) this.activateBee(beeToBeUpdated); // Bee is free now
		} else if (bee.status === 3) this.deactivateBee(beeToBeUpdated, 4); // Bee is now blocked
		beeToBeUpdated.age = bee.age;
		beeToBeUpdated.status = bee.status;
		beeToBeUpdated.health = bee.health;
		beeToBeUpdated.energy = bee.energy;
		beeToBeUpdated.pollen = bee.pollen;
		beeToBeUpdated.nectar = bee.nectar;
		beeToBeUpdated.capacity = bee.capacity;
		beeToBeUpdated.playerActions = bee.playerActions;
		if (
			document.getElementById('menu').firstChild.id ===
			'beeMenu-' + beeToBeUpdated.id
		) {
			Menu.createBeeMenu(beeToBeUpdated);
		}
		return beeToBeUpdated;
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
		this.beehive.pollen = beehive.pollen;
		this.beehive.honey = beehive.honey;
		this.beehive.honeycombs = beehive.honeycombs;

		if (document.getElementById('menu').firstChild.id === 'hiveMenu') {
			Menu.createHiveMenu(this.beehive, this.bees.length);
		}
	}

	getCoordinates(object) {
		if (object.name === 'beehive') {
			if (this.isABeeSelected()) {
				this.requestGoToHive();
			} else {
				Menu.createHiveMenu(this.beehive, this.bees.length);
			}
		} else if (
			['flower-white', 'flower-red', 'flower-purple', 'flower-yellow'].includes(
				object.name
			)
		) {
			if (this.isABeeSelected()) {
				const flower = this.getFlowerForSprite(object); // A this.flowers.find( (flower) => {return (flower.sprite === object);});
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
			// Game.getSelectedBee().resetTimer();
		}
	}

	requestGoToFlower(flower) {
		if (this.isABeeSelected()) {
			const { x } = flower.sprite.position;
			const { y } = flower.sprite.position;
			Client.requestMovement(this.createMoveData(x, y));
		}
	}

	createMoveData(x, y) {
		return { beeID: this.getSelectedBee().id, target: { x, y } };
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
}

export default new Game();
// Singleton
