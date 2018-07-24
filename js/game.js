import { game } from './main.js';
import Menu from './menu.js';
import Client from './client.js';
import Beehive from './beehive.js';
import Flower from './flower.js';
import Bee from './bee.js';

class Game {
	constructor() {
		this.playerMap = {};
		this.beehiveSprite = {}; // A Sprite
		this.flowerSprites = {}; // A Group of sprites
		this.beehive = {};
		this.flowers = [];
		this.bees = [];
		this.hiveBees = [];
		this.ressourceLabel = '';
		this.beeLabel = '';
		this.beehivePosition = {
			x: 0,
			y: 0,
		};
		this.line = null;
		this.graphics = null;
		this.multipleBeeSelectionStatus = false;
		this.multipleBeeSelectionPosition = {
			x: 0,
			y: 0,
		};
		this.multipleBeeSelectionCollection = [];
		this.insideMap = null;
		this.insideButton = null;
		this.insideLayers = [];
		this.insideWorkareas = {};
		this.insideGraphics = null;
		this.currentLayer = 'outside';
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
		this.playerMap = [];
		const map = game.add.tilemap('map');
		this.addBackground(map);
		this.addFlowers(map);
		this.addBeehive(map);
		game.add.button(20, 20, 'switch', this.switchToInside, this, 2, 1, 0);
		this.graphics = game.add.graphics(0, 0);
		Client.askNewPlayer({ flowers: this.flowerSprites.length });
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
		for (let i = 0; i < data.players.length; i++) {
			this.addNewPlayer(data.players[i]);
		}
		for (let i = 0; i < data.bees.length; i++) {
			this.addNewBee(data.bees[i]);
		}
		for (let i = 0; i < data.hiveBees.length; i++) {
			this.addNewHiveBee(data.hiveBees[i]);
		}
		Menu.createHiveMenu(this.beehive.getSendableBeehive(), this.bees.length);
		this.setUpUserInput();
	}

	switchToInside() {
		this.currentLayer = 'inside';
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
		this.hiveBees.forEach(bee => {
			const sprite = game.add.sprite(bee.x, bee.y, 'sprite');
			sprite.anchor.setTo(0.5);
			sprite.inputEnabled = true;
			bee.sprite = sprite;
			const gameParent = this;
			sprite.events.onInputUp.add(function() {
				gameParent.onUp(bee);
			});
		});
	}

	switchToOutside() {
		this.currentLayer = 'outside';
		this.hiveBees.forEach(bee => {
			bee.sprite.destroy();
		});
		this.insideMap.destroy();
		this.insideButton.destroy();
		this.insideLayers.forEach(layer => {
			layer.destroy();
		});
		this.insideLayers = [];
		this.insideGraphics.destroy();
		this.bees.forEach(bee => {
			if (bee.sprite === null) {
				bee.x = this.beehivePosition.x;
				bee.y = this.beehivePosition.y;
				const sprite = game.add.sprite(bee.x, bee.y, 'sprite');
				sprite.anchor.setTo(0.5);
				sprite.inputEnabled = true;
				bee.sprite = sprite;
				const gameParent = this;
				sprite.events.onInputUp.add(function() {
					gameParent.onUp(bee);
				});
				bee.sprite.events.onInputOver.add(() => {
					gameParent.onBeeInputOver(bee);
				}, this);
				bee.sprite.events.onInputOut.add(() => {
					gameParent.onBeeInputOut(bee);
				}, this);
			}
		});
	}

