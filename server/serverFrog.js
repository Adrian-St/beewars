class Frog {
	constructor(id, x , y) {
		this.id = id;
		this.x = 0;
		this.y = 0;
	}

	randomInt(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	}
}

module.exports = Frog;
