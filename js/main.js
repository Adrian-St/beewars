var Beewars = Beewars || {};
var Phaser = Phaser || {};

Beewars.game = new Phaser.Game(
	30 * 32,
	20 * 32,
	Phaser.AUTO,
	document.getElementById("game")
);
Beewars.game.state.add("Game", Beewars.Game);
Beewars.game.state.start("Game");
