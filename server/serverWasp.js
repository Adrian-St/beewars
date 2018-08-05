const Game = require('./serverGame.js');
const Insect = require('./serverInsect.js');

class Wasp extends Insect {
	constructor(id) {
		super(id);
		this.health = 300;
		this.attackTimer = null;
		this.speed = 3;
		this.flower = null;
		this.attackPower = 25;
	}

	cancelAllTimeEvents() {
		this.resetFlyTimer();
		this.resetAttackTimer();
	}

	calculateSpeed() {
		return this.speed;
	}

	flyToNearestFlower(excludedFlower) {
		const flower = this.findNearestFlower(excludedFlower);
		this.startFlyTimer(flower);
		Game.waspStartsFlying(this);
	}

	findNearestFlower(excludedFlower) {
		let nearestFlower =
			Game.flowers[0] === excludedFlower ? Game.flowers[1] : Game.flowers[0];
		let closestDistance = this.calculateDistance(nearestFlower);
		Game.flowers.forEach(flower => {
			if (flower === excludedFlower) return;
			const distance = this.calculateDistance(flower);
			if (distance < closestDistance) {
				closestDistance = distance;
				nearestFlower = flower;
			}
		}, this);
		return nearestFlower;
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
				bee.x == this.flower.x && bee.y == this.flower.y && bee.flyTimer == null
			);
		}.bind(this);
		return Game.bees.filter(filterFunction);
	}

	fightBees() {
		if (this.flower === null)
			console.log('[WARNING] cannot fight bees when not on flower');
		const bees = this.findBeesOnFlower();
		if (bees.length == 0) {
			this.resetAttackTimer();
			this.flyToNearestFlower(this.flower);
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
		Game.removeWasp(this);
	}

	onArriveAtDestination() {
		if (this.destination === null)
			console.log('[WARNING] destination is null but it shouldnt');
		this.resetFlyTimer();
		this.x = this.destination.x;
		this.y = this.destination.y;
		this.flower = this.destination;
		this.setDestination(null);
		Game.waspArrivedAtFlower(this);
		this.startAttackTimer();
	}

	getSendableWasp() {
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			health: this.health,
			moving: this.flyTimer != null,
			speed: this.speed,
			target: this.destination
		};
	}
}

module.exports = Wasp;
