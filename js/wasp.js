import { game } from './main.js';
import Game from './game.js';
import Insect from './insect.js';

class Wasp extends Insect {
	constructor(serverWasp, sprite) {
		super(serverWasp, sprite);
		this.speed = serverWasp.speed;
		if (serverWasp.target) this.startTween(serverWasp.target);
	}

	initializeTween() {
		super.initializeTween();
		if (Game.currentState === 'INSIDE') this.sprite.visible = false;
	}

	calculateSpeed() {
		return this.speed
	}
}

export default Wasp;
