var Beewars = Beewars || {};
Beewars.Bee = function(serverBee, sprite) {
  this.id = serverBee.id;
  this.age = serverBee.age;
  this.status = serverBee.status; 
  this.health = serverBee.health;
  this.energy = serverBee.energy;
  this.pollen = serverBee.pollen;
  this.nectar = serverBee.nectar;
  this.capacity = serverBee.capacity;
  this.sprite = sprite;
  this.tween = null;
  this.shadow = null;
  this.shadowTween = null;
  this.playerActions = [];
}

Beewars.Bee.prototype.activateShadow = function (){
    this.shadow = Beewars.game.add.sprite(this.sprite.x, this.sprite.y, 'sprite');
    this.shadow.anchor.set(0.5);
    this.shadow.tint = 0x000000;
    this.shadow.alpha = 0.6;
    this.shadow.scale.setTo(1.1, 1.1);
    this.sprite.bringToTop();
}

Beewars.Bee.prototype.deactivateShadow = function (){
    if(this.shadow){
        this.shadow.destroy();
        this.shadow = null;
    }
}

Beewars.Bee.prototype.initializeTween = function (){
	this.tween = Beewars.game.add.tween(this.sprite);
}

Beewars.Bee.prototype.startTween = function (destination){
    var duration = Phaser.Math.distance(this.sprite.position.x, this.sprite.position.y, destination.x, destination.y) * 10;
    this.initializeTween();
    this.tween.to(destination, duration);
    //this.tween.onComplete.add(Beewars.Game.moveCallback, this);
    this.tween.start();
    this.tween.onUpdateCallback(Beewars.Game.onTweenRunning, this);
}

Beewars.Bee.prototype.stopTween = function (){
	if(this.tween){
        this.tween.stop();
        this.tween = null;
    }
}

Beewars.Bee.prototype.initializeShadowTween = function (){
	this.shadowTween = Beewars.game.add.tween(this.shadow);
}

Beewars.Bee.prototype.startShadowTween = function (destination){
	var duration = Phaser.Math.distance(this.sprite.position.x, this.sprite.position.y, destination.x, destination.y) * 10;
	this.initializeShadowTween();
	this.shadowTween.to(destination, duration);
	this.shadowTween.start();
}

Beewars.Bee.prototype.stopShadowTween = function (){
  if(this.shadowTween){
      this.shadowTween.stop();
      this.shadowTween = null;
  }
}

Beewars.Bee.prototype.getSendableBee = function (){
  return {
    id: this.id,
    x: this.sprite.x,
    y: this.sprite.y,
    age: this.age,
    status: this.status,
    health: this.health,
    energy: this.energy,
    pollen: this.pollen,
    nectar: this.nectar,
    capacity: this.capacity
  }
}

Beewars.Bee.prototype.getActions = function (){ //this gets all of the playerActions from one Bee and removes the "stop" Actions
  return this.playerActions.map(action => {
    if(!action.stop) 
      return {x: action.target.x, y: action.target.y}}).filter(el => el)
}

