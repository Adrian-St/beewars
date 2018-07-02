function createTextField(title, element) {
	const text = document.createElement('P');
	text.style.fontFamily = 'Raleway';
	text.appendChild(document.createTextNode(title));
	text.appendChild(document.createTextNode(element));
	return text;
}

function createHeading(title, element) {
	const heading = document.createElement('H3');
	heading.style.fontFamily = 'Raleway';
	heading.appendChild(document.createTextNode(title));
	if (typeof element !== 'undefined') {
		heading.appendChild(document.createTextNode(element));
	}
	heading.classList.add('heading');
	return heading;
}

function createSubmenu() {
	const subMenu = document.createElement('DIV');
	subMenu.classList.add('label-container');
	for (let i = 0, j = arguments.length; i < j; i++) {
		subMenu.appendChild(arguments[i]);
	}
	return subMenu;
}

function createMenu(id, heading, subMenu) {
	const menu = document.createElement('DIV');
	menu.id = id;
	menu.appendChild(heading);
	menu.appendChild(subMenu);
	return menu;
}

function createHiveMenu(hive, beeCount) {
	const heading = createHeading('Beehive');

	const honey = createTextField('Honey: ', hive.honey);

	const pollen = createTextField('Pollen: ', hive.pollen);

	const honeycombs = createTextField('Honeycombs: ', hive.honeycombs);

	const bees = createTextField('Number of Bees: ', beeCount);

	const subMenu = createSubmenu(honey, pollen, honeycombs, bees);

	const hiveMenu = createMenu('hiveMenu', heading, subMenu);

	const menu = document.getElementById('menu');
	if (menu.firstChild) {
		menu.removeChild(menu.firstChild);
	}
	menu.appendChild(hiveMenu);
}

function createBeeMenu(bee) {
	const heading = createHeading('Bee Nr: ', bee.id);

	const nectar = createTextField('Nectar: ', bee.nectar);

	const pollen = createTextField('Pollen: ', bee.pollen);

	const age = createTextField('Age: ', bee.age);

	const status = createTextField('Status: ', bee.status);

	const subMenu = createSubmenu(nectar, pollen, age, status);

	const beeMenu = createMenu('beeMenu-' + bee.id, heading, subMenu);

	const menu = document.getElementById('menu');
	menu.removeChild(menu.firstChild);
	menu.appendChild(beeMenu);
}

function createFlowerMenu(flower) {
	const heading = createHeading('Flower Nr: ', flower.id);

	const nectar = createTextField('Nectar: ', flower.nectar);

	const pollen = createTextField('Pollen: ', flower.pollen);

	const subMenu = createSubmenu(nectar, pollen);

	const flowerMenu = createMenu('flowerMenu-' + flower.id, heading, subMenu);

	const menu = document.getElementById('menu');
	menu.removeChild(menu.firstChild);
	menu.appendChild(flowerMenu);
}
