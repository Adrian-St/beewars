var Beewars = Beewars || {};
Beewars.Client = new function(){
  var Client = this;
  Client.socket = io.connect();

  Client.askNewPlayer = (gameObjects) => Client.socket.emit('newplayer', gameObjects);

  Client.goTo = (moveData) => {
    //moveData example: {beeID: bee.id, action: 'getPollen', target: 'flower', targetNr(optional):flower.id}
    moveData.timestamp = Date.now();
    Client.socket.emit('goTo', moveData);
  };

  Client.socket.on('newplayer', (data) => {
    Beewars.Game.addNewPlayer(data);
  });

  Client.addRessource = beehive => Client.socket.emit('addRessource',beehive);

  Client.synchronizeFlower = flower => Client.socket.emit('synchronizeFlowers', flower);

  Client.emptyActions = bee => Client.socket.emit('emptyActions', bee.id);

  Client.socket.on('gameObjects', data => {
    Beewars.Game.addProperties(data);

    Client.socket.on('move', (playerActions) => {
        Beewars.Game.playerActions(playerActions);
        Beewars.Game.moveBee(playerActions[0]);
    });

  	Client.socket.on('remove', id => {
  	    Beewars.Game.removePlayer(id);
  	});

  	Client.socket.on('updateRessource', updatedBeehive => {
        console.log(updatedBeehive);
        Beewars.Game.updateRessources(updatedBeehive);
        Beewars.Game.printRessource();
  	});
  });
};
