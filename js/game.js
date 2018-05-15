var Beewars = Beewars || {};
Beewars.Game = new function() {
  var Game = this;
  Game.tween;
  Game.playerMap;
  Game.beehive; //A Sprite
  Game.flowers; //A Group of sprites
  Game.bee = {
    nectar: 0
  }
  Game.ressourceLabel;
  Game.beeLabel;
  Game.beehivePosition = {
    x: 0,
    y: 0
  }
  Game.line;
  Game.graphics;

  Game.init = () => Beewars.game.stage.disableVisibilityChange = true;

  Game.preload = () => {
    Beewars.game.load.tilemap('map', 'assets/map/outside_map.json', null, Phaser.Tilemap.TILED_JSON);
    Beewars.game.load.spritesheet('grass', 'assets/map/grass.png',32,32);
    Beewars.game.load.spritesheet('flowers', 'assets/map/flowers.png',64,64);
    Beewars.game.load.spritesheet('beehive', 'assets/map/beehive.png',128,160);
    Beewars.game.load.image('sprite','assets/sprites/bees64px-version2.png');
  };

  Game.create = () => {
    Game.playerMap = {};
    var map = Beewars.game.add.tilemap('map');
    Game.addBackground(map);
    Game.addFlowers(map);
    Game.addBeehive(map);
    Game.ressourceLabel = Beewars.game.add.text(5, 0, '');
    Game.printRessource(0);

    Game.graphics = Beewars.game.add.graphics(0,0);

    //just for testing purposes. delete later on
    Game.beeLabel = Beewars.game.add.text(5, 30, '');
    Game.printBee(0);
    Beewars.Client.askNewPlayer();
  };

  Game.addBackground = map => {
    map.addTilesetImage('grass'); // tilesheet is the key of the tileset in map's JSON file
    var layer = map.createLayer('Background');
    layer.resizeWorld();
  };

  Game.addFlowers = map => {
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

  Game.addBeehive = map => {
    map.addTilesetImage('beehive');
    var beehiveGroup = Beewars.game.add.group();
    map.createFromObjects('Beehive', 'beehive', 'beehive', 0, true, false, beehiveGroup);
    Game.beehive = beehiveGroup.getAt(0);
    Game.beehive.inputEnabled = true;
    Game.beehive.events.onInputUp.add(Game.getCoordinates, this);
    Game.setBeehivePosition(Game.beehive.centerX + 30, Game.beehive.centerY + 50 )
  };

  Game.getCoordinates = (object,pointer) => {
    console.log("clicked");
    if(object.name == 'beehive'){
      Game.goToHive();
    } else if (['flower-white','flower-red','flower-purple','flower-yellow'].includes(object.name) ){
      Game.goToFlower(object);;
    }
  };

  Game.goToHive = () => Beewars.Client.goTo(Game.beehivePosition.x, Game.beehivePosition.y);

  Game.setBeehivePosition = (x, y) => {
    Game.beehivePosition.x = x;
    Game.beehivePosition.y = y;
  };

  Game.goToFlower = flower => {
    if(flower === undefined){
      var flower = Game.flowers.getRandom();
    }
    Beewars.Client.goTo(flower.centerX,flower.centerY);
  };

  Game.printRessource = value => Game.ressourceLabel.setText('Nectar at Hive: ' + value);

  //just for testing purposes. delete later on
  Game.printBee = value => Game.beeLabel.setText('Nectar on Bee: ' + value);

  Game.updateTimer = (value, label) => label.setText(value);

  Game.countDown = seconds => {
      //make a counter so bee wait for some time before it gets the nectar. use callback
  };

  Game.getNectar = () => {
    Game.countDown(10);
    Game.bee.nectar += 10;
    //just for testing purposes. delete later on
    Game.printBee(Game.bee.nectar);
  };

  Game.returnNectar = () => {
    Beewars.Client.addRessource(Game.bee.nectar);
    Game.bee.nectar = 0;
    Game.printBee(Game.bee.nectar);
  };

  Game.addNewPlayer = (id, x, y) => {
    var sprite = Beewars.game.add.sprite(x,y,'sprite');
    sprite.anchor.setTo(0.5);
    Game.playerMap[id] = sprite;
  };

  Game.movePlayer = (id, x, y) => {
    console.log("move");
    if(Game.tween) Game.tween.stop();
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    Game.tween = Beewars.game.add.tween(player);
    var duration = distance*10;
    Game.line = new Phaser.Line(player.x,player.y,x,y);
    Game.graphics.lineStyle(10, 0xffd900, 1);
    Game.graphics.moveTo(Game.line.start.x,Game.line.start.y);//moving position of graphic if you draw mulitple lines
    Game.graphics.lineTo(Game.line.end.x,Game.line.end.y);
    Game.graphics.endFill();
    Game.tween.to({x:x,y:y}, duration);
    Game.tween.onComplete.add(Game.moveCallback, this);
    Game.tween.start();
  };

  Game.moveCallback = player => {
    if (player.x == Game.beehivePosition.x && player.y == Game.beehivePosition.y) {
        Game.returnNectar();
    }
    else {
        Game.getNectar();
    }
  };

  Game.removePlayer = id => {
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
  };
};
