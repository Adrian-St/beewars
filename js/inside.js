import Client from './client.js';
import Game from './game.js';
import State from './state.js';
import Menu from './menu.js';

class Inside extends State {
	constructor() {
		super();
		this.insideMap = null;
		this.insideButton = null;
		this.insideLayers = [];
		this.insideWorkareas = {};
		this.insideWorkareaCenters = {};
		this.insideGraphics = null; // For drawing the borders of the hive

		this.initialize();
		this.stateName = 'INSIDE';
	}

	initialize() {
		super.initialize();

		this.insideMap = Game.add.tilemap('inside_map');
		this.addBackground();
		this.addBeehive();
		this.addWorkAreas();

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
		this.insideLayers[2].resizeWorld();
		this.insideLayers[2].inputEnabled = true;
		this.insideLayers[2].events.onInputUp.add(this.clickedOnBackground, this);
	}

	addWorkAreas() {
		this.insideGraphics = Game.add.graphics(0, 0);
		this.insideMap.addTilesetImage('Full-Beehive');
		this.insideMap.objects['Inner Beehive'].forEach((object, index) => {
			console.log(object);
			const offset = 80 //Caused by difference in map generator
			this.insideWorkareas[object.name] = Game.add.sprite(object.x, object.y - offset, 'Full-Beehive', index);
			this.insideWorkareas[object.name].inputEnabled = true;
			this.insideWorkareas[object.name].events.onInputUp.add(this.getWorkarea, this);
		});
		console.log(this.insideWorkareas);
	}


	addTopMenu() {
		//super.addTopMenu();
		this.insideButton
		 = Game.add.button(
			6,
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
		if (Game.currentState === 'OUTSIDE') addedBee.sprite.visible = false;
	}

	getWorkarea(area) {
		console.log(area);
		this.requestGoToPosition(area.centerX, area.centerY);
	}

	clickedOnBackground() {
		// It was click on the background
		Menu.createHiveMenu(Game.beehive, this.bees.length);
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
