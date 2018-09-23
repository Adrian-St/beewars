import { game } from './main.js';

class GameOverScreen {
	init(score, highscore, players) {
		this.score = score;
		this.highscore = highscore;
		this.players = players;
	}

	create() {
		document.getElementById('gameover').style.visibility = 'hidden';
		document.getElementById('game').style.visibility = 'visible';
		document.getElementById('menu').style.visibility = 'hidden';
		game.stage.disableVisibilityChange = true;
		game.stage.backgroundColor = '#FFFFFF';

		let scoreTxt = '';
		if (this.score === this.highscore)
			scoreTxt = 'You have beaten the highscore. New score: ' + this.score;
		else
			scoreTxt =
				'Your beehive survived: ' +
				this.score +
				' days. The highscore is: ' +
				this.highscore;

		const gameOverText = game.add.text(game.world.centerX, 150, 'Game Over');
		const scoreText = game.add.text(game.world.centerX, 250, scoreTxt);
		const menuText = game.add.text(game.world.centerX, 350, 'go back to menu');
		const statisticsText = game.add.text(
			game.world.centerX,
			450,
			'view player statistics'
		);
		gameOverText.anchor.setTo(0.5);
		scoreText.anchor.setTo(0.5);
		menuText.anchor.setTo(0.5);
		statisticsText.anchor.setTo(0.5);
		gameOverText.setStyle({ font: 'bold 52px Arial' });
		scoreText.setStyle({ font: 'bold 32px Arial' });
		menuText.setStyle({ font: 'bold 22px Arial' });
		statisticsText.setStyle({ font: 'bold 22px Arial' });
		menuText.inputEnabled = true;
		statisticsText.inputEnabled = true;

		menuText.events.onInputUp.add(() => {
			document.getElementById('gameover').style.visibility = 'visible';
			window.location.replace('/');
		});

		statisticsText.events.onInputUp.add(() => {
			document.getElementById('gameover').style.visibility = 'visible';
			game.state.start('Statistics', true, true, this.players);
		});
	}
}

export default new GameOverScreen();
