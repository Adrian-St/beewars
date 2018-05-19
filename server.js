var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var game = require('./server/game.js');
var bee = require('./server/bee.js');
var player = require('./server/player.js');
var flower = require('./server/flower.js');
var beehive = require('./server/beehive.js');

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/', (req,res) => {
  res.sendFile(__dirname+'/index.html');
});
var ressources = 0;

server.listen(process.env.PORT || 8081, () => {
  console.log('Listening on ' + server.address().port);
});

io.on('connection', socket => {

  socket.on('newplayer', () => {
    if (game.lastPlayderID == 0) {
      game.start();
    }

    socket.player = new player (game.lastPlayderID++);
    game.players.push(socket.player);
    socket.emit('gameObjects', game.allObjects());

    socket.broadcast.emit('newplayer', socket.player);

    socket.on('goTo', data => {
      socket.player.x = data.x;
      socket.player.y = data.y;
      io.emit('move', data);
    });

    socket.on('addRessource', value => {
      ressources += value;
      io.emit('updateRessource', ressources);
    });

    socket.on('disconnect', () => {
      game.players.splice(socket.player.id, 1);
      io.emit('remove', socket.player.id);
    });
  });
});

function getAllPlayers(){
  var players = [];
  Object.keys(io.sockets.connected).forEach(socketID => {
    var player = io.sockets.connected[socketID].player;
    if(player) players.push(player);
  });
  return players;
}

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
