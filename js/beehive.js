class Beehive {
	constructor(serverBeehive, sprite) {
		this.pollen = serverBeehive.pollen;
		this.honey = serverBeehive.honey;
		this.honeycombs = serverBeehive.honeycombs;
		this.freeHoneycombs = serverBeehive.freeHoneycombs;
		this.dirtyHoneycombs = serverBeehive.dirtyHoneycombs;
		this.occupiedHoneycombs = serverBeehive.occupiedHoneycombs;
		this.geleeRoyal = serverBeehive.geleeRoyal;
		this.sprite = sprite;
	}

	getSendableBeehive() {
		return {
			pollen: this.pollen,
			honey: this.honey,
			honeycombs: this.honeycombs,
			freeHoneycombs: this.freeHoneycombs,
			dirtyHoneycombs: this.dirtyHoneycombs,
			occupiedHoneycombs: this.occupiedHoneycombs,
			geleeRoyal: this.geleeRoyal
		};
	}
}

export default Beehive;
