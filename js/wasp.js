import { game } from './main.js';
import Game from './game.js';

class Wasp {
	constructor(serverWasp, sprite) {
		this.id = serverWasp.id;
		this.speed = serverWasp.speed;
		this.health = serverWasp.health;
		this.sprite = sprite;
		this.tween = null;
		this.shadow = null;
		this.shadowTween = null;
	}

  initializeTween() {
		this.tween = game.add.tween(this.sprite);
		if(!(Game.currentState == Game.outsideState)) this.sprite.visible = false; 
	}

  startTween(destination) {
		const duration =
			Phaser.Math.distance(
				this.sprite.position.x,
				this.sprite.position.y,
				destination.x,
				destination.y
			) *
			10 *
			this.speed;

		this.initializeTween();
		this.tween.to(destination, duration);
		this.tween.start();
		this.tween.onUpdateCallback(Game.onTweenRunning, Game);
	}

	stopTween() {
		if (this.tween) {
			this.tween.stop();
			this.tween = null;
		}
	}
}

export default Wasp;
