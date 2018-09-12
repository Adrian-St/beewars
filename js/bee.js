import { game } from './main.js';
import Insect from './insect.js';
import Game from './game.js';

class Bee extends Insect {
	constructor(serverBee, sprite) {
		super(serverBee, sprite);
		this.age = serverBee.age;
		this.status = serverBee.status;
		this.energy = serverBee.energy;
		this.pollen = serverBee.pollen;
		this.nectar = serverBee.nectar;
		this.capacity = serverBee.capacity;
		this.innerProgressBar = null;
		this.playerActions = serverBee.playerActions;
		this.type = serverBee.type;
		this.shadow = null;
		this.shadowTween = null;
		this.shadowAnimation = null;
		if (serverBee.target) this.startTween(serverBee.target);
	}

	activateShadow() {
		const graphics = new Phaser.Graphics(0, 0);
		graphics.lineStyle(5, 0xffff00, 0.8);
		// Draw a circle
		graphics.drawCircle(0, 0, 36);
		const texture = graphics.generateTexture();
		this.shadow = game.add.sprite(this.sprite.x, this.sprite.y, texture);
		this.shadow.anchor.set(0.5);
		this.sprite.bringToTop();
	}

	deactivateShadow() {
		if (this.shadowAnimation) {
			this.shadowAnimation.stop(true);
			this.shadowAnimation = null;
		}
		if (this.shadow) {
			this.shadow.destroy();
			this.shadow = null;
		}
	}

	isSelected() {
		return !(this.shadow === null);
	}

	calculateBeeSpeed() {
		return (this.pollen + this.nectar) / 100 + 1;
	}

	calculateSpeed() {
		return this.calculateBeeSpeed();
	}

	initializeShadowTween() {
		this.shadowTween = game.add.tween(this.shadow);
	}

	startTween(destination) {
		super.startTween(destination);
		this.tween.onUpdateCallback(Game.onTweenRunning, Game);
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

	stopAnimation() {
		super.stopAnimation();
		if (this.shadowAnimation) {
			this.shadowAnimation.stop(true);
			this.shadowAnimation = null;
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
}

const STATES = {
	IDLE: 0,
	WORKING: 1,
	INACTIVE: 2
};

Bee.STATES = STATES;

export default Bee;
