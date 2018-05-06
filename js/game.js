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
    game.load.spritesheet('tileset', 'assets/map/grass.png',32,32);
    game.load.spritesheet('beehive', 'assets/sprites/beehive.png')
    game.load.image('sprite','assets/sprites/bees64px-version2.png');
};

Game.create = function(){
    Game.playerMap = {};
    var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    testKey.onDown.add(Client.sendTest, this);

    var map = game.add.tilemap('map');
    map.addTilesetImage('grass', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer = map.createLayer('Background');
    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    layer.events.onInputUp.add(Game.getCoordinates, this);
    //layer.resizeWorld();

    var beehiveLayer = game.add.group();
    var beehive = beehiveLayer.create(32, 320, 'beehive');
    beehive.inputEnabled = true;
    beehive.input.pixelPerfectOver = true;
    beehive.events.onInputUp.add(Game.getCoordinates, this);

    Client.askNewPlayer();
};

Game.getCoordinates = function(layer,pointer){
    if(layer.key == 'beehive'){
        Game.returnToHive(); 
    } else {
        Client.sendClick(pointer.worldX,pointer.worldY);
    } 
};

Game.returnToHive = function(){
    Client.sendClick(150,450);
}

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
