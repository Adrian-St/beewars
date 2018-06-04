
var Connection = {};
var io;
var game = require('./serverGame.js');

Connection.start = (param) => {
  io = param;
  game.setConnection(Connection);
  io.on('connection', socket => {

    socket.on('newplayer', (gameObjects) => {
      if (game.lastPlayerID == 0) {
        game.start(gameObjects);
        socket.emit('newGame');
      }
      socket.player = game.newPlayer();
      socket.emit('gameObjects', game.allObjects());

      socket.broadcast.emit('newplayer', socket.player);

      socket.on('goTo', moveData => {
        io.emit('move', game.performActionForBee(moveData));
      });

      socket.on('synchronizeBeehive', updatedBeehive => {
        Connection.updateGameObject(game.handleSynchronizeBeehive(updatedBeehive));//io.emit('updateGameObject', game.handleSynchronizeBeehive(updatedBeehive));
      });

      socket.on('synchronizeBee', updatedBee => {
        Connection.updateGameObject(game.handleSynchronizeBee(updatedBee));
      });

      socket.on('disconnect', () => {
        game.players.splice(socket.player.id, 1);
        io.emit('remove', socket.player.id);
      });
    });
  });
};

Connection.updateBees = (bees) => {
  io.emit('updateBees', bees);
};

Connection.updateGameObject = (updatedGameObject) => {
  io.emit('updateGameObject', updatedGameObject);
};

module.exports = Connection;

function getAllPlayers(){
  var players = [];
  Object.keys(io.sockets.connected).forEach(socketID => {
    var player = io.sockets.connected[socketID].player;
    if(player) players.push(player);
  });
  return players;
}
