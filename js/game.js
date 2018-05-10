var Beewars = Beewars || {};
Beewars.Game = new function() {
  var Game = this;
  Game.tween;
  Game.playerMap;
  Game.beehive; //A Sprite
  Game.flowers; //A Group of sprites

  Game.init = function(){
      Beewars.game.stage.disableVisibilityChange = true;
  };

  Game.preload = function() {
      Beewars.game.load.tilemap('map', 'assets/map/outside_map.json', null, Phaser.Tilemap.TILED_JSON);
      Beewars.game.load.spritesheet('grass', 'assets/map/grass.png',32,32);
      Beewars.game.load.spritesheet('flowers', 'assets/map/flowers.png',64,64);
      Beewars.game.load.spritesheet('beehive', 'assets/map/beehive.png',128,160);
      Beewars.game.load.image('sprite','assets/sprites/bees64px-version2.png');
  };

  Game.create = function(){
      Game.playerMap = {};
      var map = Beewars.game.add.tilemap('map');
      Game.addBackGround(map);
      Game.addFlowers(map);
      Game.addBeehive(map);
      Beewars.Client.askNewPlayer();
      console.log(Module.printNumber());
  };

  Game.getCoordinates = function(object,pointer,is_over){

      if(object.name == 'beehive'){
          Beewars.Client.sendClick(object.centerX,object.centerY);
      } else if (['flower-white','flower-red','flower-purple','flower-yellow'].includes(object.name) ){
          Beewars.Client.sendClick(object.centerX,object.centerY);
      }
  };

  Game.addBackGround = function(map) {
    map.addTilesetImage('grass'); // tilesheet is the key of the tileset in map's JSON file
    var layer = map.createLayer('Background');
    layer.resizeWorld();
  };

  Game.addFlowers = function(map){
    map.addTilesetImage('flowers');
    Game.flowers = Beewars.game.add.group();
    map.createFromObjects('Flowers', 'flower-white', 'flowers', 0, true, false, Game.flowers);
    map.createFromObjects('Flowers', 'flower-purple', 'flowers', 1, true, false, Game.flowers);
    map.createFromObjects('Flowers', 'flower-red', 'flowers', 2, true, false, Game.flowers);
    map.createFromObjects('Flowers', 'flower-yellow', 'flowers', 3, true, false, Game.flowers);
    Game.flowers.children.forEach(function(object) {
      object.inputEnabled = true;
      object.events.onInputUp.add(Game.getCoordinates, this);
    });
  };

  Game.addBeehive = function(map){
    map.addTilesetImage('beehive');
    var beehiveGroup = Beewars.game.add.group();
    map.createFromObjects('Beehive', 'beehive', 'beehive', 0, true, false, beehiveGroup);
    Game.beehive = beehiveGroup.getAt(0);
    Game.beehive.inputEnabled = true;
    Game.beehive.events.onInputUp.add(Game.getCoordinates, this);
  };

  Game.getCoordinates = function(object,pointer){
    if(object.name == 'beehive'){
        Game.goToHive();
    } else if (['flower-white','flower-red','flower-purple','flower-yellow'].includes(object.name) ){
        Game.goToFlower(object);;
    }
  };

  Game.goToHive = function(){
      Beewars.Client.goTo(Game.beehive.centerX + 30, Game.beehive.centerY + 50);
  }

  Game.goToFlower = function(flower){
      if(flower === undefined){
        var flower = Game.flowers.getRandom();
      }
      Beewars.Client.goTo(flower.centerX,flower.centerY);
  }

  Game.getPollen = function(){
      Game.goToFlower();
      Game.goToHive();
  }

  Game.addNewPlayer = function(id,x,y){
      var sprite = Beewars.game.add.sprite(x,y,'sprite');
      sprite.anchor.setTo(0.5);
      Game.playerMap[id] = sprite;
  };

  Game.movePlayer = function(id,x,y){
      if(Game.tween) Game.tween.stop();
      var player = Game.playerMap[id];
      var distance = Phaser.Math.distance(player.x,player.y,x,y);
      Game.tween = Beewars.game.add.tween(player);
      var duration = distance*10;
      Game.tween.to({x:x,y:y}, duration);
      Game.tween.start();
  };

  Game.removePlayer = function(id){
      Game.playerMap[id].destroy();
      delete Game.playerMap[id];
  };
};
