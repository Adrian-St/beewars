class Insect {
	constructor(id, game, x = 0, y = 0) {
		this.game = game;
		this.age = 0;
		this.id = id;
		this.x = x;
		this.y = y;
		this.flyTimer = null;
		this.destination = null;
		this.flyDuration = 0;
	}

	increaseAge() {
		this.age += 1;
		if (this.age >= 45) {
			this.die();
			return false;
		}

		return true;
	}

	die() {
		throw new Error('die must be implemented by subclasses!');
	}

	startFlyTimer(destination) {
		this.resetFlyTimer();
		this.setDestination(destination);
		this.flyTimer = setTimeout(
			this.onArriveAtDestination.bind(this),
			this.flyDuration
		);
	}

	resetFlyTimer() {
		if (this.flyTimer !== null) {
			clearTimeout(this.flyTimer);
			this.flyTimer = null;
		}
	}

	setDestination(destination) {
		this.destination = destination;
		if (destination === null) this.flyDuration = 0;
		else
			this.flyDuration =
				this.calculateDistance(destination) * 10 * this.calculateSpeed();
	}

	calculateDistance(gameObject) {
		// Uses Euclidean distance
		const xDistance = gameObject.x - this.x;
		const yDistance = gameObject.y - this.y;
		return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
	}

	calculateFlownDistancePercentage() {
		return 1 - this.getTimeLeft(this.flyTimer) / this.flyDuration;
	}

	calculateNewPosition() {
		this.x =
			this.x +
			(this.destination.x - this.x) * this.calculateFlownDistancePercentage();
		this.y =
			this.y +
			(this.destination.y - this.y) * this.calculateFlownDistancePercentage();
	}

	getTimeLeft(timeout) {
		return Math.ceil(
			timeout._idleStart + timeout._idleTimeout - process.uptime() * 1000
		);
	}

	onArriveAtDestination() {
		console.log('Should be overriden');
	}
}

module.exports = Insect;
