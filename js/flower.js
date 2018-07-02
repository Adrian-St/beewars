Beewars = Beewars || {};

Beewars.Flower = function(serverFlower, flowerSprite) {
	this.id = serverFlower.id;
	this.pollen = serverFlower.pollen;
	this.nectar = serverFlower.nectar;
	this.sprite = flowerSprite;
};

Beewars.Flower.prototype.collectPollen = function(amount) {
	this.pollen -= amount;
	if (this.pollen < 0) {
		const actualAmount = amount + this.pollen;
		this.pollen = 0;
		return actualAmount;
	}
	return amount;
};

Beewars.Flower.prototype.collectNectar = function(amount) {
	this.pollen -= amount;
	if (this.pollen < 0) {
		const actualAmount = amount + this.pollen;
		this.pollen = 0;
		return actualAmount;
	}
	return amount;
};

Beewars.Flower.prototype.getSendableFlower = function() {
	return {
		id: this.id,
		pollen: this.pollen,
		nectar: this.nectar
	};
};
