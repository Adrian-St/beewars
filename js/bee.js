import { game } from './main.js';
import Game from './game.js';

class Bee {
	constructor(serverBee, sprite) {
		this.id = serverBee.id;
		this.age = serverBee.age;
		this.status = serverBee.status;
		this.health = serverBee.health;
		this.energy = serverBee.energy;
		this.pollen = serverBee.pollen;
		this.nectar = serverBee.nectar;
		this.capacity = serverBee.capacity;
		this.sprite = sprite;
		this.tween = null;
		this.shadow = null;
		this.shadowTween = null;
		this.playerActions = [];
	}

	activateShadow() {
		this.shadow = game.add.sprite(this.sprite.x, this.sprite.y, 'sprite');
		this.shadow.anchor.set(0.5);
		this.shadow.tint = 0x000000;
		this.shadow.alpha = 0.6;
		this.shadow.scale.setTo(1.1, 1.1);
		this.sprite.bringToTop();
	}

	deactivateShadow() {
		if (this.shadow) {
			this.shadow.destroy();
			this.shadow = null;
		}
	}

	initializeTween() {
		this.tween = game.add.tween(this.sprite);
	}

	calculateBeeSpeed() {
		return (this.pollen + this.nectar) / 100 + 1;
	}

	startTween(destination) {
		const beeSpeed = this.calculateBeeSpeed();
		const duration =
			Phaser.Math.distance(
				this.sprite.position.x,
				this.sprite.position.y,
				destination.x,
				destination.y
			) *
			10 *
			beeSpeed;

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

	initializeShadowTween() {
		this.shadowTween = game.add.tween(this.shadow);
	}

	startShadowTween(destination) {
		const beeSpeed = this.calculateBeeSpeed();
		const duration =
			Phaser.Math.distance(
				this.sprite.position.x,
				this.sprite.position.y,
				destination.x,
				destination.y
			) *
			10 *
			beeSpeed;
		this.initializeShadowTween();
		this.shadowTween.to(destination, duration);
		this.shadowTween.start();
	}

	stopShadowTween() {
		if (this.shadowTween) {
			this.shadowTween.stop();
			this.shadowTween = null;
		}
	}

	getSendableBee() {
		return {
			id: this.id,
			x: this.sprite.x,
			y: this.sprite.y,
			age: this.age,
			status: this.status,
			health: this.health,
			energy: this.energy,
			pollen: this.pollen,
			nectar: this.nectar,
			capacity: this.capacity
		};
	}

	getActions() {
		// This gets all of the playerActions from one Bee and removes the "stop" Actions
		return this.playerActions
			.map(action => {
				if (!action.stop) {
					return { x: action.target.x, y: action.target.y };
				}
				return null;
			})
			.filter(el => el);
	}
}

const STATES = {
	IDLE: 0,
	WORKING: 1,
	INACTIVE: 2
};

Bee.STATES = STATES;

export default Bee;
