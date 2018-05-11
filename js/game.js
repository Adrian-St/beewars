var Game = {};
var tween;
var bee = {
    nectar: 0
}

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

    var map = game.add.tilemap('map');
    map.addTilesetImage('grass', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer = map.createLayer('Background');
    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    layer.events.onInputUp.add(Game.getCoordinates, this);
    //layer.resizeWorld();

    ressourceLabel = game.add.text(5, 0, '');
    Game.printRessource(0);

    //just for testing purposes. delete later on
    beeLabel = game.add.text(5, 30, '');    
    Game.printBee(0);

    var beehiveLayer = game.add.group();
    var beehive = beehiveLayer.create(32, 320, 'beehive');
    beehive.inputEnabled = true;
    beehive.input.pixelPerfectOver = true;
    beehive.events.onInputUp.add(Game.getCoordinates, this);    

    Client.askNewPlayer();
};

Game.getCoordinates = function(layer,pointer){
    if (layer.key == 'beehive') {
        Game.goToHive();
    }
    else {
        Client.goTo(pointer.worldX, pointer.worldY);
    }
};

Game.hivePosition = {
    x : 150,
    y : 450
}

Game.goToHive = function () {
    Client.goTo(Game.hivePosition.x, Game.hivePosition.y);
}

Game.goToFlower = function(){
    Client.goTo(0,0);
}

Game.printRessource = function (value) {
    ressourceLabel.setText('Nectar at Hive: ' + value);
}

//just for testing purposes. delete later on
Game.printBee = function (value) {
    beeLabel.setText('Nectar on Bee: ' + value);
}

Game.updateTimer = function (value, label) {    
    label.setText(value);
}

Game.countDown = function (seconds) {
    //make a counter so bee wait for some time before it gets the nectar. use callback
}

Game.getNectar = function(){      
    Game.countDown(10);
    bee.nectar += 10;
    //just for testing purposes. delete later on
    Game.printBee(bee.nectar);
}

Game.returnNectar = function(){        
    Client.addRessource(bee.nectar);
    bee.nectar = 0;
    Game.printBee(bee.nectar);
}

Game.addNewPlayer = function(id,x,y){
    var sprite = game.add.sprite(x,y,'sprite');
    sprite.anchor.setTo(0.5);
    Game.playerMap[id] = sprite;
};

Game.movePlayer = function(id,x,y){
    if(tween) tween.stop();
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    tween = game.add.tween(player);
    var duration = distance*10;
    tween.to({x:x,y:y}, duration);    
    tween.onComplete.add(function (player) { Game.moveCallback(player) }, this);
    tween.start();
};

Game.moveCallback = function(player) {
    if (player.x == Game.hivePosition.x && player.y == Game.hivePosition.y) {
        Game.returnNectar();
    }
    else {
        Game.getNectar();
    }
}

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};
