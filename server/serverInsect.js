class Insect {
  constructor(id) {
    this.id = id;
    this.x = this.randomInt(100, 400);
    this.y = this.randomInt(100, 400);
    this.flyTimer = null;
    this.destination = null;
    this.flyDuration = 0;
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
    //Uses Euclidean distance
    var xDistance = gameObject.x - this.x;
    var yDistance = gameObject.y - this.y;
    return Math.sqrt(xDistance*xDistance + yDistance*yDistance);
  }

  onArriveAtDestination() {
    console.log('Should be overriden');
  }
}

module.exports = Insect;
