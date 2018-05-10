/*
 * Author: Jerome Renaux
 * E-mail: jerome.renaux@gmail.com
 */

var Game = {};

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/outside_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('grass', 'assets/map/grass.png',32,32);
    game.load.spritesheet('flowers', 'assets/map/flowers.png',64,64);
    game.load.spritesheet('beehive', 'assets/map/beehive.png',128,160);
    game.load.image('sprite','assets/sprites/bees64px-version2.png');
};

Game.create = function(){
    Game.playerMap = {};
    var map = game.add.tilemap('map');
    Game.addBackGround(map);
    Game.addFlowers(map);
    Game.addBeehive(map);
    Client.askNewPlayer();
};

Game.getCoordinates = function(object,pointer,is_over){
    console.log("Clicked");
    console.log(object.type);
    if(object.name == 'beehive'){
        Client.sendClick(object.centerX,object.centerY);
    } else if (['flower-white','flower-red','flower-purple','flower-yellow'].includes(object.name) ){
        Client.sendClick(object.centerX,object.centerY);
    }
};

Game.addBackGround = function(map) {
  map.addTilesetImage('grass'); // tilesheet is the key of the tileset in map's JSON file
  var layer = map.createLayer('Background');
  layer.resizeWorld();
};

Game.addFlowers = function(map){
  map.addTilesetImage('flowers');
  var flowers = game.add.group();
  map.createFromObjects('Flowers', 'flower-white', 'flowers', 0, true, false, flowers);
  map.createFromObjects('Flowers', 'flower-purple', 'flowers', 1, true, false, flowers);
  map.createFromObjects('Flowers', 'flower-red', 'flowers', 2, true, false, flowers);
  map.createFromObjects('Flowers', 'flower-yellow', 'flowers', 3, true, false, flowers);
  flowers.children.forEach(function(object) {
    object.inputEnabled = true;
    object.events.onInputUp.add(Game.getCoordinates, this);
  });
};

Game.addBeehive = function(map){
  map.addTilesetImage('beehive');
  var beehive = game.add.group();
  map.createFromObjects('Beehive', 'beehive', 'beehive', 0, true, false, beehive);
  beehive.children.forEach(function(object) {
    object.inputEnabled = true;
    object.events.onInputUp.add(Game.getCoordinates, this);
  });
};

Game.returnToHive = function(){

};

Game.addNewPlayer = function(id,x,y){
    var sprite = game.add.sprite(x,y,'sprite');
    sprite.anchor.setTo(0.5);
    Game.playerMap[id] = sprite;
};

Game.movePlayer = function(id,x,y){
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    var tween = game.add.tween(player);
    var duration = distance*10;
    tween.to({x:x,y:y}, duration);
    tween.start();
};

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};
