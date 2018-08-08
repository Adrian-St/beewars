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
		this.insideGraphics.visible = true;
	}

	disableState() {
		super.disableState();

		this.insideMap.visible = false;
		this.insideButton.visible = false;
		this.insideLayers.forEach(layer => {
			layer.visible = false;
		});
		this.insideGraphics.visible = false;
	}

	addBackground() { // part of this could be in State
		//this.insideMap.addTilesetImage('Honeycomb-Background'); // this is not part of the map yet
		this.insideMap.addTilesetImage('grass');
		this.insideLayers.push(this.insideMap.createLayer('Grass'));
	}

	addBeehive() {
		this.insideMap.addTilesetImage('Honeycomb-Tileset-double');
		this.insideLayers.push(this.insideMap.createLayer('Honeycombs'));
		this.insideLayers[1].resizeWorld();
		this.insideLayers[1].inputEnabled = true;
		this.insideLayers[1].events.onInputUp.add(this.getWorkarea, this);
	}

	addWorkAreas() {
		this.insideGraphics = Game.add.graphics(0, 0);
		this.insideMap.objects['Inner Beehive'].forEach(object => {
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

		this.insideWorkareaCenters['Building'] = {x: 480, y: 435}; // this need improvement
		this.insideWorkareaCenters['Nursing'] = {x: 483, y: 252};
		this.insideWorkareaCenters['Queen'] = {x: 493, y: 130};
		this.insideWorkareaCenters['Cleaning'] = {x: 481, y: 565};
	}

	addTopMenu() {
		super.addTopMenu();
		this.insideButton = Game.add.button(6, 6, 'switch', Game.switchToOutside, Game, 2, 1, 0);
	}

	addNewBee(serverBee) {
		const addedBee = super.addNewBee(serverBee);
		if (Game.currentState === 'OUTSIDE') addedBee.sprite.visible = false;
	}

	getWorkarea(layer, pointer) {
		console.log('click');
		let clickedOnBeeHive = false;
		Object.keys(this.insideWorkareas).forEach(key => {
			const area = this.insideWorkareas[key];
			if (area.contains(pointer.worldX, pointer.worldY)) {
				console.log(this.insideWorkareaCenters[key])
				const destination = this.insideWorkareaCenters[key];
				this.requestGoToPosition(destination.x, destination.y);
				clickedOnBeeHive = true;
			}
		});

		if (!clickedOnBeeHive) {
			// It was click on the background
			Menu.createHiveMenu(Game.beehive, this.bees.length);
			this.deactivateAllOtherShadows({});
			this.stopAllOtherShadowTweens({});
			this.graphics.clear();
		}
	}

	requestGoToPosition(x, y) {
		if (this.isABeeSelected()) {
			Client.requestMovement(this.createMoveData(x, y));
		}
	}	
}

export default Inside;
