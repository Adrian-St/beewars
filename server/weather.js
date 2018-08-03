const Game = require('./serverGame.js');
const chanceMax = 100;
const chanceMin = 0;
const temperatureMin = -20;
const temperatureMax = 40;
const TENDENCIES = {
  DECREASE: 0,
  NORMAL: 1,
  INCREASE: 2
}

class Weather {
  constructor(){
    this.chanceOfRain = 50;
    this.temperature = 10;
    this.rainTendency = Weather.TENDENCIES.NORMAL;
    this.temperatureTendency = Weather.TENDENCIES.NORMAL;
    this.weatherTimer = null;
    this.tendencyTimer = null;
    this.rainTimer = null;
    this.raining = false;
  }

  static get TENDENCIES() {
    return TENDENCIES;
  }

  startSimulation() {
    this.updateTendencies();
    this.updateWeather();
    this.tendencyTimer = setInterval(this.updateTendencies.bind(this), 30000);
    this.weatherTimer = setInterval(this.updateWeather.bind(this), 3000);
  }

  updateTendencies() {
    this.temperatureTendency = this.updateTendency();
    this.rainTendency = this.updateTendency();
  }

  updateTendency() {
    var rand = this.randomInt(1,10);
    if(rand <= 3) {
      return Weather.TENDENCIES.DECREASE;
    }
    else if(rand >= 8) {
      return Weather.TENDENCIES.INCREASE;
    }
    else {
      return Weather.TENDENCIES.NORMAL;
    }
  }

  updateWeather() {
    this.updateRain();
    this.updateTemperature();
    Game.updateWeather(this);
  }

  updateRain() {
    var previousChance = this.chanceOfRain;
    if(this.rainTendency === Weather.TENDENCIES.NORMAL) {
      this.chanceOfRain += this.randomInt(-8,8);
    }
    else if(this.rainTendency === Weather.TENDENCIES.DECREASE) {
      this.chanceOfRain += this.randomInt(-12,4);
    }
    else if(this.rainTendency === Weather.TENDENCIES.INCREASE){
      this.chanceOfRain += this.randomInt(-4,12);
    }
    else {
      console.log('[ERROR] rainTendency has to be in [0,2]');
    }
    if(this.chanceOfRain >= chanceMax) {
      this.chanceOfRain = chanceMax;
      this.rainTendency = Weather.TENDENCIES.DECREASE;
      console.log(this.rainTendency);
    }
    if(this.chanceOfRain <= chanceMin) {
      this.chanceOfRain = chanceMin;
      this.rainTendency = Weather.TENDENCIES.INCREASE;
    }
    this.toggleRain(previousChance);
  }

  toggleRain(previousChance) {
    if(previousChance < 80 && this.chanceOfRain >= 80) {
      this.raining = true;
      this.rainTendency = Weather.TENDENCIES.INCREASE;
      this.startRainTimer();
    }
    else if (previousChance >= 80 && this.chanceOfRain < 80) {
      this.raining = false;
      this.rainTendency = Weather.TENDENCIES.DECREASE;
      this.stopRainTimer();
    }
  }

  updateTemperature() {
    if(this.temperatureTendency == Weather.TENDENCIES.NORMAL) {
      this.temperature += this.randomInt(-2,2);
    }
    else if(this.temperatureTendency == Weather.TENDENCIES.INCREASE) {
      this.temperature += this.randomInt(-3,1);
    }
    else {
      this.temperature += this.randomInt(-1,3);
    }
    this.temperature = this.temperature <= temperatureMax ? this.temperature : temperatureMax;
    this.temperature = this.temperature >= temperatureMin ? this.temperature : temperatureMin;
  }

  randomInt(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	}

  startRainTimer() {
    this.rainTimer = setInterval(this.rain.bind(this),2000);
  }

  stopRainTimer() {
    clearInterval(this.rainTimer);
  }

  rain() {
    //Damages all bees that are outside
    Game.bees.forEach((bee) => {
      if(bee.isInBeehive())return;
      bee.reduceHealth(5);
    }, this);
  }

  /*
  startBurnTimer() {
    this.heatTimer = setInterval(this.burn.bind(this), 2000);
  }

  stopBurnTimer() {
    clearInterval(this.heatTimer);
  }

  burn() {
    //Damages all flying bees
    Game.bees.forEach((bee) => {
      if(bee.flyTimer != null) {
        bee.reduceHealth(5);
      }
    });
  }
  */

  getSendableWeather() {
    return {
      chanceOfRain: this.chanceOfRain,
      temperature: this.temperature,
      raining: this.raining
    }
  }
}

module.exports = Weather;
