import { game } from './main.js';
import Menu from './menu.js';
import Bee from './bee.js';
import Game from './game.js';

const barWidth = 50;
const barHeight = 10;
const progressbarOffset = {
	x: barWidth / 2,
	y: barWidth
}

class State {
	constructor() {
		this.bees = [];
		this.graphics = null; // For drawing the paths of flying bees
		this.multipleBeeSelectionStatus = false;
		this.multipleBeeSelectionPosition = {
			x: 0,
			y: 0
		};
		this.multipleBeeSelectionCollection = [];
	}

	initialize() {
		this.graphics = Game.add.graphics(0, 0);
	}

	isActive() {
		return Game.currentState === this;
	}

	enableState() {
		this.bees.forEach(bee => {
			bee.sprite.visible = true;
			if (bee.shadow) bee.shadow.visible = true;
			if (bee.innerProgressBar) bee.innerProgressBar.visible = true;
		});
	}

	disableState() {
		this.bees.forEach(bee => {
			bee.sprite.visible = false;
			if (bee.shadow) bee.shadow.visible = false;
			if (bee.innerProgressBar) bee.innerProgressBar.visible = false;
		});
	}

	addBees(beeCollection) {
		for (let i = 0; i < beeCollection.length; i++) {
			this.addNewBee(beeCollection[i]);
		}
	}

	addNewBee(serverBee) {
		const sprite = game.add.sprite(serverBee.x, serverBee.y, 'sprite');
		sprite.anchor.setTo(0.5);
		sprite.inputEnabled = true;
		const bee = new Bee(serverBee, sprite);
		this.setUpUserInputForBee(bee);
		this.bees.push(bee);
		return bee;
	}

	setUpUserInputForBee(bee) {
		bee.sprite.events.onInputOver.removeAll();
		bee.sprite.events.onInputOut.removeAll();
		bee.sprite.events.onInputUp.removeAll();
		bee.sprite.events.onInputUp.add(this.onUp, this);
		bee.onInputOverEvent = bee.sprite.events.onInputOver.add(() => {
			this.onBeeInputOver(bee);
		}, this);
		bee.onInputOutEvent = bee.sprite.events.onInputOut.add(() => {
			this.onBeeInputOut(bee);
		}, this);
	}

	onBeeInputOver(currentBee) {
		const allBees = this.getAllBeesAtPosition(currentBee);
		const originalPosition = allBees[0].sprite.position.clone();

		if (allBees.length > 1 && !this.multipleBeeSelectionStatus) {
			this.displayMultipleBees(allBees, originalPosition);
			this.multipleBeeSelectionPosition.x = originalPosition.x;
			this.multipleBeeSelectionPosition.y = originalPosition.y;
			this.multipleBeeSelectionCollection = allBees.slice(0);
			this.multipleBeeSelectionStatus = true;
		}
	}

	onBeeInputOut(currentBee) {
		if (this.multipleBeeSelectionStatus) {
			if (this.multipleBeeSelectionCollection.indexOf(currentBee) > -1) {
				this.displaySingleBeeGroup();
				this.multipleBeeSelectionStatus = false;
			}
		}
	}

	onUp(sprite) {
		const clickedBee = this.bees.find(item => item.sprite === sprite);

		this.stopAllOtherShadowTweens(clickedBee);
		this.deactivateAllOtherShadows(clickedBee);

		if (clickedBee.shadow) {
			// The bee had already a shadow
			this.deselectBee(clickedBee);
			return;
		}
		if (!clickedBee.shadow) {
			// The bee wasn't selected before
			Menu.createBeeMenu(clickedBee.getSendableBee());
			clickedBee.activateShadow();
			this.showAllActions(clickedBee);
		}
		if (clickedBee.shadowTween) {
			// The bee was selected but moving to another (or the same) flower
			clickedBee.startShadowTween({ x: sprite.x, y: sprite.y });
		}
		if (clickedBee.tween && clickedBee.tween.isRunning) {
			// In case the 'new' bee is (already) flying
			clickedBee.startShadowTween({
				x: clickedBee.tween.properties.x,
				y: clickedBee.tween.properties.y
			});
		}
	}

	displayMultipleBees(allBees, originalPosition) {
		const length = allBees.length * 40;
		const leftX = originalPosition.x - length / 2;

		for (let i = 0; i < allBees.length; i++) {
			const temp = leftX + i * allBees[i].sprite.width;
			allBees[i].sprite.position.x = temp;
			if (allBees[i].shadow) allBees[i].shadow.position.x = temp;
			if (allBees[i].innerProgressBar) allBees[i].innerProgressBar.position.x = temp - progressbarOffset.x;
		}
	}

	displaySingleBeeGroup() {
		for (let i = 0; i < this.multipleBeeSelectionCollection.length; i++) {
			const currBee = this.multipleBeeSelectionCollection[i];
			currBee.sprite.position = Object.assign(
				currBee.sprite.position,
				this.multipleBeeSelectionPosition
			);
			if (currBee.shadow) {
				currBee.shadow.position = Object.assign(
					currBee.shadow.position,
					this.multipleBeeSelectionPosition
				);
			}
			if (currBee.innerProgressBar) {
				currBee.innerProgressBar.x = this.multipleBeeSelectionPosition.x - progressbarOffset.x;
				currBee.innerProgressBar.y = this.multipleBeeSelectionPosition.y - progressbarOffset.y;
			}
		}
	}

