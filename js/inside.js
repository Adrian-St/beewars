import Client from './client.js';
import Game from './game.js';
import State from './state.js';

class Inside extends State {
	constructor() {
		super();
		this.insideMap = null;
		this.insideButton = null;
		this.insideLayers = [];
		this.insideWorkareas = {};
		this.insideGraphics = null; // For drawing the borders of the hive

		this.initialize();
		this.stateName = 'INSIDE';
		// This.disableState();
	}

	initialize() {
		super.initialize();

		this.insideMap = Game.add.tilemap('inside_map');
		this.insideMap.addTilesetImage('grass');
		this.insideMap.addTilesetImage('Honeycomb-Tileset-double');
		this.insideLayers.push(this.insideMap.createLayer('Grass'));
		this.insideLayers.push(this.insideMap.createLayer('Honeycombs'));
		this.insideLayers[1].resizeWorld();
		this.insideLayers[1].inputEnabled = true;
		this.insideLayers[1].events.onInputUp.add(this.getWorkarea, this); // .add(this.getWorkarea, this);
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
		this.graphics = Game.add.graphics(0, 0);
		this.insideButton = Game.add.button(
			20,
			20,
			'switch',
			Game.switchToOutside,
			Game,
			2,
			1,
			0
		);
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

	getWorkarea(layer, pointer) {
		console.log('click');
		let clickedOnBeeHive = false;
		Object.keys(this.insideWorkareas).forEach(key => {
			const area = this.insideWorkareas[key];
			if (area.contains(pointer.worldX, pointer.worldY)) {
				this.requestGoToPosition(pointer.worldX, pointer.worldY);
				this.simulateArrival(key); // Delete me later
				clickedOnBeeHive = true;
			}
		});

		if (!clickedOnBeeHive) {
			// It was click on the background
			this.stopAllOtherShadowTweens({});
			this.deactivateAllOtherShadows({});
		}
	}

	requestGoToPosition(x, y) {
		if (this.isABeeSelected()) {
			// Needs improvement
			Client.requestMovement(this.createMoveData(x, y));
			// Game.getSelectedBee().resetTimer();
		}
	}

	simulateArrival(key) {
		// Remove me later
		// Because the server is not finished yet this simulates that the bee arrived (without delay!)
		console.log('arrived at: ' + key);
		switch (key) {
			case 'Building':
				console.log('start building');
				this.handleBuilding();
				break; // Honeycombs total: free + dirty + used; produce wax
			case 'Nursing':
				console.log('start nursing');
				break; // Larvae that eat honey (maybe progressbar for the amount of food)
			case 'Queen':
				console.log('start caring for the queen');
				this.produceGeleeRoyal();
				break; // Feeding the queen with geleeRoyal (maybe progressbar for the amount of gelee)
			case 'Cleaning':
				console.log('start cleaning');
				this.handleCleaning();
				break; // Remove the number of dirty honeycombs
		}
		// TODO: game elements for inside (real behavior)
		// TODO: fix wasps (sometimes the dissapear)
	}

	handleBuilding() {
		// Belongs on the server
		if (Game.beehive.honey >= 10) {
			Game.beehive.freeHoneycombs += 1;
			Game.beehive.honeycombs += 1;
			Game.beehive.honey -= 10;
		}
		console.log(Game.beehive);
	}

	produceGeleeRoyal() {
		// Belongs on the server
		// the queen produces laves every "day" (e.g. 5 sec) as long as it has enough geleeRoyal (this.produceLarvae)

		// the bees can produce geleeRoyal
		// maybe producing geleeRoyal costs "pollen ressources" (even though in reality it does not)
		if (Game.beehive.pollen >= 5) {
			Game.beehive.pollen -= 5;
			Game.beehive.geleeRoyal += 1;
		}
		console.log(Game.beehive);
	}

	handleCleaning() {
		// Belongs on the server
		if (Game.beehive.dirtyHoneycombs > 0) {
			Game.beehive.freeHoneycombs += 1;
			Game.beehive.dirtyHoneycombs -= 1;
		}
		console.log(Game.beehive);
	}

	produceLarvae() {
		// This belongs on the server
		if (Game.beehive.geleeRoyal > 0) {
			Game.beehive.geleeRoyal -= 1;
			if (Game.beehive.freeHoneycombs > 0) {
				Game.beehive.freeHoneycombs -= 1;
				Game.beehive.dirtyHoneycombs += 1;
				// Start timer
				// if the timer runs out we add a new "inside bee" and synchronize the bee and the beehive
			}
		}
		console.log(Game.beehive);
	}
}

export default Inside;
