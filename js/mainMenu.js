import { game } from './main.js';

class MainMenu {
	create() {
		document.getElementById('menu').style.visibility = 'hidden';
		game.stage.disableVisibilityChange = true;
		game.stage.backgroundColor = '#FFFFFF';

		const txt = game.add.text(100, 260, 'Start Game');
		txt.anchor.setTo(0.5);
		txt.inputEnabled = true;

		txt.events.onInputUp.add(() => {
			document.getElementById('menu').style.visibility = 'visible';
			game.state.start('Game');
		});
	}
}

export default new MainMenu();
