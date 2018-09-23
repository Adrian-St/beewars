class Flower {
	constructor(id) {
		this.id = id;
		this.nectar = this.randomInt(100, 200);
		this.pollen = this.randomInt(100, 200);
		this.x = 0;
		this.y = 0;
		this.color = "";
	}

	randomInt(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	}

	collectPollen() {
		const amount = this.pollenAmount();
		this.pollen -= amount;
		if (this.pollen < 0) {
			const actualAmount = amount + this.pollen;
			this.pollen = 0;
			return actualAmount;
		}
		return amount;
	}

	collectNectar() {
		const amount = this.nectarAmount();
		this.nectar -= amount;
		if (this.nectar < 0) {
			const actualAmount = amount + this.nectar;
			this.nectar = 0;
			return actualAmount;
		}
		return amount;
	}

	pollenAmount(){
		switch(this.color) {
			case "flower-red" : return 5;
			case "flower-white" : return 10;
			case "flower-yellow" : return 10;
			case "flower-purple" : return 15;
			default : return 0;
		}
	}

	nectarAmount(){
		switch(this.color) {
			case "flower-red" : return 15;
			case "flower-white" : return 10;
			case "flower-yellow" : return 10;
			case "flower-purple" : return 5;
			default : return 0;
		}
	}
}

module.exports = Flower;
