const Game = require('./serverGame.js');
const Insect = require('./serverInsect.js');
const STATES = {
	IDLE: 0,
	WORKING: 1,
	INACTIVE: 2
};

class Bee extends Insect {
	constructor(id) {
		super(id);
		this.age = 0;
		this.status = Bee.STATES.IDLE;
		this.health = 100;
		this.energy = 100;
		this.pollen = 0;
		this.nectar = 0;
		this.capacity = 100;
		this.playerActions = [];
		this.idleTimer = null; // Meassures the time since the bee performed the last action
		this.inactiveTimer = null; // Blocks the bee for a while after an action is performed
		this.attackPower = 25;
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

	static get STATES() {
		return STATES;
	}

	cancelAllTimeEvents() {
		this.resetIdleTimer();
		this.resetInactiveTimer();
		this.resetFlyTimer();
	}

	increaseAge() {
		this.age += 1;
		if (this.age >= 45) {
			this.die();
			return false;
		}
		else {
			return true;
		}
	}

	die() {
		Game.removeBee(this);
	}

	reduceHealth(amount) {
		this.health -= amount;
		if (this.health <= 0) {
			this.health = 0;
			this.die();
		}
		else {
			Game.reduceHealth(this);
		}
	}

	calculateSpeed() {
		return (this.pollen + this.nectar) / 100 + 1;
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

	restoreHealth() {
		this.health = 100;
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
		this.status = Bee.STATES.INACTIVE;
		this.startInactiveTimer();
	}

	startIdleTimer() {
		this.resetIdleTimer();
		this.idleTimer = setTimeout(this.onIdleForTooLong.bind(this), 10000); // 10ces
	}

	resetIdleTimer() {
		if (this.idleTimer !== null) {
			clearTimeout(this.idleTimer);
			this.idleTimer = null;
		}
	}

	startInactiveTimer() {
		this.resetInactiveTimer();
		this.inactiveTimer = setTimeout(this.onActivateBee.bind(this), 4000); // 4sec
	}

	resetInactiveTimer() {
		// This method is not needed because the inactiveTimer can not be called again before the timer runs out
		// but this makes it more safe to operate with the timer
		if (this.inactiveTimer !== null) {
			clearTimeout(this.inactiveTimer);
			this.inactiveTimer = null;
		}
	}

	resetFlyTimer() {
		if (this.flyTimer !== null) {
			// Everytime the timer resets we calculate the new x and y
			// this is the case when there is a conflict
			this.calculateNewPosition();
			super.resetFlyTimer();
		}
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

	getTimeLeft(timeout) {
		return Math.ceil(
			timeout._idleStart + timeout._idleTimeout - process.uptime() * 1000
		);
	}

	isInBeehive() {
		return (this.x === Game.beehive.x)&&(this.y === Game.beehive.y)
	}
	onIdleForTooLong() {
		Game.handleBeeIsIdleForTooLong(this.id);
	}

	onActivateBee() {
		this.status = Bee.STATES.IDLE;
		Game.updateBee(this);
	}

	onArriveAtDestination() {
		this.calculateFlownDistancePercentage();
		if (this.destination === null)
			console.log('[WARNING] destination is null but it shouldnt');
		if (
			this.destination.x === Game.beehive.x &&
			this.destination.y === Game.beehive.y
    ) {
			this.restoreHealth();
			Game.returnNectar(this);
		} else {
			const flower = Game.getFlowerForPosition(this.destination);
			if (!flower) console.log('[WARNING] no flower found for this position');
			Game.addNectarToBee(this, flower);
		}
		this.resetFlyTimer();
		Game.calculatePlayerExperienceAfterBeeArrived(this);
		this.x = this.destination.x;
		this.y = this.destination.y;
		this.setDestination(null);
		this.setInactive();
		this.startIdleTimer();
		Game.clearPlayerActionsForBee(this);
		Game.updateBee(this);
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
