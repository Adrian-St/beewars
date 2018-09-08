import { game } from './main.js';
import Insect from './insect.js';

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
		this.stopShadowTween();
	}

	isSelected() {
		return !(this.shadow === null);
	}

	initializeTween() {
		this.tween = game.add.tween(this.sprite);
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

	startShadowTween(destination, offset = 0) {
		const beeSpeed = this.calculateBeeSpeed();
		const duration =
			Phaser.Math.distance(
				this.sprite.position.x,
				this.sprite.position.y,
				destination.x,
				destination.y
			) *
				10 *
				beeSpeed -
			offset;

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
		if (this.shadow) {
			this.shadow.angle = 0;
		}
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
