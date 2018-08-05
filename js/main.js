import Game from './game.js';
import MainMenu from './mainMenu.js';

export const game = new Phaser.Game(
	30 * 32,
	20 * 32,
	Phaser.AUTO,
	document.getElementById('game')
);
game.state.add('Game', Game);
game.state.add('MainMenu', MainMenu);
game.state.start('MainMenu');
