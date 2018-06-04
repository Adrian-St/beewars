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

  Client.addRessource = ressourcesData => Client.socket.emit('addRessource', ressourcesData);

  Client.socket.on('gameObjects', data => {
    Beewars.Game.addProperties(data);

    Client.socket.on('move', (moveData) => {
        Beewars.Game.moveBee(moveData);
    });

  	Client.socket.on('remove', id => {
  	    Beewars.Game.removePlayer(id);
  	});

  	Client.socket.on('updateRessource', ressources => {
  	    Beewars.Game.printRessource(ressources);
  	});
  });
};
