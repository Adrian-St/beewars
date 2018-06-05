var Beewars = Beewars || {};
Beewars.Game = new function() {
  var Game = this;
  Game.playerMap;
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
    Beewars.game.load.image('sprite','assets/sprites/bees64px-version2.png');
  };

  Game.create = () => {
    Game.playerMap = [];
    var map = Beewars.game.add.tilemap('map');
    Game.addBackground(map);
    Game.addFlowers(map);
    Game.addBeehive(map);
    Game.ressourceLabel = Beewars.game.add.text(5, 0, '');
    Game.printRessource();

    Game.graphics = Beewars.game.add.graphics(0,0);
    Game.graphics.inputEnabled = true;

    //just for testing purposes. delete later on
    Game.beeLabel = Beewars.game.add.text(5, 30, '');
    Game.printBee(0);
    Beewars.Client.askNewPlayer({flowers: Game.flowerSprites.length});
  };

  Game.addBackground = map => {
    map.addTilesetImage('grass'); // tilesheet is the key of the tileset in map's JSON file
    var layer = map.createLayer('Background');
    layer.resizeWorld();
    layer.inputEnabled = true;
    layer.events.onInputUp.add((object, pointer) => {
      Game.deactivateAllOtherShadows({});
      Game.stopAllOtherShadowTweens({});
      Game.graphics.clear();
      Game.printBee();
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
    Game.setBeehivePosition(Game.beehiveSprite.centerX + 30, Game.beehiveSprite.centerY + 50 )
  };

  Game.addBeehiveObject = (beehive) => {
    Game.beehive = new Beewars.Beehive(beehive, Game.beehiveSprite);
  };

  Game.addFlowerObjects = (flowers) => {
    for(i = 0; i < flowers.length ; i++) {
      Game.flowers.push(new Beewars.Flower(flowers[i], Game.flowerSprites.children[i]));
    }
  };

  Game.addProperties = (data) => {
    Game.addFlowerObjects(data.flowers);
    Game.addBeehiveObject(data.beehive);
    for(var i = 0; i < data.players.length; i++){
      Game.addNewPlayer(data.players[i]);
    }
    for(var i = 0; i < data.bees.length; i++) {
      Game.addNewBee(data.bees[i]);
    }
  };

  Game.getCoordinates = (object,pointer) => {
    if(!Game.isBeeSelected) return;
    if(object.name == 'beehive'){
      Game.goToHive();
    } else if (['flower-white','flower-red','flower-purple','flower-yellow'].includes(object.name) ){
      var flower = Game.flowers.find( (flower) => {return (flower.sprite === object);});
      Game.getNectar(flower);
    }
  };

  Game.goToHive = () => {
    if (Game.isBeeSelected()) {
        Beewars.Client.goTo({beeID: Game.getSelectedBee().id, action: 'goToHive', target: {x: Game.beehivePosition.x, y: Game.beehivePosition.y} });
    }
  }

  Game.setBeehivePosition = (x, y) => {
    Game.beehivePosition.x = x;
    Game.beehivePosition.y = y;
  };

  Game.getNectar = flower => {
    if (Game.isBeeSelected()) {
        var moveData = {beeID: Game.getSelectedBee().id, action: 'getNectar', target: {x: flower.sprite.position.x, y: flower.sprite.position.y}, targetID: flower.id }
        Beewars.Client.goTo(moveData);
    }
  };

  Game.printRessource = () => {
    if(Game.beehive) Game.ressourceLabel.setText('Honey at Hive: ' + Game.beehive.honey);
    else Game.ressourceLabel.setText('Honey at Hive: ' + 0);
  }

  Game.printBee = () => {
    if (Game.isBeeSelected()) Game.beeLabel.setText('Nectar on Bee: ' + Game.getSelectedBee().pollen);
    else Game.beeLabel.setText('');
  }

  Game.updateTimer = (value, label) => label.setText(value);

  Game.countDown = seconds => {
      //make a counter so bee wait for some time before it gets the nectar. use callback
  };
  Game.returnNectar = (bee) => {
    Game.beehive.pollen += bee.pollen;
    Game.beehive.honey += bee.pollen;
    Beewars.Client.synchronizeBeehive(Game.beehive.getSendableBeehive());
    Beewars.Client.synchronizeBee(bee.getSendableBee());
    bee.pollen = 0;
    Game.printBee();
  };

  Game.addNectarToBee = (bee, flower) => {
    Game.countDown(10);
    bee.pollen += 10;
    flower.pollen -=10;
    Beewars.Client.synchronizeBee(bee.getSendableBee());
    Beewars.Client.synchronizeFlower(flower.getSendableFlower());
    Game.printBee();
  };

  Game.addNewBee = (serverBee) => {
    var sprite = Beewars.game.add.sprite(serverBee.x,serverBee.y, 'sprite');
    sprite.anchor.setTo(0.5);
    sprite.inputEnabled = true;
    sprite.events.onInputUp.add(Game.onUp, this);
    var bee = new Beewars.Bee(serverBee, sprite);
    Game.bees.push(bee);
  }

  Game.addNewPlayer = (player) => {
    Game.playerMap[player.id] = player;
  };

  Game.moveBee = (moveData) => {
    var bee = Game.bees[moveData.beeID];
    /*if(moveData.target == 'beehive') {
      var x = Game.beehivePosition.x;
      var y = Game.beehivePosition.y;
    }
    else {
      var x = Game.flowers[moveData.targetID].sprite.position.x;
      var y = Game.flowers[moveData.targetID].sprite.position.y;
    }*/

    bee.stopTween(); // In case the bee was flying to another flower (or hive)
    if(bee.shadowTween) {
        bee.stopShadowTween();
    }

    if(moveData.stop) {
      if(bee.shadow)
        Game.showAllActions(bee);
      return;
    }

    bee.startTween({x: moveData.target.x, y: moveData.target.y});

    if(bee.shadow){
      bee.startShadowTween({x: moveData.target.x, y: moveData.target.y});
    }
  };

  Game.playerActions = (playerActions) => {
    var bee = Game.bees[playerActions[0].beeID];
    bee.playerActions = playerActions;
    console.log(bee)
  }

  Game.moveCallback = beeSprite => {
    const bee = Game.getBeeForSprite(beeSprite);
    if (beeSprite.x == Game.beehivePosition.x && beeSprite.y == Game.beehivePosition.y) {
        Game.returnNectar(bee);
    }
    else {
      const flower = Game.getFlowerForPosition({x: beeSprite.x, y: beeSprite.y});
      Game.addNectarToBee(bee, flower);
    }
    Beewars.Client.emptyActions(bee);
    Game.graphics.clear();
  };

  Game.getBeeForSprite = (sprite) => {
    for (var i = 0; i < Game.bees.length; i++) {
      if(Game.bees[i].sprite == sprite) return Game.bees[i];
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
        clickedBee.deactivateShadow(); 
        Game.printBee();
        Game.graphics.clear();
        return;
    }
    if (!clickedBee.shadow){ // the bee wasn't selected before
        clickedBee.activateShadow();
        Game.showAllActions(clickedBee);
        Game.printBee();
    }
    if (clickedBee.shadowTween) { // the bee was selected but moving to another (or the same) flower
        clickedBee.startShadowTween(sprite);
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
        actions.forEach(action => {
          Game.graphics.lineStyle(10, 0xffd900, 1);
          Game.graphics.moveTo(curBee.tween.target.x, curBee.tween.target.y);
          Game.graphics.lineTo(action.x, action.y);
        });
    } else {
       Game.graphics.clear(); 
    }
  }

  Game.showAllActions = (bee) => {
    bee.getActions().forEach(action => {
          Game.graphics.lineStyle(10, 0xffd900, 1);
          Game.graphics.moveTo(bee.sprite.x, bee.sprite.y);
          Game.graphics.lineTo(action.x, action.y);
    });
  }

  Game.removePlayer = id => {
    delete Game.playerMap[id];
  };

  Game.stopAllOtherShadowTweens = (bee) => {
    for(i = 0; i<Game.bees.length; i++){
        const b = Game.bees[i]
        if(b != bee){
            b.stopShadowTween();
        }
    }
  }

  Game.deactivateAllOtherShadows = (bee) => {
    for(i = 0, b = Game.bees[i]; i<Game.bees.length; i++){
        const b = Game.bees[i]
        if(b != bee){
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

  Game.updateGameObject = (updateObject) => {
    if(updateObject.type == "bee") {
      console.log('game.js - updateBee - bee.id: ', updateObject.content.id);
      var beeToBeUpdated = Game.beeForId(updateObject.content.id);
      beeToBeUpdated.age = updateObject.content.age;
      beeToBeUpdated.status = updateObject.content.status;
      beeToBeUpdated.health = updateObject.content.health;
      beeToBeUpdated.energy = updateObject.content.energy;
      beeToBeUpdated.pollen = updateObject.content.pollen;
      beeToBeUpdated.nectar = updateObject.content.nectar;
      beeToBeUpdated.capacity = updateObject.content.capacity;

    } else if (updateObject.type == "beehive") {
      console.log('game.js - updateBeehive');
      const updatedBeehive = updateObject.content;
      Game.beehive.pollen = updatedBeehive.pollen;
      Game.beehive.honey = updatedBeehive.honey;
      Game.beehive.honeycombs = updatedBeehive.honeycombs;
      
    } else if (updateObject.type == "flower") {
      console.log('game.js - updateFlower - flower.id: ', updateObject.content.id);
      var flowerToBeUpdated = Game.flowerForId(updateObject.content.id);
      flowerToBeUpdated.pollen = updateObject.content.pollen;
      flowerToBeUpdated.nectar = updateObject.content.nectar;

    } else {
      console.log('wrong type', updateObject);
    }
  }

  Game.beeForId = id => {
    return Game.bees.find(bee => {return bee.id === id;});
  }

  Game.flowerForId = id => {
    return Game.flowers.find(flower => {return flower.id === id;});
  }
};
