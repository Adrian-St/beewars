var Beewars = Beewars || {};
Beewars.Client = new function(){
  var Client = this;
  Client.socket = io.connect();

  Client.askNewPlayer = () => Client.socket.emit('newplayer');

  Client.goTo = (id, x, y) => Client.socket.emit('goTo', {id: id, x: x, y: y});

  Client.socket.on('newplayer', data => {
    Beewars.Game.addNewPlayer(data.id,data.x,data.y);
  });

  Client.addRessource = value => Client.socket.emit('addRessource',value);

  Client.socket.on('allplayers', data => {
    for(var i = 0; i < data.length; i++){
        Beewars.Game.addNewPlayer(data[i].id, data[i].x, data[i].y);
    }

    Client.socket.on('move', data => {
        Beewars.Game.movePlayer(data.id, data.x, data.y);
    });

  	Client.socket.on('remove', id => {
  	    Beewars.Game.removePlayer(id);
  	});

  	Client.socket.on('updateRessource', ressources => {
  	    Beewars.Game.printRessource(ressources);
  	});
  });
};
