class Flower {
	constructor(serverFlower, flowerSprite) {
		this.id = serverFlower.id;
		this.pollen = serverFlower.pollen;
		this.nectar = serverFlower.nectar;
		this.sprite = flowerSprite;
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

	getSendableFlower() {
		return {
			id: this.id,
			pollen: this.pollen,
			nectar: this.nectar
		};
	}
}
export default Flower;
