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
	constructor(id, game, x = 0, y = 0) {
		super(id, game, x, y);
		this.status = Bee.STATES.IDLE;
		this.health = 100;
		this.energy = 100;
		this.pollen = 0;
		this.nectar = 0;
		this.capacity = 100;
		this.playerActions = [];
		this.oldPlayerActions = [];
		this.idleTimer = null; // Meassures the time since the bee performed the last action
		this.inactiveTimer = null; // Blocks the bee for a while after an action is performed
		this.attackPower = 25;
		this.type = BeeTypes.INSIDEBEE;
		this.isConfused = false;
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
	  defaultAreaAction: boolean
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
		this.status = Bee.STATES.IDLE;
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
			// Punish players who last sent the bee and are therfore responsible for it's death
			// Only punish players for bees that are not in mid-flight
			if (this.oldPlayerActions[0])
				this.game.changeExperienceForPlayers(
					this.oldPlayerActions[0].playerIDs,
					-0.2
				);
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
			playerAction.id = this.game.lastActionId++;
			playerAction.playerIDs = [playerAction.playerID];
			this.playerActions.push(playerAction);
		} else if (indexOfOldPlayerAction !== indexOfExistingAction) {
			this.playerActions[indexOfExistingAction].timestamp =
				playerAction.timestamp;
			this.playerActions[indexOfExistingAction].playerIDs.push(
				playerAction.playerID
			);
			if (indexOfOldPlayerAction !== -1)
				this.removeOldPlayerAction(
					playerAction.playerID,
					indexOfOldPlayerAction
				);
		}
		this.calculateWeightsForActions();

		this.playerActions.sort((a, b) => {
			return b.weight - a.weight;
		});

		if (this.playerActions.length > 1) {
			if (this.playerActions[0].weight - this.playerActions[1].weight < 0.2) {
				this.isConfused = true;
				return 'stop';
			}
			if (this.isConfused === true) {
				// Experience for resolving a conflict
				this.game.changeExperienceForPlayer(playerAction.playerID, 0.2);
				this.isConfused = false;
			}
		}
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
				const player = this.game.players.find(player => player.id === playerID);
				if (player) return total + player.experience;
				return 0;
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
		this.setDestination(null);
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
		this.idleTimer = setTimeout(this.onIdleForTooLong.bind(this), 15000); // 15sec
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
		// This.game.handleBeeIsIdleForTooLong(this.id);
	}

	onActivateBee() {
		this.status = Bee.STATES.IDLE;
		this.game.updateBee(this);
		if (this.type === BeeTypes.INSIDEBEE)
			this.game.handleMovementRequest(-1, this.createDefaultAreaAction());
	}

	onArriveAtDestination() {
		this.calculateFlownDistancePercentage();
		if (this.destination === null)
			console.log('[WARNING] destination is null but it shouldnt');
		if (this.type === BeeTypes.OUTSIDEBEE) {
			const success = this.handleOutsideBee();
			if (!success) return;
		} else {
			this.handleInsideBee();
		}

		this.x = this.destination.x;
		this.y = this.destination.y;
		this.stopFlying();
		if (!this.playerActions[0].defaultAreaAction) this.setInactive();
		this.game.clearPlayerActionsForBee(this);
		this.game.updateBee(this);
	}

	handleOutsideBee() {
		if (this.destinationEqualsPosition(this.game.beehive)) {
			this.restoreHealth();
			this.game.returnNectar(this);
		} else if (
			this.game.isFrogPosition(this.destination.x, this.destination.y)
		) {
			this.changePlayerExperience(-0.5);
			this.die();
			return false;
		} else {
			const flower = this.game.getFlowerForPosition(this.destination);
			if (!flower) {
				console.log(
					'[WARNING] no flower found for this position',
					this.destination
				);
				return false;
			}
			this.game.addNectarToBee(this, flower);
		}
		return true;
	}

	handleInsideBee() {
		let success;
		if (this.destinationEqualsPosition(this.game.centerPoints[0])) {
			console.log('Idle'); // TODO
		} else if (this.destinationEqualsPosition(this.game.centerPoints[1])) {
			success = this.game.produceGeleeRoyal(this);
		} else if (this.destinationEqualsPosition(this.game.centerPoints[2])) {
			success = this.game.handleBuilding(this);
		} else if (this.destinationEqualsPosition(this.game.centerPoints[3])) {
			success = this.game.handleCleaning(this);
		} else {
			console.log('[WARNING] centerPos not found', this.destination);
			return;
		}
		if (success) {
			this.changePlayerExperience(0.1);
		} else {
			this.changePlayerExperience(-0.3);
		}
	}

	changePlayerExperience(value = 0.1) {
		// Change the player experience for each player how contributed to the last action
		const contributers = this.playerActions[0].playerIDs;
		this.game.changeExperienceForPlayers(contributers, value);
	}

	destinationEqualsPosition(pos) {
		return this.destination.x === pos.x && this.destination.y === pos.y;
	}

	createDefaultAreaAction() {
		return {
			id: this.game.lastActionId++,
			timestamp: Date.now(),
			target: this.getRandomTarget(),
			beeID: this.id,
			playerIDs: [-1],
			weight: 0,
			stop: false,
			defaultAreaAction: true
		};
	}

	getRandomTarget() {
		const minX = this.game.defaultAreaTopLeft.x;
		const maxX = this.game.defaultAreaBottomRight.x;
		const minY = this.game.defaultAreaTopLeft.y;
		const maxY = this.game.defaultAreaBottomRight.y;
		return {
			x: this.game.randomInt(minX, maxX),
			y: this.game.randomInt(minY, maxY)
		};
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
			target: this.destination,
			type: this.type
		};
	}
}

module.exports = { BeeTypes, Bee };
