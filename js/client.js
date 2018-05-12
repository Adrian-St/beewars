var Beewars = Beewars || {};
Beewars.Client = new function(){
  var Client = this;
  Client.socket = io.connect();

  Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
  };

  Client.goTo = function(x,y){
    Client.socket.emit('goTo',{x:x,y:y});
  };

  Client.socket.on('newplayer',function(data){
    Beewars.Game.addNewPlayer(data.id,data.x,data.y);
  });

  Client.addRessource = function(value) {
	   Client.socket.emit('addRessource',value);
  }

  Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
        Beewars.Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }

    Client.socket.on('move',function(data){
        Beewars.Game.movePlayer(data.id,data.x,data.y);
    });

  	Client.socket.on('remove', function (id) {
  	    Beewars.Game.removePlayer(id);
  	});

  	Client.socket.on('updateRessource', function (ressources) {
  	    Beewars.Game.printRessource(ressources);
  	});
  });
};
