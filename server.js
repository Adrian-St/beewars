const http = require('http');
const path = require('path');
const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
const helpers = require('express-helpers')(app); // the linter complains, but this is needed for the ejs files

const server = http.createServer(app);
const io = require('socket.io').listen(server);
const connection = require('./server/connection.js').Connection;
const gameLabels = require('./server/connection.js').getGameLabels;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

connection.start(io);

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/games/new', (req, res) => {
	res.render('new_game');
});

app.post('/games', (req, res) => {
	const label = req.body.identifier;
	res.redirect('/games/' + label + '-' + uuidv1());
});

app.get('/games/:id', (req, res) => {
	res.render('game', { room: req.params.id });
});

app.get('/games', (req, res) => {
	res.render('games', { labels: gameLabels() });
});

app.get('/instructions', (req, res) => {
	res.render('instructions');
});

server.listen(process.env.PORT || 8081, () => {
	console.log('Listening on ' + server.address().port);
});
