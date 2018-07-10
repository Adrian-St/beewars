const Game = require('./serverGame.js');

class Bee {
	constructor(id) {
		this.states = {
			IDLE: 0,
			WORKING: 1,
			DEAD: 2,
			INACTIVE: 3
		};
		this.id = id;
		this.x = this.randomInt(100, 400);
		this.y = this.randomInt(100, 400);
		this.age = 0;
		this.status = this.states.IDLE;
		this.health = 100;
		this.energy = 100;
		this.pollen = 0;
		this.nectar = 0;
		this.capacity = 100;
		this.playerActions = [];
		this.idleTimer = null; // Meassures the time since the bee performed the last action
		this.flyTimer = null;
		this.inactiveTimer = null; // Blocks the bee for a while after an action is performed
		this.onIdleForTooLong = null;
		this.onArriveAtDestination = null;
		this.onActivateBee = null;
		this.destination = null;
		this.flyDuration = 0;
	}

	/* Schema of a playerAction
playerAction {
  id: int,
  timestamp: long,
  target: position,
  beeID: int,
  playerIDs: [int],
  weight: int,
  stop: boolean // gets always overridden from server
}
*/

	randomInt(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	}

	increaseAge() {
		this.age += 1;
		if (this.age >= 45) {
			this.status = this.states.DEAD;
		}
	}

	reduceHealth(amount) {
		this.health -= amount;
		if (this.health <= 0) {
			this.health = 0;
			this.status = this.states.DEAD;
		}
	}

	performAction(playerAction) {
		// Calculate here what action to perform
		this.removeStopActions();

		const indexOfExistingAction = this.playerActions.findIndex(
			action =>
				action.target.x === playerAction.target.x &&
				action.target.y === playerAction.target.y
		);
		const indexOfOldPlayerAction = this.playerActions.findIndex(action =>
			action.playerIDs.includes(playerAction.playerID)
		);
		if (indexOfExistingAction === -1) {
			if (indexOfOldPlayerAction !== -1) {
				this.removeOldPlayerAction(
					playerAction.playerID,
					indexOfOldPlayerAction
				);
			}
			playerAction.id = Game.lastActionId;
			playerAction.playerIDs = [playerAction.playerID];
			this.playerActions.push(playerAction);
			Game.lastActionId++;
		} else if (indexOfOldPlayerAction !== indexOfExistingAction) {
			this.playerActions[indexOfExistingAction].timestamp =
				playerAction.timestamp;
			this.playerActions[indexOfExistingAction].playerIDs.push(
				playerAction.playerID
			);
			this.removeOldPlayerAction(playerAction.playerID, indexOfOldPlayerAction);
		}
		this.calculateWeightsForActions();

		this.playerActions.sort((a, b) => {
			return b.weight - a.weight;
		});

		if (this.playerActions.length > 1) {
			if (this.playerActions[0].weight - this.playerActions[1].weight < 0.2) {
				const newPlayerActions = [];
				newPlayerActions.push({ beeID: this.id, stop: true });
				this.playerActions.forEach(action => newPlayerActions.push(action));
				return newPlayerActions;
			}
		}
		if (this.playerActions.length > 0)
			this.setDestination(this.playerActions[0].target);
	}

	removeOldPlayerAction(playerID, indexOfOldPlayerAction) {
		this.playerActions[indexOfOldPlayerAction].playerIDs.splice(
			this.playerActions[indexOfOldPlayerAction].playerIDs.indexOf(playerID),
			1
		);
		if (this.playerActions[indexOfOldPlayerAction].playerIDs.length === 0) {
			this.playerActions.splice(indexOfOldPlayerAction, 1);
		}
	}

	removeStopActions() {
		this.playerActions = this.playerActions.filter(action => !action.stop);
	}

	calculateWeightsForActions() {
		this.playerActions = this.playerActions.map(action => {
			action.weight = action.playerIDs.reduce((total, playerID) => {
				return (
					total + Game.players.find(player => player.id === playerID).experience
				);
			}, 0);
			return action;
		});
	}

	setInactive() {
		this.status = this.states.INACTIVE;
		this.startInactiveTimer();
	}

	startIdleTimer() {
		this.resetIdleTimer();
		this.idleTimer = setTimeout(this.onIdleForTooLong, 10000, this); // 10ces
	}

	resetIdleTimer() {
		if (this.idleTimer !== null) {
			clearTimeout(this.idleTimer);
			this.idleTimer = null;
		}
	}

	startInactiveTimer() {
		this.resetInactiveTimer();
		this.inactiveTimer = setTimeout(this.onActivateBee, 4000, this); // 4sec
	}

	resetInactiveTimer() {
		// This method is not needed because the inactiveTimer can not be called again before the timer runs out
		// but this makes it more safe to operate with the timer
		if (this.inactiveTimer !== null) {
			clearTimeout(this.inactiveTimer);
			this.inactiveTimer = null;
		}
	}

	startFlyTimer(destination) {
		this.resetFlyTimer();
		this.setDestination(destination);
		this.flyTimer = setTimeout(
			this.onArriveAtDestination,
			this.flyDuration,
			this
		);
	}

	resetFlyTimer() {
		if (this.flyTimer !== null) {
			// Everytime the timer resets we calculate the new x and y
			// this is the case when there is a conflict
			this.calculateNewPosition();
			clearTimeout(this.flyTimer);
			this.flyTimer = null;
		}
	}

	setDestination(destination) {
		this.destination = destination;
		if (destination === null) this.flyDuration = 0;
		else this.flyDuration = this.calculateDistance(destination) * 10;
	}

	calculateFlownDistancePercentage() {
		return 1 - this.getTimeLeft(this.flyTimer) / this.flyDuration;
	}

	calculateNewPosition() {
		this.x =
			this.x +
			(this.destination.x - this.x) * this.calculateFlownDistancePercentage();
		this.y =
			this.y +
			(this.destination.y - this.y) * this.calculateFlownDistancePercentage();
	}

	calculateDistance(destination) {
		return Math.sqrt(
			(this.x - destination.x) * (this.x - destination.x) +
				(this.y - destination.y) * (this.y - destination.y)
		);
	}

	getTimeLeft(timeout) {
		return Math.ceil(
			timeout._idleStart + timeout._idleTimeout - process.uptime() * 1000
		);
	}

	getSendableBee() {
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			age: this.age,
			status: this.status,
			health: this.health,
			energy: this.energy,
			pollen: this.pollen,
			nectar: this.nectar,
			capacity: this.capacity,
			playerActions: this.playerActions
		};
	}
}

module.exports = Bee;
