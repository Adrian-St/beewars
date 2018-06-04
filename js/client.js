var Beewars = Beewars || {};
Beewars.Client = new function(){
  var Client = this;
  Client.socket = io.connect();

  Client.askNewPlayer = (gameObjects) => Client.socket.emit('newplayer', gameObjects);

  Client.goTo = (moveData) => {
    //moveData example: {beeID: bee.id, action: 'getPollen', target: 'flower', targetNr(optional):flower.id}
    Client.socket.emit('goTo', moveData);
  };

  Client.socket.on('newplayer', (data) => {
    Beewars.Game.addNewPlayer(data);
  });

  Client.synchronizeBeehive = beehive => Client.socket.emit('synchronizeBeehive',beehive);

  Client.synchronizeFlower = flower => Client.socket.emit('synchronizeFlower', flower);

  Client.synchronizeBee = bee => Client.socket.emit('synchronizeBee', bee);

  Client.socket.on('gameObjects', data => {
    Beewars.Game.addProperties(data);

    Client.socket.on('move', (moveData) => {
        Beewars.Game.moveBee(moveData);
    });

  	Client.socket.on('remove', id => {
  	    Beewars.Game.removePlayer(id);
  	});

  	Client.socket.on('updateGameObject', updatedObject => {
        Beewars.Game.updateGameObject(updatedObject);
        Beewars.Game.printRessource();
  	});
  });
};
