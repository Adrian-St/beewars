function createTextField(title, element) {
  var text = document.createElement("P");
  text.style.fontFamily = "Raleway";
  text.appendChild(document.createTextNode(title))
  text.appendChild(document.createTextNode(element));
  return text;
}

function createHeading(title, element) {
  var heading = document.createElement("H3");
  heading.style.fontFamily = "Raleway";
  heading.appendChild(document.createTextNode(title));
  if (typeof element != "undefined") {
    heading.appendChild(document.createTextNode(element))
  }
  heading.classList.add("heading");
  return heading;
}

function createSubmenu() {
  var subMenu = document.createElement("DIV")
  subMenu.classList.add("label-container");
  for (var i = 0, j = arguments.length; i < j; i++) {
    subMenu.appendChild(arguments[i]);
  }
  return subMenu;
}

function createMenu(id, heading, subMenu) {
  var menu = document.createElement("DIV");
  menu.id = id;
  menu.appendChild(heading);
  menu.appendChild(subMenu);
  return menu;
}

function createHiveMenu(hive, beeCount) {
  var heading = createHeading("Beehive");

  var honey = createTextField("Honey: ", hive.honey);

  var pollen = createTextField("Pollen: ", hive.pollen);

  var honeycombs = createTextField("Honeycombs: ", hive.honeycombs);

  var bees = createTextField("Number of Bees: ", beeCount);

  var subMenu = createSubmenu(honey, pollen, honeycombs, bees);

  var hiveMenu = createMenu("hiveMenu", heading, subMenu);

  var menu = document.getElementById("menu");
  if (menu.firstChild) {
    menu.removeChild(menu.firstChild);
  }
  menu.appendChild(hiveMenu);
}


function createBeeMenu(bee) {
  var heading = createHeading("Bee Nr: ", bee.id);


  var nectar = createTextField("Nectar: ", bee.nectar);

  var pollen = createTextField("Pollen: ", bee.pollen);

  var age = createTextField("Age: ", bee.age);

  var status = createTextField("Status: ", bee.status);

  var subMenu = createSubmenu(nectar, pollen, age, status);

  var beeMenu = createMenu("beeMenu-" + bee.id, heading, subMenu);

  var menu = document.getElementById("menu");
  menu.removeChild(menu.firstChild);
  menu.appendChild(beeMenu);
}

function createFlowerMenu(flower) {
  var heading = createHeading("Flower Nr: ", flower.id);

  var nectar = createTextField("Nectar: ", flower.nectar);

  var pollen = createTextField("Pollen: ", flower.pollen);

  var subMenu = createSubmenu(nectar, pollen);

  var flowerMenu = createMenu("flowerMenu-" + flower.id, heading, subMenu);

  var menu = document.getElementById("menu");
  menu.removeChild(menu.firstChild);
  menu.appendChild(flowerMenu);
}
