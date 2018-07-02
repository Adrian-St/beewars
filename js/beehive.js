class Beehive {
	constructor(serverBeehive, sprite) {
		this.pollen = serverBeehive.pollen;
		this.honey = serverBeehive.honey;
		this.honeycombs = serverBeehive.honeycombs;
		this.sprite = sprite;
	}

	getSendableBeehive() {
		return {
			pollen: this.pollen,
			honey: this.honey,
			honeycombs: this.honeycombs
		};
	}
}

export default Beehive;
