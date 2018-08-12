const mapJson = require('./../assets/map/outside_map.json');

const beehiveJson = mapJson.layers[2].objects[0];

class Beehive {
	constructor() {
		this.pollen = 0;
		this.honey = 0;
		this.honeycombs = 5;
		this.freeHoneycombs = 5;
		this.dirtyHoneycombs = 0;
		this.occupiedHoneycombs = 0;
		this.geleeRoyal = 10;
		this.x = beehiveJson.x + beehiveJson.width / 2 + 30;
		this.y = beehiveJson.y - beehiveJson.height / 2 + 50;
	}
}

module.exports = Beehive;
