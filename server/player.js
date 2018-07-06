class Player {
	constructor(id) {
		this.id = id;
		this.experience = 1;
	}

	raiseExpBy(value) {
		this.experience = Math.max(this.experience + value, 0);
	}
}

module.exports = Player;
