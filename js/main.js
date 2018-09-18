import Game from './game.js';
import GameOverScreen from './gameOverScreen.js';
import StatisticsScreen from './statisticsScreen.js';

export const game = new Phaser.Game(
	38 * 32,
	20 * 32,
	Phaser.AUTO,
	document.getElementById('game')
);
game.state.add('Game', Game);
game.state.add('GameOver', GameOverScreen);
game.state.add('Statistics', StatisticsScreen);
game.state.start('Game');
