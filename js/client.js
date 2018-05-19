var Beewars = Beewars || {};
Beewars.Client = new function(){
  var Client = this;
  Client.socket = io.connect();

  Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
  };

  Client.goTo = function(moveData){
    //moveData example: {beeID: bee.id, action: 'getPollen', target: 'flower', targetNr(optional):flower.id}
    Client.socket.emit('goTo', moveData});
  };

  Client.socket.on('gameObjects',function(data){
    Beewars.Game.addNewPlayer(data.id,data.x,data.y);
  });

  Client.addRessource = function(value) {
	   Client.socket.emit('addRessource',value);
  }

  Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.players.length; i++){
        Beewars.Game.addNewPlayer(data.players[i]);
    }
    for(var i = 0; i < data.bees.length; i++) {
        Beewars.Game.addNewBee(data.bees[id]);
    }

    Client.socket.on('move',function(moveData){
        Beewars.Game.moveBee(moveData);
    });

  	Client.socket.on('remove', function (id) {
  	    Beewars.Game.removePlayer(id);
  	});

  	Client.socket.on('updateRessource', function (ressources) {
  	    Beewars.Game.printRessource(ressources);
  	});
  });
};
