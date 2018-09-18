import { game } from './main.js';

class StatisticsScreen {
	init(players) {
		this.players = players;
	}

	create() {
		document.getElementById('gameover').style.visibility = 'hidden';
		document.getElementById('game').style.visibility = 'visible';
		document.getElementById('menu').style.visibility = 'hidden';
		game.stage.disableVisibilityChange = true;
		game.stage.backgroundColor = '#FFFFFF';

		let lines = "PlayerID   Experience\n";
		this.players.forEach(player => {
			lines += "        " + player.id + "               " + player.experience + "\n";
		});

		const heading = game.add.text(game.world.centerX, 150, 'Statistics');
		const experienceText = game.add.text(game.world.centerX, 250, lines);
		const menuText = game.add.text(game.world.centerX, 350, 'go back to menu');
		heading.anchor.setTo(0.5);
		experienceText.anchor.setTo(0.5);
		menuText.anchor.setTo(0.5);
		heading.setStyle({ font: 'bold 52px Arial' });
		experienceText.setStyle({ font: 'bold 32px Arial' });
		menuText.setStyle({ font: 'bold 22px Arial' });
		menuText.inputEnabled = true;

		menuText.events.onInputUp.add(() => {
			document.getElementById('gameover').style.visibility = 'visible';
			window.location.replace('/');
		});
	}
}

export default new StatisticsScreen();
