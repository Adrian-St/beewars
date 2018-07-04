class Flower {
	constructor(id) {
		this.id = id;
		this.nectar = this.randomInt(100, 200);
		this.pollen = this.randomInt(100, 200);
	}

	randomInt(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	}

	collectPollen(amount) {
		this.pollen -= amount;
		if (this.pollen < 0) {
			const actualAmount = amount + this.pollen;
			this.pollen = 0;
			return actualAmount;
		}
		return amount;
	}

	collectNectar(amount) {
		this.pollen -= amount;
		if (this.pollen < 0) {
			const actualAmount = amount + this.pollen;
			this.pollen = 0;
			return actualAmount;
		}
		return amount;
	}
}

module.exports = Flower;