	switchHiveBeesOutside(serverBee) {
		const gameBee = this.getBeeFromId(serverBee.id);
		if (this.currentLayer === 'inside') {
			gameBee.sprite.destroy();
			gameBee.sprite = null;
		}
		this.hiveBees.splice( this.hiveBees.indexOf(gameBee), 1 );
		this.bees.push(gameBee);
		gameBee.type = 0;
		this.updateGameObject(gameBee);
		if (this.currentLayer === 'outside') {
			gameBee.x = this.beehivePosition.x;
			gameBee.y = this.beehivePosition.y;
			const sprite = game.add.sprite(gameBee.x, gameBee.y, 'sprite');
			sprite.anchor.setTo(0.5);
			sprite.inputEnabled = true;
			gameBee.sprite = sprite;
			const gameParent = this;
			sprite.events.onInputUp.add(function() {
				gameParent.onUp(gameBee);
			});
			gameBee.sprite.events.onInputOver.add(() => {
				gameParent.onBeeInputOver(gameBee);
			}, this);
			gameBee.sprite.events.onInputOut.add(() => {
				gameParent.onBeeInputOut(gameBee);
			}, this);
		}
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
					y: object.y + object.polygon[i][1],
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
		switch(key) {
			case 'Nursing': this.goToNursing(); break;
			case 'Building': this.goToBuilding(); break;
			case 'Cleaning': this.goToCleaning(); break;
		}
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

	getCoordinates(object) {
		if (object.name === 'beehive') {
			if (this.isABeeSelected()) {
				this.goToHive();
			} else {
				Menu.createHiveMenu(this.beehive, this.bees.length);
			}
		} else if (
			['flower-white', 'flower-red', 'flower-purple', 'flower-yellow'].includes(
				object.name
			)
		) {
			if (this.isABeeSelected()) {
				const flower = this.flowers.find(flower => {
					return flower.sprite === object;
				});
				this.getNectar(flower);
			} else {
				Menu.createFlowerMenu(this.getFlowerForSprite(object));
			}
		}
	}

	goToHive() {
		if (this.isABeeSelected()) {
			Client.goTo({
				beeID: this.getSelectedBee().id,
				action: 'goToHive',
				target: { x: this.beehivePosition.x, y: this.beehivePosition.y },
			});
			this.getSelectedBee().resetTimer();
		}
	}

	goToNursing() {
		if (this.isABeeSelected()) {
			const moveData = {
				beeID: this.getSelectedBee().id,
				action: 'goToNursing',
				target: { x: 400, y: 280 },
				type: 1,
			};
			Client.goTo(moveData);
		}
	}

	goToBuilding() {
		if (this.isABeeSelected()) {
			const moveData = {
				beeID: this.getSelectedBee().id,
				action: 'goToBuilding',
				target: { x: 450, y: 480 },
				type: 1,
			};
			Client.goTo(moveData);
		}
	}

	goToCleaning() {
		if (this.isABeeSelected()) {
			const moveData = {
				beeID: this.getSelectedBee().id,
				action: 'goToCleaning',
				target: { x: 500, y: 600 },
				type: 1,
			};
			Client.goTo(moveData);
		}
	}

	feedLarvae(bee) {
		console.log('Feed');
		this.deactivateBee(bee, 10);
		Client.synchronizeBee(bee.getSendableBee());
	}

	buildCombs(bee) {
		console.log('Build');
		this.deactivateBee(bee, 20);
		Client.synchronizeBee(bee.getSendableBee());
	}

	cleanHive(bee) {
		console.log('Clean');
		this.deactivateBee(bee, 10);
		Client.synchronizeBee(bee.getSendableBee());
	}

	getNectar(flower) {
		if (this.isABeeSelected()) {
			const moveData = {
				beeID: this.getSelectedBee().id,
				action: 'getNectar',
				target: { x: flower.sprite.position.x, y: flower.sprite.position.y },
				targetID: flower.id,
			};
			Client.goTo(moveData);
		}
	}

	printRessource() {
		if (this.beehive) {
			this.ressourceLabel.setText('Honey at Hive: ' + this.beehive.honey);
		} else {
			this.ressourceLabel.setText('Honey at Hive: ' + 0);
		}
	}

	printBee() {
		if (this.isABeeSelected()) {
			this.beeLabel.setText('Nectar on Bee: ' + this.getSelectedBee().pollen);
		} else {
			this.beeLabel.setText('');
		}
	}

	// TODO: progressbar needs to be saved and only displayed when on that layer
	// TODO: tween needs to work in the background even when switching between layers
	// TODO: fix shadows of hivebees
	// TODO: timer should be on the server side

	deactivateBee(bee, seconds) {
		bee.status = 3;
		this.createProgressBar(
			bee.x,
			bee.y,
			'progressbar',
			50,
			10,
			seconds,
			0
		);
		Client.setTimerForBee(bee,seconds)
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
		bee.status = 0;
		Client.synchronizeBee(bee.getSendableBee());
	}

	returnNectar(bee) {
		this.beehive.pollen += bee.pollen;
		this.beehive.honey += bee.nectar;
		bee.pollen = 0;
		bee.nectar = 0;
		Client.synchronizeBeehive(this.beehive.getSendableBeehive());
		Client.synchronizeBee(bee.getSendableBee());
	}

	addNectarToBee(bee, flower) {
		this.deactivateBee(bee, 7);
		bee.pollen += 10;
		flower.pollen -= 10;
		bee.nectar += 10;
		flower.nectar -= 10;
		Client.synchronizeBee(bee.getSendableBee());
		Client.synchronizeFlower(flower.getSendableFlower());
	}

	addNewBee(serverBee) {
		const sprite = game.add.sprite(serverBee.x, serverBee.y, 'sprite');
		sprite.anchor.setTo(0.5);
		sprite.inputEnabled = true;
		const bee = new Bee(serverBee, sprite);
		bee.type = 0;
		const gameParent = this;
		sprite.events.onInputUp.add(function() {
			gameParent.onUp(bee);
		});
		this.bees.push(bee);
	}

	addNewHiveBee(serverBee) {
		const bee = new Bee(serverBee, null);
		bee.type = 1;
		this.upda
		this.hiveBees.push(bee);
	}

	addNewPlayer(player) {
		this.playerMap[player.id] = player;
	}

	moveBee(moveData) {
		const bee = this.getBeeFromId(moveData.beeID);

		bee.stopTween(); // In case the bee was flying to another flower (or hive)
		bee.resetTimer();

		if (bee.shadowTween) {
			bee.stopShadowTween();
		}

		if (moveData.stop) {
			bee.startTimer();
			if (bee.shadow) {
				this.showAllActions(bee);
			}
			return;
		}

		bee.startTween({ x: moveData.target.x, y: moveData.target.y });

		if (bee.shadow) {
			bee.startShadowTween({ x: moveData.target.x, y: moveData.target.y });
		}

		this.deselectBee(bee);
	}

	getBeeFromId(id) {
		let bee = this.bees.find(item => item.id === id);
		if (bee === undefined) {
				bee = this.hiveBees.find(item => item.id === id);
		}
		return bee;
	}

	playerActions(playerActions) {
		const bee = this.getBeeFromId(playerActions[0].beeID);
		bee.playerActions = playerActions;
	}

	moveCallback(beeSprite) {
		const bee = this.getBeeForSprite(beeSprite);
		bee.x = beeSprite.position.x;
		bee.y = beeSprite.position.y;
		if (
			bee.x === this.beehivePosition.x &&
			bee.y === this.beehivePosition.y
		) {
			this.returnNectar(bee);
		} else {
			const flower = this.getFlowerForPosition({
				x: bee.x,
				y: bee.y,
			});
			this.addNectarToBee(bee, flower);
		}
		bee.startTimer();
		Client.emptyActions(bee);
		this.graphics.clear();
	}

	moveCallbackHiveBees(beeSprite) {
		const bee = this.getBeeForSprite(beeSprite);
		bee.x = beeSprite.position.x;
		bee.y = beeSprite.position.y;
		bee.startTimer();
		Client.emptyActions(bee);
		this.graphics.clear();
		var currentArea = null;
		Object.keys(this.insideWorkareas).forEach(key => {
			const area = this.insideWorkareas[key];
			if (area.contains(bee.x, bee.y)) {
				currentArea = key;
			}
		});
		if (currentArea != null) {
			switch(currentArea) {
				case 'Nursing': this.feedLarvae(bee); break;
				case 'Building': this.buildCombs(bee); break;
				case 'Cleaning': this.cleanHive(bee); break;
			}
		}
	}

	getBeeForSprite(sprite) {
		for (let i = 0; i < this.bees.length; i++) {
			if (this.bees[i].sprite === sprite) {
				return this.bees[i];
			}
		}
		for (let i = 0; i < this.hiveBees.length; i++) {
			if (this.hiveBees[i].sprite === sprite) {
				return this.hiveBees[i];
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
		const x = bee.x;
		const y = bee.y;
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

	onUp(bee) {
		const sprite = bee.sprite;
		let clickedBee = null;
		if (bee.type === 0) {
			clickedBee = this.bees.find(item => item.sprite === sprite);
		} else if (bee.type === 1) {
			clickedBee = this.hiveBees.find(item => item.sprite === sprite);
		}
		this.stopAllOtherShadowTweens(clickedBee);
		this.deactivateAllOtherShadows(clickedBee);
		if (clickedBee.shadow) {
			// The bee already had a shadow
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
			clickedBee.startShadowTween({ x: bee.x, y: bee.y });
		}
		if (clickedBee.tween && clickedBee.tween.isRunning) {
			// In case the 'new' bee is (already) flying
			clickedBee.startShadowTween({
				x: clickedBee.tween.properties.x,
				y: clickedBee.tween.properties.y,
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
			this.graphics.clear();
			this.showAllActions(curBee);
		} else {
			this.graphics.clear();
		}
	}

	showAllActions(bee) {
		this.graphics.clear();
		bee.getActions().forEach(action => {
			this.graphics.lineStyle(10, 0xffd900, 1);
			this.graphics.moveTo(bee.x, bee.y);
			this.graphics.lineTo(action.x, action.y);
		});
	}

	removePlayer(id) {
		delete this.playerMap[id];
	}

	stopAllOtherShadowTweens(bee) {
		for (let i = 0; i < this.bees.length; i++) {
			const b = this.bees[i];
			if (b.id !== bee.id) {
				b.stopShadowTween();
			}
		}
		for (let i = 0; i < this.hiveBees.length; i++) {
			const b = this.hiveBees[i];
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
		for (let i = 0; i < this.hiveBees.length; i++) {
			const b = this.hiveBees[i];
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
		for (let i = 0; i < this.hiveBees.length; i++) {
			if (this.hiveBees[i].shadow) {
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
		for (let i = 0; i < this.hiveBees.length; i++) {
			if (this.hiveBees[i].shadow) {
				return this.hiveBees[i];
			}
		}
	}

	updateGameObject(updateObject) {
		console.log(updateObject.content);
		console.log(updateObject.type);
		if (updateObject.type === 'bee') {
			console.log('im a bee');
			const beeToBeUpdated = this.getBeeFromId(updateObject.content.id);
			beeToBeUpdated.age = updateObject.content.age;
			beeToBeUpdated.status = updateObject.content.status;
			beeToBeUpdated.health = updateObject.content.health;
			beeToBeUpdated.energy = updateObject.content.energy;
			beeToBeUpdated.pollen = updateObject.content.pollen;
			beeToBeUpdated.nectar = updateObject.content.nectar;
			beeToBeUpdated.capacity = updateObject.content.capacity;
			beeToBeUpdated.playerActions = updateObject.content.playerActions;
			beeToBeUpdated.x = updateObject.content.x;
			beeToBeUpdated.y = updateObject.content.y;
			beeToBeUpdated.type = updateObject.content.type;
			if (
				document.getElementById('menu').firstChild.id ===
				'beeMenu-' + beeToBeUpdated.id
			) {
				Menu.createBeeMenu(beeToBeUpdated);
			}
		} else if (updateObject.type === 'beehive') {
			// Console.log('game.js - updateBeehive');
			const updatedBeehive = updateObject.content;
			this.beehive.pollen = updatedBeehive.pollen;
			this.beehive.honey = updatedBeehive.honey;
			this.beehive.honeycombs = updatedBeehive.honeycombs;
			if (document.getElementById('menu').firstChild.id === 'hiveMenu') {
				Menu.createHiveMenu(this.beehive, this.bees.length);
			}
		} else if (updateObject.type === 'flower') {
			// Console.log('game.js - updateFlower - flower.id: ', updateObject.content.id);
			const flowerToBeUpdated = this.flowerForId(updateObject.content.id);
			flowerToBeUpdated.pollen = updateObject.content.pollen;
			flowerToBeUpdated.nectar = updateObject.content.nectar;
			if (
				document.getElementById('menu').firstChild.id ===
				'flowerMenu-' + flowerToBeUpdated.id
			) {
				Menu.createFlowerMenu(flowerToBeUpdated);
			}
		} else {
			console.log('wrong type', updateObject);
		}
	}

	flowerForId(id) {
		return this.flowers.find(flower => {
			return flower.id === id;
		});
	}
}

export default new Game();
// Singleton
