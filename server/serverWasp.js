const Insect = require('./serverInsect.js');
const { BeeTypes } = require('./serverBee.js');

class Wasp extends Insect {
	constructor(id, game, x = 0, y = 0) {
		super(id, game, x, y);
		this.health = 300;
		this.attackTimer = null;
		this.speed = 3;
		this.flower = null;
		this.attackPower = 25;
		this.age = 25;
	}

	cancelAllTimeEvents() {
		this.resetFlyTimer();
		this.resetAttackTimer();
	}

	calculateSpeed() {
		return this.speed;
	}

	flyToFlower(excludedFlower) {
		const flower = this.findNearestFlower(excludedFlower);
		this.startFlyTimer(flower);
		this.game.waspStartsFlying(this);
	}

	findNearestFlower(excludedFlower) {
		// Refactored to fly to random flower
		const flowers = this.game.flowers.filter(flower => {
			return flower !== excludedFlower;
		});
		const flower = flowers[Math.floor(Math.random() * flowers.length)];
		return flower;
	}

	startAttackTimer() {
		this.resetAttackTimer();
		this.attackTimer = setInterval(this.fightBees.bind(this), 2000);
	}

	resetAttackTimer() {
		if (this.attackTimer !== null) {
			clearTimeout(this.attackTimer);
			this.attackTimer = null;
		}
	}

	getRandomBee(bees) {
		return bees[Math.floor(Math.random() * bees.length)];
	}

	findBeesOnFlower() {
		const filterFunction = function(bee) {
			return (
				bee.x === this.flower.x &&
				bee.y === this.flower.y &&
				bee.type === BeeTypes.OUTSIDEBEE &&
				bee.flyTimer === null
			);
		}.bind(this);
		return this.game.bees.filter(filterFunction);
	}

	fightBees() {
		if (this.flower === null)
			console.log('[WARNING] cannot fight bees when not on flower');
		const bees = this.findBeesOnFlower();
		if (bees.length === 0) {
			this.resetAttackTimer();
			this.flyToFlower(this.flower);
			return;
		}
		this.attack(this.getRandomBee(bees));
		bees.some(bee => {
			return this.takeDamage(bee);
		});
	}

	attack(bee) {
		bee.reduceHealth(this.attackPower);
	}

	takeDamage(bee) {
		this.health -= bee.attackPower;
		if (this.health <= 0) {
			this.die();
			return true;
		}

		return false;
	}

	die() {
		this.game.removeWasp(this);
	}

	onArriveAtDestination() {
		if (this.destination === null)
			console.log('[WARNING] destination is null but it shouldnt');
		this.resetFlyTimer();
		this.x = this.destination.x;
		this.y = this.destination.y;
		this.flower = this.destination;
		this.setDestination(null);
		this.game.waspArrivedAtFlower(this);
		this.startAttackTimer();
	}

	getSendableWasp() {
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			health: this.health,
			moving: this.flyTimer !== null,
			speed: this.speed,
			target: this.destination
		};
	}
}

module.exports = Wasp;
