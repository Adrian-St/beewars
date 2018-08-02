const Game = require('./serverGame.js');

class Wasp {
  constructor(id) {
    this.id = id;
    this.x = this.randomInt(100, 400);
    this.y = this.randomInt(100, 400);
    this.health = 300;
    this.flyTimer = null;
    this.attackTimer = null;
    this.destination = null;
    this.flyDuration = 0;
    this.speed = 5;
    this.flower = null;
    this.attackPower = 25;
  }

  cancelAllTimeEvents() {
		this.resetFlyTimer();
		this.resetAttackTimer();
	}

  startFlyTimer(destination) {
		this.resetFlyTimer();
		this.setDestination(destination);
		this.flyTimer = setTimeout(
			this.onArriveAtDestination.bind(this),
			this.flyDuration);
	}

  flyToNearestFlower(excludedFlower) {
    var flower = this.findNearestFlower(excludedFlower);
    console.log('Flower: ' + flower.id);
    this.startFlyTimer(flower);
    Game.waspStartsFlying(this);
  }

  setDestination(destination) {
		this.destination = destination;
		if (destination === null) this.flyDuration = 0;
		else
			this.flyDuration =
				this.calculateDistance(destination) * 10 * this.speed;
	}

  findNearestFlower(excludedFlower) {
    var nearestFlower = Game.flowers[0] === excludedFlower ? Game.flowers[1] : Game.flowers[0]
    var closestDistance = this.calculateDistance(nearestFlower);
    Game.flowers.forEach( (flower) => {
      if (flower === excludedFlower) return;
      var distance = this.calculateDistance(flower);
      if(distance < closestDistance) {
        closestDistance = distance;
        nearestFlower = flower;
      }
    }, this);
    return nearestFlower
  }

  calculateDistance(gameObject) {
    //Uses Euclidean distance
    var xDistance = gameObject.x - this.x;
    var yDistance = gameObject.y - this.y;
    return Math.sqrt(xDistance*xDistance + yDistance*yDistance);
  }

  randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
  }

	resetFlyTimer() {
		if (this.flyTimer !== null) {
			clearTimeout(this.flyTimer);
			this.flyTimer = null;
		}
	}

  startAttackTimer() {
    this.resetAttackTimer();
    this.attackTimer = setInterval(
      this.fightBees.bind(this),
      2000);
  }

  resetAttackTimer() {
    if (this.attackTimer !== null) {
      clearTimeout(this.attackTimer);
      this.attackTimer = null;
    }
  }

  getRandomBee(bees) {
    return bees[Math.floor(Math.random()*bees.length)];
  }

  findBeesOnFlower() {
    var filterFunction = (function(bee) { return (bee.x == this.flower.x)&&(bee.y == this.flower.y)&&(bee.flyTimer == null);}).bind(this);
    return Game.bees.filter(filterFunction);
  }

  fightBees() {
      console.log('Fight Bees');
      if(this.flower === null) console.log('[WARNING] cannot fight bees when not on flower')
      var bees = this.findBeesOnFlower();
      if(bees.length == 0) {
        console.log('No bees anymore')
        this.resetAttackTimer();
        this.flyToNearestFlower(this.flower);
        return;
      }
      this.attack(this.getRandomBee(bees));
      bees.some((bee) => {
        return this.takeDamage(bee);
      });
  }

  attack(bee) {
      console.log('Reduce health by ' + this.attackPower);
      bee.reduceHealth(this.attackPower);
  }

  takeDamage(bee) {
    this.health -= bee.attackPower;
    if(this.health <= 0) {
      this.die();
      return true;
    }
    else {
      return false;
    }
  }

  die() {
    Game.removeWasp(this);
  }

  onArriveAtDestination() {
    console.log(this.destination);
    console.log('Arrived at Flower' + this.destination.id);
  	if (this.destination === null)
  		console.log('[WARNING] destination is null but it shouldnt');

  	this.resetFlyTimer();
  	this.x = this.destination.x;
  	this.y = this.destination.y;
    this.flower = this.destination;
  	this.setDestination(null);
    Game.waspArrivedAtFlower(this);
    this.startAttackTimer();
  }

  getSendableWasp() {
    return {
      id: this.id,
			x: this.x,
			y: this.y,
      health: this.health,
      moving: (this.flyTimer != null),
      speed: this.speed,
      target: this.destination
    }
  }
}

module.exports = Wasp;
