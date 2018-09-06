import { game } from './main.js';
import Game from './game.js';

class Wasp {
	constructor(serverWasp, sprite) {
		this.id = serverWasp.id;
		this.speed = serverWasp.speed;
		this.health = serverWasp.health;
		this.sprite = sprite;
		this.tween = null;
		this.animation = null;
		this.shadow = null;
		this.shadowTween = null;
		if (serverWasp.target) this.startTween(serverWasp.target);
	}

	initializeTween() {
		this.tween = game.add.tween(this.sprite);
		if (Game.currentState === 'INSIDE') this.sprite.visible = false;
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
		this.animation = this.sprite.animations.add('fly', null, 25);
		this.initializeTween();
		this.tween.to(destination, duration);
		this.animation.play(25, true);
		this.sprite.angle = this.calculateAngle(destination);
		this.tween.start();
		this.tween.onUpdateCallback(Game.onTweenRunning, Game);
	}

	calculateAngle(destination) {
		const direction = this.makeVector(this.sprite, destination);
		console.log(direction);
		const up = {x: 0, y: -1};
		const cosAlpha = this.cosAlpha(up, direction);
		console.log(cosAlpha)
		let angle = this.degrees(Math.acos(cosAlpha));
		if(direction.x < 0 ) {
			angle = 360 - angle;
		}
		console.log(angle);
		return angle;
	}

	stopTween() {
		this.animation.stop(true);
		if (this.tween) {
			this.tween.stop();
			this.tween = null;
		}
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

export default Wasp;