	createProgressBar(bee, image, seconds, type) {
		// Type: 0 = decreasing | 1 = increasing

		bee.innerProgressBar = Game.add.sprite(
			bee.sprite.x - progressbarOffset.x,
			bee.sprite.y - progressbarOffset.y,
			image
		);
		bee.innerProgressBar.inputEnabled = false;
		if (type === 0) {
			bee.innerProgressBar.width = barWidth;
		} else if (type === 1) {
			bee.innerProgressBar.width = 0;
		}

		bee.innerProgressBar.height = barHeight;
		bee.innerProgressBar.progress = barWidth / seconds;
		if (!this.isActive()) bee.innerProgressBar.visible = false;

		Game.time.events.repeat(
			Phaser.Timer.SECOND,
			seconds,
			() => {
				this.updateProgressBar(bee.innerProgressBar, type);
			},
			this
		);
	}

	updateProgressBar(progressBar, type) {
		if (!progressBar) return;
		if (type === 0) {
			progressBar.width -= progressBar.progress;
		} else if (type === 1) {
			progressBar.width += progressBar.progress;
		}
	}

	deselectBee(bee) {
		Menu.createHiveMenu(Game.beehive.getSendableBeehive(), this.bees.length);
		bee.deactivateShadow();
		this.graphics.clear();
	}

	getAllBeesAtPosition(bee) {
		const { x } = bee.sprite.position;
		const { y } = bee.sprite.position;
		const radius = 20;
		const allBees = this.bees.filter(
			item =>
				item.sprite.position.x > x - radius &&
				item.sprite.position.x < x + radius &&
				item.sprite.position.y > y - radius &&
				item.sprite.position.y < y + radius
		);
		return allBees;
	}

	deactivateBee(bee, seconds) {
		bee.status = Bee.STATES.INACTIVE;

		this.createProgressBar(bee, 'progressbar', seconds, 0);
		Game.time.events.add(
			Phaser.Timer.SECOND * seconds,
			() => {
				this.activateBee(bee);
			},
			this
		);
	}

	createMoveData(x, y) {
		return { beeID: this.getSelectedBee().id, target: { x, y } };
	}

	onTweenRunning() {
		if (
			this.isABeeSelected() &&
			this.getSelectedBee().shadow &&
			this.getSelectedBee().tween
		) {
			const curBee = this.getSelectedBee();
			this.showAllActions(curBee);
		} else {
			this.graphics.clear(); // This is called way to often...
		}
	}

	showAllActions(bee) {
		this.graphics.clear();
		bee.getActions().forEach(action => {
			this.graphics.lineStyle(10, 0xffd900, 1);
			this.graphics.moveTo(bee.sprite.x, bee.sprite.y);
			this.graphics.lineTo(action.x, action.y);
		});
	}

	stopAllOtherShadowTweens(bee) {
		for (let i = 0; i < this.bees.length; i++) {
			const b = this.bees[i];
			if (b.id !== bee.id) {
				b.stopShadowTween();
			}
		}
	}

	deactivateAllOtherShadows(bee) {
		for (let i = 0; i < this.bees.length; i++) {
			const b = this.bees[i];
			if (b.id !== bee.id) {
				b.deactivateShadow();
			}
		}
	}

	isABeeSelected() {
		for (let i = 0; i < this.bees.length; i++) {
			if (this.bees[i].shadow) {
				return true;
			}
		}
		return false;
	}

	getSelectedBee() {
		for (let i = 0; i < this.bees.length; i++) {
			if (this.bees[i].shadow) {
				return this.bees[i];
			}
		}
	}

	beeForId(id) {
		return this.bees.find(bee => {
			return bee.id === id;
		});
	}

	getBeeForSprite(sprite) {
		for (let i = 0; i < this.bees.length; i++) {
			if (this.bees[i].sprite === sprite) {
				return this.bees[i];
			}
		}
	}

	updateBee(bee) {
		const beeToBeUpdated = this.beeForId(bee.id);
		if (!beeToBeUpdated) return; // In case the beeToBeUpdated is not in this state
		if (beeToBeUpdated.status === Bee.STATES.INACTIVE) {
			// Bee was blocked
			if (bee.status === Bee.STATES.IDLE) this.activateBee(beeToBeUpdated); // Bee is free now
		} else if (bee.status === Bee.STATES.INACTIVE)
			this.deactivateBee(beeToBeUpdated, 4); // Bee is now blocked
		beeToBeUpdated.age = bee.age;
		beeToBeUpdated.status = bee.status;
		beeToBeUpdated.health = bee.health;
		beeToBeUpdated.energy = bee.energy;
		beeToBeUpdated.pollen = bee.pollen;
		beeToBeUpdated.nectar = bee.nectar;
		beeToBeUpdated.capacity = bee.capacity;
		beeToBeUpdated.playerActions = bee.playerActions;
		if (
			document.getElementById('menu').firstChild.id ===
			'beeMenu-' + beeToBeUpdated.id
		) {
			Menu.createBeeMenu(beeToBeUpdated);
		}
		return beeToBeUpdated;
	}

	activateBee(bee) {
		if (bee.progressProgressBar) {
			bee.innerProgressBar.destroy();
			bee.innerProgressBar = null;
		}
		return bee;
	}

	removeBee(bee) {
		const deletedBee = this.beeForId(bee.id);
		if (!deletedBee) return;
		if (deletedBee.shadow) this.deselectBee(deletedBee);
		deletedBee.sprite.destroy();
		const index = this.bees.indexOf(deletedBee);
		this.bees.splice(index, 1);
		Menu.createHiveMenu(Game.beehive.getSendableBeehive(), this.bees.length);
	}
}

export default State;
