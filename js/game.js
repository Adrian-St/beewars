var Beewars = Beewars || {};
Beewars.Game = new function() {
  var Game = this;
  Game.beehiveSprite; //A Sprite
  Game.flowerSprites; //A Group of sprites
  Game.beehive;
  Game.flowers = [];
  Game.bees = [];
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
    Beewars.game.load.image('sprite', 'assets/sprites/bees64px-version2.png');    
    Beewars.game.load.image('progressbar', 'assets/sprites/innerProgessBar.png');
  };

  Game.create = () => {
    var map = Beewars.game.add.tilemap('map');
    Game.addBackground(map);
    Game.addFlowers(map);
    Game.addBeehive(map);
    Game.graphics = Beewars.game.add.graphics(0,0);
    Beewars.Client.registerNewPlayer();
  };

  Game.addBackground = map => {
    map.addTilesetImage('grass'); // grass is the key of the tileset in map's JSON file
    var layer = map.createLayer('Background');
    layer.resizeWorld();
    layer.inputEnabled = true;
    layer.events.onInputUp.add((object, pointer) => {
      createHiveMenu(Game.beehive, Game.bees.length);
      Game.deactivateAllOtherShadows({});
      Game.stopAllOtherShadowTweens({});
      Game.graphics.clear();
    }, this)
  };

  Game.addFlowers = map => {
    map.addTilesetImage('flowers');
    Game.flowerSprites = Beewars.game.add.group();
    map.createFromObjects('Flowers', 'flower-white', 'flowers', 0, true, false, Game.flowerSprites);
    map.createFromObjects('Flowers', 'flower-purple', 'flowers', 1, true, false, Game.flowerSprites);
    map.createFromObjects('Flowers', 'flower-red', 'flowers', 2, true, false, Game.flowerSprites);
    map.createFromObjects('Flowers', 'flower-yellow', 'flowers', 3, true, false, Game.flowerSprites);
    Game.flowerSprites.children.forEach(object => {
      object.anchor.setTo(0.5);
      object.inputEnabled = true;
      object.events.onInputUp.add(Game.getCoordinates, this);
    });
  };

  Game.addBeehive = (map) => {
    map.addTilesetImage('beehive');
    var beehiveGroup = Beewars.game.add.group();
    map.createFromObjects('Beehive', 'beehive', 'beehive', 0, true, false, beehiveGroup);
    Game.beehiveSprite = beehiveGroup.getAt(0);
    Game.beehiveSprite.inputEnabled = true;
    Game.beehiveSprite.events.onInputUp.add(Game.getCoordinates, this);
  };

  Game.addBeehiveObject = (beehive) => {
    Game.beehive = new Beewars.Beehive(beehive, Game.beehiveSprite);
    Game.setBeehivePosition(beehive.x, beehive.y)
  };

  Game.addFlowerObjects = (flowers) => {
    for(i = 0; i < flowers.length ; i++) {
      Game.flowers.push(new Beewars.Flower(flowers[i], Game.flowerSprites.children[i]));
    }
  };

  Game.addProperties = (data) => {
    Game.addFlowerObjects(data.flowers);
    Game.addBeehiveObject(data.beehive);
    for(var i = 0; i < data.bees.length; i++) {
      Game.addNewBee(data.bees[i]);
    }
    createHiveMenu(Game.beehive.getSendableBeehive(), Game.bees.length);
  };

  Game.setBeehivePosition = (x, y) => {
    Game.beehivePosition.x = x;
    Game.beehivePosition.y = y;
  };

  Game.addNewBee = (serverBee) => {
    var sprite = Beewars.game.add.sprite(serverBee.x,serverBee.y, 'sprite');
    sprite.anchor.setTo(0.5);
    sprite.inputEnabled = true;
    sprite.events.onInputUp.add(Game.onUp, this);
    var bee = new Beewars.Bee(serverBee, sprite);
    Game.bees.push(bee);
  }

  Game.deactivateBee = (bee, seconds) => {
    Game.createProgressBar(bee.sprite.x, bee.sprite.y, 'progressbar', 50, 10, seconds, 0);
    Game.time.events.add(Phaser.Timer.SECOND * seconds, function () { Game.activateBee(bee) }, this);
  }

  Game.createProgressBar = (x, y, image, barWidth, barHeight, seconds, type) => {
      // type: 0 = decreasing | 1 = increasing
      
      var innerProgressBar = Game.add.sprite(x - barWidth / 2, y - barWidth, image);
      innerProgressBar.inputEnabled = false;
      if (type == 0) {
          innerProgressBar.width = barWidth;
      }
      else if (type == 1) {
          innerProgressBar.width = 0;
      }
      
      innerProgressBar.height = barHeight;
      innerProgressBar.progress = barWidth / seconds;

      Game.time.events.repeat(Phaser.Timer.SECOND, seconds, function () { Game.updateProgressBar(innerProgressBar, type) }, this);
  }


  Game.updateProgressBar = (progressBar, type) => {
    console.log('progress')
      if (type == 0)      progressBar.width = progressBar.width - progressBar.progress;
      else if (type == 1) progressBar.width = progressBar.width + progressBar.progress;  
  }

  Game.activateBee = (bee) => {
      console.log("Dobby is a free bee!");
  }

  Game.getBeeForSprite = (sprite) => {
    for (var i = 0; i < Game.bees.length; i++) {
      if(Game.bees[i].sprite == sprite) return Game.bees[i];
    }
  }

  Game.getFlowerForSprite = (sprite) => {
    for (var i = 0; i < Game.flowers.length; i++) {
      if(Game.flowers[i].sprite == sprite) return Game.flowers[i];
    }
  }

  Game.getFlowerForPosition = (position) => {
    for (var i = 0; i < Game.flowers.length; i++) {
      if(Game.flowers[i].sprite.position.x == position.x && Game.flowers[i].sprite.position.y == position.y) return Game.flowers[i];
    }
  }

  Game.onUp = (sprite, pointer) => {
    var clickedBee = Game.bees.find(item => item.sprite === sprite);

    Game.stopAllOtherShadowTweens(clickedBee);
    Game.deactivateAllOtherShadows(clickedBee);

    if (clickedBee.shadow) {    // the bee had already a shadow
        createHiveMenu(Game.beehive.getSendableBeehive(), Game.bees.length);
        clickedBee.deactivateShadow();
        Game.graphics.clear();
        return;
    }
    if (!clickedBee.shadow){ // the bee wasn't selected before
        createBeeMenu(clickedBee.getSendableBee());
        clickedBee.activateShadow();
        Game.showAllActions(clickedBee);
    }
    if (clickedBee.shadowTween) { // the bee was selected but moving to another (or the same) flower
        clickedBee.startShadowTween({x: sprite.x, y: sprite.y});
    }
    if (clickedBee.tween && clickedBee.tween.isRunning) { // in case the 'new' bee is (already) flying
         clickedBee.startShadowTween({x: clickedBee.tween.properties.x, y: clickedBee.tween.properties.y});
    }
  };

  Game.onTweenRunning = () => {
    if(Game.isBeeSelected() && Game.getSelectedBee().shadow && Game.getSelectedBee().tween){
        var curBee = Game.getSelectedBee();
        var actions = curBee.getActions();
        Game.graphics.clear();
        Game.showAllActions(curBee);
    } else {
       Game.graphics.clear();
    }
  }

  Game.showAllActions = (bee) => {
    Game.graphics.clear();
    bee.getActions().forEach(action => {
          Game.graphics.lineStyle(10, 0xffd900, 1);
          Game.graphics.moveTo(bee.sprite.x, bee.sprite.y);
          Game.graphics.lineTo(action.x, action.y);
    });
  }

  Game.stopAllOtherShadowTweens = (bee) => {
    for(i = 0; i<Game.bees.length; i++){
        const b = Game.bees[i]
        if(b.id !== bee.id){
            b.stopShadowTween();
        }
    }
  }

  Game.deactivateAllOtherShadows = (bee) => {
    for(i = 0, b = Game.bees[i]; i<Game.bees.length; i++){
        const b = Game.bees[i]
        if(b.id !== bee.id){
            b.deactivateShadow();
        }
    }
  }

  Game.isBeeSelected = () => {
    for (var i = 0; i < Game.bees.length; i++) {
        if(Game.bees[i].shadow) return true;
    }
    return false;
  }

  Game.getSelectedBee = () => {
    for (var i = 0; i < Game.bees.length; i++) {
        if(Game.bees[i].shadow) return Game.bees[i];
    }
  }

  Game.beeForId = id => {
    return Game.bees.find(bee => {return bee.id === id;});
  }

  Game.flowerForId = id => {
    return Game.flowers.find(flower => {return flower.id === id;});
  }

  // NEW -------------------------------------------------------------------------------------
  Game.updateBee = bee => {
    var beeToBeUpdated = Game.beeForId(bee.id);
    if(beeToBeUpdated.status === 3){ // bee was blocked
      if(bee.status === 0) Game.activateBee(beeToBeUpdated); // bee is free now
    }else if(bee.status === 3) Game.deactivateBee(beeToBeUpdated); // bee is now blocked
    beeToBeUpdated.age = bee.age;
    beeToBeUpdated.status = bee.status;
    beeToBeUpdated.health = bee.health;
    beeToBeUpdated.energy = bee.energy;
    beeToBeUpdated.pollen = bee.pollen;
    beeToBeUpdated.nectar = bee.nectar;
    beeToBeUpdated.capacity = bee.capacity;
    beeToBeUpdated.playerActions = bee.playerActions;
    if (document.getElementById('menu').firstChild.id == ("beeMenu-" + beeToBeUpdated.id)) {
      createBeeMenu(beeToBeUpdated);
    }
    return beeToBeUpdated;
  }

  Game.updateFlower = flower => {
    var flowerToBeUpdated = Game.flowerForId(flower.id);
    flowerToBeUpdated.pollen = flower.pollen;
    flowerToBeUpdated.nectar = flower.nectar;

    if (document.getElementById('menu').firstChild.id == ("flowerMenu-" + flowerToBeUpdated.id)) {
      createFlowerMenu(flowerToBeUpdated);
    }
  }

  Game.updateBeehive = beehive => {
    Game.beehive.pollen = beehive.pollen;
    Game.beehive.honey = beehive.honey;
    Game.beehive.honeycombs = beehive.honeycombs;

    if (document.getElementById('menu').firstChild.id == "hiveMenu") {
      createHiveMenu(Game.beehive, Game.bees.length);
    }
  }

  Game.getCoordinates = (object,pointer) => {
    if(object.name == 'beehive'){
      if(Game.isBeeSelected()) {
        Game.requestGoToHive(); 
      }
      else {
        createHiveMenu(Game.beehive, Game.bees.length);
      }
    } else if (['flower-white','flower-red','flower-purple','flower-yellow'].includes(object.name) ){
      if(Game.isBeeSelected()) {
        var flower = Game.flowers.find( (flower) => {return (flower.sprite === object);});
        Game.requestGoToFlower(flower);
      }
      else {
        createFlowerMenu(Game.getFlowerForSprite(object));
      }
    }
  };

  Game.requestGoToHive = () => {
    if (Game.isBeeSelected()) {
        var x = Game.beehivePosition.x;
        var y = Game.beehivePosition.y;
        Beewars.Client.requestMovement(Game.createMoveData(x, y));
        //Game.getSelectedBee().resetTimer();
    }
  }

  Game.requestGoToFlower = flower => { 
    if (Game.isBeeSelected()) {
        var x = flower.sprite.position.x;
        var y = flower.sprite.position.y;
        Beewars.Client.requestMovement(Game.createMoveData(x, y));
    }
  };

  Game.createMoveData = (x,y) => {
    return {beeID: Game.getSelectedBee().id, target: {x: x, y: y}}
  }

  Game.moveBee = (bee) => {
    var action = bee.playerActions[0];

    bee.stopTween(); // In case the bee was flying to another flower (or hive)
    if(bee.shadowTween) {
        bee.stopShadowTween();
    }

    if(action.stop) {
      if(bee.shadow)
        Game.showAllActions(bee);
      return;
    }

    bee.startTween({x: action.target.x, y: action.target.y});

    if(bee.shadow){
      bee.startShadowTween({x: action.target.x, y: action.target.y});
    }
  };
};
