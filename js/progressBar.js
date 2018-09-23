import { game } from './main.js';
import Insect from './insect.js';
import Game from './game.js';

class ProgressBar{
	constructor(textLable = "test", x = 250, y = 250, maxWidth = 100, height = 15,  value = 5, threshold = 20, background = true, unit = 4) {
		this.x = x;
		this.y = y;
		this.unit = unit;
		this.maxWidth = maxWidth;
		this.value = value;
		this.height = height;
		this.threshold = threshold;
		this.progressGraphics = Game.add.graphics(0, 0);
		this.thresholdGraphics = Game.add.graphics(0, 0);
		this.backgroundGraphics = Game.add.graphics(0, 0);
		Game.world.bringToTop(this.backgroundGraphics);
		Game.world.bringToTop(this.progressGraphics);
		Game.world.bringToTop(this.thresholdGraphics);

  		this.draw();

		// Text
		this.textLable = this.createText(x, y + height/2, textLable);
		this.textLable.padding.set(10, 0);

		this.setValue(value);
	}

	setValue(value) {
		this.value = value;
		this.drawProgress();
	}

	getColor() {
		return (this.value < this.threshold) ? 0xFF0000 : 0x00FF00
	}

	draw(){
		this.drawProgress();
		this.drawThreshold();
		this.drawBackground();
	}

	drawProgress() {
		this.progressGraphics.clear();
		this.progressGraphics.beginFill(this.getColor());
		this.progressGraphics.drawRect(this.x, this.y, Math.min(this.value, this.maxWidth) * this.unit, this.height);
		this.progressGraphics.endFill();
	}

	drawThreshold() {
		this.thresholdGraphics.clear();
		this.thresholdGraphics.beginFill(0x000000);
		this.thresholdGraphics.drawRect(this.x + this.threshold * this.unit, this.y - 5, 5, this.height + 10);
		this.thresholdGraphics.endFill();
	}

	drawBackground() {
		this.backgroundGraphics.clear();
		this.backgroundGraphics.beginFill(0x808080);
		this.backgroundGraphics.alpha = 0.4;
		this.backgroundGraphics.drawRect(this.x - 3, this.y - 3, this.maxWidth * this.unit + 6, this.height + 6);
		this.backgroundGraphics.endFill();
	}

	show() {
		this.draw();
		this.textLable.visible = true;
	}

	hide() {
		this.backgroundGraphics.clear();
		this.progressGraphics.clear();
		this.thresholdGraphics.clear();
		this.textLable.visible = false;
	}

	createText(x, y, lable) {
		const text = Game.add.text(x, y, '', {
			font: 'bold 18pt Raleway'
		});
		text.text = lable;
		text.anchor.setTo(1, 0.5);
		return text;
	}
};

class GeleeRoyalProgressbar{
	constructor(x, y, maxWidth, height, offset = 120) {
		const tmpX = x + offset;
		this.backgroundGraphics = Game.add.graphics(0, 0);
		Game.world.bringToTop(this.backgroundGraphics);
		this.honeyProgress = new ProgressBar("Honey:", tmpX, y, maxWidth, height, 5, 10);
		this.pollenProgress = new ProgressBar("Pollen:", tmpX, y + 1.5 * height, maxWidth, height, 5, 10);
		this.backgroundGraphics.beginFill(0xFFFFFF);
		this.backgroundGraphics.alpha = 0.5;
		this.backgroundGraphics.drawRoundedRect(tmpX - 100,y -20 , 3 * maxWidth * 2 + 20, 2.5 * height + 40, 10);
		this.backgroundGraphics.endFill();
	}

	update(pollen, honey){
		// The +1 is to show a minimal progress 
		this.pollenProgress.setValue(pollen + 1);
		this.honeyProgress.setValue(honey + 1);
	}

	show(){
		this.pollenProgress.show();
		this.honeyProgress.show();
	}

	hide(){
		this.pollenProgress.hide();
		this.honeyProgress.hide();
	}
}


export default GeleeRoyalProgressbar;
