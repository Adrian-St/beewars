class Insect {
	constructor(id) {
		this.age = 0;
		this.id = id;
		this.x = this.randomInt(100, 400);
		this.y = this.randomInt(100, 400);
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

	randomInt(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
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

	onArriveAtDestination() {
		console.log('Should be overriden');
	}
}

module.exports = Insect;
