const RADIUS = 32.0;

class Frog {
	constructor(id, x , y) {
		this.id = id;
		this.x = x;
		this.y = y;
	}

	calculateActualDestination(bee, destination) {
		return {
			x:
				bee.x +
				(destination.x - bee.x) * this.calculatePercentage(bee, destination),
			y:
				bee.y +
				(destination.y - bee.y) * this.calculatePercentage(bee, destination)}
	}

	contains(x,y) {
			const dx = x - this.x;
			const dy = y - this.y;
			const distance = Math.sqrt(dx*dx + dy*dy);
			return (distance <= RADIUS);
	}

	calculatePercentage(bee, destination) {
		const midPointVector = this.makeVector(bee, this);
		const pathVector = this.makeVector(bee, destination);
		const ankath = this.amount(midPointVector);
		const hyp = ankath / this.cosAlpha(midPointVector, pathVector);
		return (hyp / this.amount(pathVector));
	}

	collidesWithPath(bee, destination) {
		const midPointVector = this.makeVector(bee, this);
		const pathVector = this.makeVector(bee, destination);
		const ankath = this.amount(midPointVector);
		const hyp = ankath / this.cosAlpha(midPointVector, pathVector);
		const gegenkath = Math.sqrt(hyp*hyp - ankath*ankath);
		const distanceBeeFrog = this.calculateDistance(bee, this);
		const distanceBeeDestination = this.calculateDistance(bee, destination);
		return ((gegenkath <= RADIUS)&&(distanceBeeFrog <= distanceBeeDestination));
	}

	calculateDistance(object1, object2) {
		var xDistance = object2.x - object1.x;
    var yDistance = object2.y - object1.y;
    return Math.sqrt(xDistance*xDistance + yDistance*yDistance);
	}

	cosAlpha(v1, v2) {
		return (this.dot(v1, v2) / (this.amount(v1) * this.amount(v2)));
	}

	dot(v1, v2) {
		return (v1.x*v2.x + v1.y*v2.y);
	}

	amount(vector) {
		return Math.sqrt(vector.x*vector.x + vector.y*vector.y);
	}

	makeVector(from, to) {
		return {x: to.x - from.x, y: to.y - from.y};
	}
	randomInt(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	}
}

module.exports = Frog;
