const Game = require('./serverGame.js');
const Insect = require('./serverInsect.js');

const STATES = {
	IDLE: 0,
	WORKING: 1,
	INACTIVE: 2
};
const BeeTypes = {
	OUTSIDEBEE: 0,
	INSIDEBEE: 1
};

class Bee extends Insect {
	constructor(id, game) {
		super(id, game);
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
		this.type = BeeTypes.INSIDEBEE;
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
		if (this.age >= 15 && this.type === BeeTypes.INSIDEBEE) {
			this.leaveBeehive();
		}
		if (this.age >= 45) {
			this.die();
		}
	}

	die() {
		this.game.removeBee(this);
	}

	leaveBeehive() {
		this.type = BeeTypes.OUTSIDEBEE;
		this.cancelAllTimeEvents();
		this.x = this.game.beehive.x;
		this.y = this.game.beehive.y;
		this.playerActions = [];
		// Synchronize
		this.game.moveBeeToOutside(this);
	}

	reduceHealth(amount) {
		this.health -= amount;
		if (this.health <= 0) {
			this.health = 0;
			this.die();
		} else {
			this.game.reduceHealth(this);
		}
	}

	calculateSpeed() {
		return (this.pollen + this.nectar) / 100 + 1;
	}

	performAction(playerAction) {
		// Calculate here what action to perform
		const previousAction = this.playerActions[0];

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
			playerAction.id = this.game.lastActionId;
			playerAction.playerIDs = [playerAction.playerID];
			this.playerActions.push(playerAction);
			this.game.lastActionId++;
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
				return 'stop';
			}
		}
		if (this.playerActions[0] === previousAction && this.flyTimer !== null) {
			return 'unchanged';
		}

		return 'changed';
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

	restoreHealth() {
		this.health = 100;
	}

	calculateWeightsForActions() {
		this.playerActions = this.playerActions.map(action => {
			action.weight = action.playerIDs.reduce((total, playerID) => {
				return (
					total + this.game.players.find(player => player.id === playerID).experience
				);
			}, 0);
			return action;
		});
	}

	setInactive() {
		this.status = Bee.STATES.INACTIVE;
		this.startInactiveTimer();
	}

	startFlying(destination) {
		this.resetFlyTimer();
		let actualDestination = destination;
		if (this.type === BeeTypes.OUTSIDEBEE) {
			for (let i = 0; i < this.game.frogs.length; i++) {
				if (this.game.frogs[i].collidesWithPath(this, destination)) {
					actualDestination = this.game.frogs[i].calculateActualDestination(
						this,
						destination
					);
					break;
				}
			}
		}
		this.startFlyTimer(actualDestination);
		this.resetIdleTimer();
	}

	stopFlying() {
		this.resetFlyTimer();
		this.startIdleTimer();
	}

	resetFlyTimer() {
		if (this.flyTimer !== null) {
			// Everytime the timer resets we calculate the new x and y
			// this is the case when there is a conflict
			this.calculateNewPosition();
			super.resetFlyTimer();
		}
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

	isInBeehive() {
		return this.x === this.game.beehive.x && this.y === this.game.beehive.y;
	}

	onIdleForTooLong() {
		this.game.handleBeeIsIdleForTooLong(this.id);
	}

	onActivateBee() {
		this.status = Bee.STATES.IDLE;
		this.game.updateBee(this);
	}

	onArriveAtDestination() {
		this.calculateFlownDistancePercentage();
		if (this.destination === null)
			console.log('[WARNING] destination is null but it shouldnt');

		if (this.type === BeeTypes.OUTSIDEBEE) {
			if (this.destinationEqualsPosition(this.game.beehive)) {
				this.restoreHealth();
				this.game.returnNectar(this);
			} else if (this.game.isFrogPosition(this.destination.x, this.destination.y)) {
				this.die();
				return;
			} else {
				const flower = this.game.getFlowerForPosition(this.destination);
				if (!flower) console.log('[WARNING] no flower found for this position');
				this.game.addNectarToBee(this, flower);
			}
		} else if (this.destinationEqualsPosition(this.game.centerPoints[0])) {
			// Maybe use dictionary
			console.log('Building');
			this.game.handleBuilding(this);
		} else if (this.destinationEqualsPosition(this.game.centerPoints[1])) {
			console.log('Nursing');
			this.game.sendMessage('Nursing', this.playerActions[0].playerIDs);
		} else if (this.destinationEqualsPosition(this.game.centerPoints[2])) {
			console.log('Queen');
			this.game.produceGeleeRoyal(this);
		} else if (this.destinationEqualsPosition(this.game.centerPoints[3])) {
			console.log('Cleaning');
			this.game.handleCleaning(this);
		} else {
			console.log('[WARNING] centerPos not found', this.destination);
		}

		this.calculateNewPosition();
		this.resetFlyTimer();
		this.game.calculatePlayerExperienceAfterBeeArrived(this);
		this.x = this.destination.x;
		this.y = this.destination.y;
		this.setDestination(null);
		this.setInactive();
		this.startIdleTimer();
		this.game.clearPlayerActionsForBee(this);
		this.game.updateBee(this);
	}

	destinationEqualsPosition(pos) {
		return this.destination.x === pos.x && this.destination.y === pos.y;
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
			playerActions: this.playerActions,
			target: this.destination
		};
	}
}

module.exports = { BeeTypes, Bee };
