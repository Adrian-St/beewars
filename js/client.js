var Beewars = Beewars || {};
Beewars.Client = new function(){
  var Client = this;
  Client.socket = io.connect();

  Client.askNewPlayer = () => Client.socket.emit('newplayer');

  Client.goTo = (moveData) => {
    //moveData example: {beeID: bee.id, action: 'getPollen', target: 'flower', targetNr(optional):flower.id}
    Client.socket.emit('goTo', moveData});
  };

  Client.socket.on('gameObjects', (data) => {
    Beewars.Game.addNewPlayer(data.id,data.x,data.y);
  });

  Client.addRessource = value => Client.socket.emit('addRessource',value);

  Client.socket.on('allplayers', data => {
    for(var i = 0; i < data.players.length; i++){
        Beewars.Game.addNewPlayer(data.players[i]);
    }
    for(var i = 0; i < data.bees.length; i++) {
        Beewars.Game.addNewBee(data.bees[id]);
    }

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
