import Client from './client.js';
import Game from './game.js';
import State from './state.js';
import Menu from './menu.js';
import DoubleProgressbar from './progressBar.js';

class Inside extends State {
	constructor() {
		super();
		this.name = 'INSIDE';
		this.insideMap = null;
		this.insideButton = null;
		this.insideLayers = [];
		this.insideWorkareas = {};
		this.insideGraphics = null; // For drawing the borders of the hive

		this.initialize();
	}

	initialize() {
		super.initialize();

		this.insideMap = Game.add.tilemap('inside_map');
		this.addBackground();
		this.addBeehive();
		this.addWorkAreas();
		this.addBeehiveDisplay();

		this.graphics = Game.add.graphics(0, 0);
		this.addTopMenu();
	}

	enableState() {
		super.enableState();

		this.insideMap.visible = true;
		this.insideButton.visible = true;
		this.insideLayers.forEach(layer => {
			layer.visible = true;
		});
		Object.keys(this.insideWorkareas).forEach(key => {
			this.insideWorkareas[key].visible = true;
		});
		this.insideGraphics.visible = true;
		this.enableBeehiveObject();
	}

	disableState() {
		super.disableState();

		this.insideMap.visible = false;
		this.insideButton.visible = false;
		this.insideLayers.forEach(layer => {
			layer.visible = false;
		});
		Object.keys(this.insideWorkareas).forEach(key => {
			this.insideWorkareas[key].visible = false;
		});
		this.insideGraphics.visible = false;
		this.disableBeehiveObject();
	}

	addBackground() {
		// Part of this could be in State
		this.insideMap.addTilesetImage('Honeycomb-Background');
		this.insideMap.addTilesetImage('grass');
		this.insideLayers.push(this.insideMap.createLayer('Grass'));
		this.insideMap.addTilesetImage('inside-tree');
		this.insideLayers.push(this.insideMap.createLayer('Tree'));
	}

	addBeehive() {
		this.insideMap.addTilesetImage('Workarea-icons');
		this.insideLayers.push(this.insideMap.createLayer('Honeycombs'));
		this.insideLayers[2].inputEnabled = true;
		this.insideLayers[2].events.onInputUp.add(this.clickedOnBackground, this);
	}

	addWorkAreas() {
		this.insideGraphics = Game.add.graphics(0, 0);
		this.insideMap.addTilesetImage('Full-Beehive');
		this.insideMap.objects['Inner Beehive'].forEach((object, index) => {
			const offset = 160; // Caused by difference in map generator, needs to be changed on server site too!
			if(index>=2)index--;
			this.insideWorkareas[object.name] = Game.add.sprite(
				object.x,
				object.y - offset,
				'Full-Beehive',
				index
			);
			if (index > 0) {
				this.insideWorkareas[object.name].inputEnabled = true;
				this.insideWorkareas[object.name].events.onInputUp.add(
					this.getWorkarea,
					this
				);
			}
		});
	}

	addBeehiveDisplay() {
		const xPosition = 780;
		this.beehiveDisplay = {
			honeycombs: this.createText(xPosition, 90),
			freeHoneycombs: this.createText(xPosition, 120),
			dirtyHoneycombs: this.createText(xPosition, 145),
			occupiedHoneycombs: this.createText(xPosition, 170),
			geleeRoyal: this.createText(xPosition, 230),
			geleeRoyalProgressBar: new DoubleProgressbar(xPosition, 285, 50, 20, 'Honey:', 'Pollen:', 10, 10),
			buildingText: this.createText(xPosition, 390),
			buildingProgressBar: new DoubleProgressbar(xPosition, 445, 50, 20, 'Honey:', 'Pollen:', 5, 3)
		};
		this.beehiveDisplay.freeHoneycombs.fontSize = 26;
		this.beehiveDisplay.dirtyHoneycombs.fontSize = 26;
		this.beehiveDisplay.occupiedHoneycombs.fontSize = 26;
		this.beehiveDisplay.buildingText.text = "Building:"
	}

	createText(x, y) {
		const text = Game.add.text(x, y, '');
		text.fontSize = 30;
		text.font = 'Arial';
		return text;
	}

	updateBeehiveDisplay(beehive) {
		this.beehiveDisplay.honeycombs.text = 'Honeycombs: ' + beehive.honeycombs;
		this.beehiveDisplay.freeHoneycombs.text =
			' - Free: ' + beehive.freeHoneycombs;
		this.beehiveDisplay.dirtyHoneycombs.text =
			' - Dirty: ' + beehive.dirtyHoneycombs;
		this.beehiveDisplay.occupiedHoneycombs.text =
			' - Occupied: ' + beehive.occupiedHoneycombs;
		this.beehiveDisplay.geleeRoyal.text =
			'GeleeRoyal: ' + beehive.geleeRoyal;
		this.beehiveDisplay.geleeRoyalProgressBar.update(beehive.pollen, beehive.honey);
		this.beehiveDisplay.buildingProgressBar.update(beehive.pollen, beehive.honey);

		if (beehive.freeHoneycombs === 0) {
			this.beehiveDisplay.freeHoneycombs.addColor('#ff0000', 2);
		} else {
			this.beehiveDisplay.freeHoneycombs.addColor('#000000', 2);
		}
		if (beehive.geleeRoyal === 0) {
			this.beehiveDisplay.geleeRoyal.addColor('#ff0000', 11);
		} else {
			this.beehiveDisplay.geleeRoyal.addColor('#000000', 11);
		}
	}

	enableBeehiveObject() {
		this.beehiveDisplay.honeycombs.visible = true;
		this.beehiveDisplay.freeHoneycombs.visible = true;
		this.beehiveDisplay.dirtyHoneycombs.visible = true;
		this.beehiveDisplay.occupiedHoneycombs.visible = true;
		this.beehiveDisplay.geleeRoyal.visible = true;
		this.beehiveDisplay.geleeRoyalProgressBar.show();
		this.beehiveDisplay.buildingProgressBar.show();
		this.beehiveDisplay.buildingText.visible = true;
	}

	disableBeehiveObject() {
		this.beehiveDisplay.honeycombs.visible = false;
		this.beehiveDisplay.freeHoneycombs.visible = false;
		this.beehiveDisplay.dirtyHoneycombs.visible = false;
		this.beehiveDisplay.occupiedHoneycombs.visible = false;
		this.beehiveDisplay.geleeRoyal.visible = false;
		this.beehiveDisplay.geleeRoyalProgressBar.hide();
		this.beehiveDisplay.buildingProgressBar.hide();
		this.beehiveDisplay.buildingText.visible = false;
	}

	addTopMenu() {
		// Super.addTopMenu();
		this.insideButton = Game.add.button(
			112,
			6,
			'inside-button',
			Game.switchToOutside,
			Game,
			1,
			0,
			2
		);
	}

	addNewBee(serverBee) {
		const addedBee = super.addNewBee(serverBee);
		if (!this.isActive()) addedBee.sprite.visible = false;
	}

	getWorkarea(area) {
		this.requestGoToPosition(area.centerX, area.centerY);
	}

	clickedOnBackground() {
		// It was click on the background
		Menu.createHiveMenu(Game.beehive, this.bees.length, this.name);
		this.deactivateAllOtherShadows({});
		this.stopAllOtherShadowTweens({});
		this.graphics.clear();
	}

	requestGoToPosition(x, y) {
		if (this.isABeeSelected()) {
			Client.requestMovement(this.createMoveData(x, y));
		}
	}
}

export default Inside;
