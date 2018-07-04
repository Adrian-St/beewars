var Beewars = Beewars || {};
Beewars.Client = new function(){
  var Client = this;
  Client.socket = io.connect();

  Client.registerNewPlayer = () => Client.socket.emit('newplayer');

  Client.requestMovement = (moveData) => { 
    moveData.timestamp = Date.now();
    Client.socket.emit('requestMovement', moveData) // movedata is a light version of playerAction and it must have 'target', 'timespan' and 'beeId'
  }

  Client.socket.on('gameObjects', data => {
    Beewars.Game.addProperties(data);

    Client.socket.on('stateOfBee', bee => { // this includes updating the player actions
        var updatedBee = Beewars.Game.updateBee(bee);
        if(bee.playerActions.length > 0) Beewars.Game.moveBee(updatedBee);
    });

    Client.socket.on('stateOfFlower', flower => {
        Beewars.Game.updateFlower(flower);
    });

    Client.socket.on('stateOfBeehive', beehive => {
        Beewars.Game.updateBeehive(beehive);
    });
  });
};
