class Menu {
	static createTextField(title, element) {
		const text = document.createElement('P');
		text.style.fontFamily = 'Raleway';
		text.style.fontWeight = 'bold';
		text.appendChild(document.createTextNode(title));
		text.appendChild(document.createTextNode(element));
		return text;
	}

	static createHeading(title, element) {
		const heading = document.createElement('P');
		heading.style.fontFamily = 'Raleway';
		heading.style.fontWeight = 'bold';
		heading.appendChild(document.createTextNode(title));
		if (typeof element !== 'undefined') {
			heading.appendChild(document.createTextNode(element));
		}
		heading.id = 'heading';
		return heading;
	}

	static createSubmenu(...args) {
		const subMenu = document.createElement('DIV');
		subMenu.classList.add('label-container');
		for (let i = 0; i < args.length; i++) {
			subMenu.appendChild(args[i]);
		}
		return subMenu;
	}

	static createMenu(id, subMenu) {
		const menu = document.createElement('DIV');
		menu.id = id;
		menu.appendChild(subMenu);
		return menu;
	}

	static createHiveMenu(hive, beeCount) {
		const heading = this.createHeading('Beehive');

		const honey = this.createTextField('Honey: ', hive.honey);

		const pollen = this.createTextField('Pollen: ', hive.pollen);

		const geleeRoyal = this.createTextField('Gelee-Royal: ', hive.geleeRoyal);

		const honeycombs = this.createTextField('Honeycombs: ', hive.honeycombs);

		const bees = this.createTextField('Number of Bees: ', beeCount);

		const subMenu = this.createSubmenu(heading, honey, pollen, geleeRoyal, honeycombs, bees);

		const hiveMenu = this.createMenu('hiveMenu', subMenu);

		const menu = document.getElementById('menu');
		if (menu.firstChild) {
			menu.removeChild(menu.firstChild);
		}
		menu.appendChild(hiveMenu);
	}

	static createBeeMenu(bee) {
		const heading = this.createHeading('Bee Nr: ', bee.id);

		const nectar = this.createTextField('Nectar: ', bee.nectar);

		const pollen = this.createTextField('Pollen: ', bee.pollen);

		const age = this.createTextField('Age: ', bee.age);

		const health = this.createTextField('Heath: ', bee.health);

		const status = this.createTextField('Status: ', bee.status);

		const subMenu = this.createSubmenu(heading, health, nectar, pollen, age, status);

		const beeMenu = this.createMenu('beeMenu-' + bee.id, subMenu);

		const menu = document.getElementById('menu');
		menu.removeChild(menu.firstChild);
		menu.appendChild(beeMenu);
	}

	static createFlowerMenu(flower) {
		const heading = this.createHeading('Flower Nr: ', flower.id);

		const nectar = this.createTextField('Nectar: ', flower.nectar);

		const pollen = this.createTextField('Pollen: ', flower.pollen);

		const subMenu = this.createSubmenu(heading, nectar, pollen);

		const flowerMenu = this.createMenu(
			'flowerMenu-' + flower.id,
			subMenu
		);

		const menu = document.getElementById('menu');
		menu.removeChild(menu.firstChild);
		menu.appendChild(flowerMenu);
	}
}

export default Menu;
