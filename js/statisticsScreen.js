import { game } from './main.js';

class StatisticsScreen {
	init(players) {
		this.players = players;
	}

	preload() {
		game.load.image('menu-background', '/assets/Menu/menu-background.png');
		game.load.image(
			'message-background',
			'/assets/sprites/message-background.png'
		);
	}

	create() {
		document.getElementById('gameover').style.visibility = 'hidden';
		document.getElementById('game').style.visibility = 'visible';
		document.getElementById('menu').style.visibility = 'hidden';
		game.stage.disableVisibilityChange = true;
		game.stage.backgroundColor = '#FFFFFF';

		let lines = 'PlayerID   Experience\n';
	
		this.players.sort(function(p1,p2){return p2.experience - p1.experience});
		this.players.slice(0,5).forEach(player => {
			lines +=
				'        ' + player.id + '               ' + player.experience + '\n';
		});

		const background = game.add.sprite(0, 0, 'menu-background');
		const heading = game.add.text(game.world.centerX, 150, 'Statistics');
		const experienceText = game.add.text(game.world.centerX, 250, lines);
		const menuText = game.add.text(game.world.centerX, 550, 'go back to menu');
		heading.anchor.setTo(0.5);
		experienceText.anchor.setTo(0.5, 0);
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
