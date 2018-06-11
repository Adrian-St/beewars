function createHiveMenu(hive, beeCount) {
  var heading = document.createElement("H3");
  heading.appendChild(document.createTextNode("Beehive"));
  heading.classList.add("heading");
  var honey = document.createElement("P");
  honey.appendChild(document.createTextNode("Honey: "))
  honey.appendChild(document.createTextNode(hive.honey));
  var pollen = document.createElement("P");
  pollen.appendChild(document.createTextNode("Pollen: "))
  pollen.appendChild(document.createTextNode(hive.pollen));
  var honeycombs = document.createElement("P");
  honeycombs.appendChild(document.createTextNode("Honeycombs: "))
  honeycombs.appendChild(document.createTextNode(hive.honeycombs));
  var bees = document.createElement("P");
  bees.appendChild(document.createTextNode("Number of Bees: "))
  bees.appendChild(document.createTextNode(beeCount));
  var subMenu = document.createElement("DIV")
  subMenu.classList.add("label-container");
  subMenu.appendChild(honey);
  subMenu.appendChild(pollen);
  subMenu.appendChild(honeycombs);
  subMenu.appendChild(bees);
  var hiveMenu = document.createElement("DIV");
  hiveMenu.id = "hiveMenu";
  hiveMenu.appendChild(heading);
  hiveMenu.appendChild(subMenu);
  var menu = document.getElementById("menu");
  if(menu.firstChild) {
    menu.removeChild(menu.firstChild);
  }
  menu.appendChild(hiveMenu);
}

function createBeeMenu(bee) {
  var heading = document.createElement("H3");
  heading.appendChild(document.createTextNode("Bee Nr: "));
  heading.appendChild(document.createTextNode(bee.id))
  heading.classList.add("heading");
  var nectar = document.createElement("P");
  nectar.appendChild(document.createTextNode("Nectar: "))
  nectar.appendChild(document.createTextNode(bee.nectar));
  var pollen = document.createElement("P");
  pollen.appendChild(document.createTextNode("Pollen: "))
  pollen.appendChild(document.createTextNode(bee.pollen));
  var age = document.createElement("P");
  age.appendChild(document.createTextNode("Age: "))
  age.appendChild(document.createTextNode(bee.age));
  var status = document.createElement("P");
  status.appendChild(document.createTextNode("Status: "))
  status.appendChild(document.createTextNode(bee.status));
  var subMenu = document.createElement("DIV")
  subMenu.classList.add("label-container");
  subMenu.appendChild(nectar);
  subMenu.appendChild(pollen);
  subMenu.appendChild(age);
  subMenu.appendChild(status);
  var beeMenu = document.createElement("DIV");
  beeMenu.id = "beeMenu-" + bee.id;
  beeMenu.appendChild(heading);
  beeMenu.appendChild(subMenu);
  var menu = document.getElementById("menu");
  menu.removeChild(menu.firstChild);
  menu.appendChild(beeMenu);
}

function createFlowerMenu(flower) {
  var heading = document.createElement("H3");
  heading.appendChild(document.createTextNode("Flower Nr: "));
  heading.appendChild(document.createTextNode(flower.id))
  heading.classList.add("heading");
  var nectar = document.createElement("P");
  nectar.appendChild(document.createTextNode("Nectar: "))
  nectar.appendChild(document.createTextNode(flower.nectar));
  var pollen = document.createElement("P");
  pollen.appendChild(document.createTextNode("Pollen: "))
  pollen.appendChild(document.createTextNode(flower.pollen));
  var subMenu = document.createElement("DIV")
  subMenu.classList.add("label-container");
  subMenu.appendChild(nectar);
  subMenu.appendChild(pollen);
  var flowerMenu = document.createElement("DIV");
  flowerMenu.id = "flowerMenu-" + flower.id;
  flowerMenu.appendChild(heading);
  flowerMenu.appendChild(subMenu);
  var menu = document.getElementById("menu");
  menu.removeChild(menu.firstChild);
  menu.appendChild(flowerMenu);
}
