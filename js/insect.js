import { game } from './main.js';
import Game from './game.js';

class Insect {
	constructor(serverInsect, sprite) {
		this.id = serverInsect.id;
		this.health = serverInsect.health;
		this.sprite = sprite;
		this.tween = null;
		this.animation = null;
	}

	initializeTween() {
		this.tween = game.add.tween(this.sprite);
	}

	startTween(destination, offset = 0) {
		const duration =
			Phaser.Math.distance(
				this.sprite.position.x,
				this.sprite.position.y,
				destination.x,
				destination.y
			) *
			10 *
			this.calculateSpeed();

		this.animation = this.sprite.animations.add('fly', null, 25);
		this.initializeTween();
		this.tween.to(destination, duration - offset);
		this.animation.play(25, true);
		this.sprite.angle = this.calculateAngle(destination);
		this.tween.start();
		this.tween.onUpdateCallback(Game.onTweenRunning, Game);
	}

  stopAnimation() {
    this.sprite.angle = 0;
    if(this.animation) {
      this.animation.stop(true);
      this.animation = null;
    }  
  }

  stopTween() {
		if (this.tween) {
      this.sprite.angle = 0;
      if (this.shadow) this.shadow.angle = 0;
			this.tween.stop();
			this.tween = null;
		}
	}

  calculateSpeed() {
    throw new Error('calculateSpeed must be implemented by subclasses!');
  }

	calculateAngle(destination) {
		const direction = this.makeVector(this.sprite, destination);
		const up = {x: 0, y: -1};
		const cosAlpha = this.cosAlpha(up, direction);
		let angle = this.degrees(Math.acos(cosAlpha));
		if(direction.x < 0 ) {
			angle = 360 - angle;
		}
		return angle;
	}

	degrees(radians) {
  	return radians * 180 / Math.PI;
	}

	cosAlpha(v1, v2) {
		return this.dot(v1, v2) / (this.amount(v1) * this.amount(v2));
	}

	dot(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y;
	}

	amount(vector) {
		return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
	}

	makeVector(from, to) {
		return { x: to.x - from.x, y: to.y - from.y };
	}
}

export default Insect;
