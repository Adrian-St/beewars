var mapJson = require('./../assets/map/outside_map.json');
var Beehive = {}
Beehive.pollen = 0;
Beehive.honey = 0;
Beehive.honeycombs = 0;
Beehive.x = mapJson.layers[1].objects[0].x;
Beehive.y = mapJson.layers[1].objects[0].y;

module.exports = Beehive;
