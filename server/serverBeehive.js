const mapJson = require('./../assets/map/outside_map.json');

const beehiveJson = mapJson.layers[1].objects[0];

const Beehive = {};
Beehive.pollen = 0;
Beehive.honey = 0;
Beehive.honeycombs = 5;
Beehive.freeHoneycombs = 5;
Beehive.dirtyHoneycombs = 0;
Beehive.occupiedHoneycombs = 0;
Beehive.geleeRoyal = 10;
Beehive.x = beehiveJson.x + beehiveJson.width / 2 + 30;
Beehive.y = beehiveJson.y - beehiveJson.height / 2 + 50;

module.exports = Beehive;
