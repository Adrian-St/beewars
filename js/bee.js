import { game } from './main.js';
import Game from './game.js';
import Client from './client.js';

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
		this.timer = null;
		this.type = serverBee.type;		
		this.x = serverBee.x;
		this.y = serverBee.y;
	}

	activateShadow() {
		this.shadow = game.add.sprite(this.x, this.y, 'sprite');
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
				this.x,
				this.y,
				destination.x,
				destination.y
			) *
			10 *
			beeSpeed;

		this.initializeTween();
		this.tween.to(destination, duration);
		if (this.type === 1) {
			this.tween.onComplete.add(Game.moveCallbackHiveBees, Game);
		} else {
			this.tween.onComplete.add(Game.moveCallback, Game);
		}
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
				this.x,
				this.y,
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
			x: this.x,
			y: this.y,
			age: this.age,
			status: this.status,
			health: this.health,
			energy: this.energy,
			pollen: this.pollen,
			nectar: this.nectar,
			capacity: this.capacity,
			type: this.type
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

	resetTimer() {
		if (this.timer !== null) {
			game.time.events.remove(this.timer);
			this.timer = null;
		}
	}

	startTimer() {
		this.resetTimer();
		this.timer = game.time.events.add(
			Phaser.Timer.SECOND * 10,
			this.onElapsedTime,
			this
		);
	}

	onElapsedTime() {
		Client.beeIsIdleForTooLong(this);
	}
}

export default Bee;
