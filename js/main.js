import Game from './game.js';
import MainMenu from './mainMenu.js';
import GameOverScreen from './gameOverScreen.js';

export const game = new Phaser.Game(
	38 * 32,
	20 * 32,
	Phaser.AUTO,
	document.getElementById('game')
);
game.state.add('Game', Game);
game.state.add('MainMenu', MainMenu);
game.state.add('GameOver', GameOverScreen);
game.state.start('MainMenu', true, true);
