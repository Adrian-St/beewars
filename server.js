var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/', (req,res) => {
  res.sendFile(__dirname+'/index.html');
});

server.lastPlayderID = 0;
var ressources = 0;

server.listen(process.env.PORT || 8081, () => {
  console.log('Listening on ' + server.address().port);
});

io.on('connection', socket => {

  socket.on('newplayer', () => {
    socket.player = {
      id: server.lastPlayderID++,
      x: randomInt(100,400),
      y: randomInt(100,400)
    };
    socket.emit('allplayers', getAllPlayers());
    socket.emit('updateRessource', ressources);
    socket.broadcast.emit('newplayer', socket.player);

    socket.on('goTo', data => {
      socket.player.x = data.x;
      socket.player.y = data.y;
      io.emit('move', socket.player);
    });

    socket.on('addRessource', value => {
      ressources += value;
      io.emit('updateRessource', ressources);
    });

    socket.on('disconnect',() => {
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
