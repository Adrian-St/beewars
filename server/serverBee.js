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
	}

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
		// const weight = Game.players.find(player => player.id == playerAction.playerID).experience;
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
		return this.playerActions;
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
}

Game.lastActionId = 0;

module.exports = Bee;

/*
PlayerAction {
  id: int,
  timestamp: long,
  target: position,
  beeID: int,
  playerIDs: [int],
  weight: int,
  stop: boolean // gets always overridden from server
}
*/
