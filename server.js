var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var connection = require('./server/connection.js');
connection.start(io);

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
var ressources = 0;

server.listen(process.env.PORT || 8081, () => {
  console.log('Listening on ' + server.address().port);
});
