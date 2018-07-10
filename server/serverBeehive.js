const mapJson = require('./../assets/map/outside_map.json');

const Beehive = {};
Beehive.pollen = 0;
Beehive.honey = 0;
Beehive.honeycombs = 0;
Beehive.x = mapJson.layers[1].objects[0].x + 100;
Beehive.y = mapJson.layers[1].objects[0].y - 32;

module.exports = Beehive;
