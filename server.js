const http = require('http');
const path = require('path');
const express = require('express');

const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const connection = require('./server/connection.js');

connection.start(io);

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(process.env.PORT || 8081, () => {
	console.log('Listening on ' + server.address().port);
});
