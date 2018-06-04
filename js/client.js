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

  Client.addRessource = beehive => Client.socket.emit('addRessource',beehive);

  Client.synchronizeFlower = flower => Client.socket.emit('synchronizeFlowers', flower);

  Client.socket.on('gameObjects', data => {
    Beewars.Game.addProperties(data);

    Client.socket.on('move', (moveData) => {
        Beewars.Game.moveBee(moveData);
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
