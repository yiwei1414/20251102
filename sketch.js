let minSide;
let objs = [];
let colors = ['#ed3441', '#ffd630', '#329fe3', '#08AC7E', '#DED9DF', '#FE4D03'];

function setup() {
	// 使用視窗大小建立畫布（移除重複的 createCanvas 調用）
	let cnv = createCanvas(windowWidth, windowHeight);
	// 確保 canvas 視覺上覆蓋整個視窗並固定位置（CSS 也處理，但在 JS 也設定以防止某些平台差異）
	cnv.style('display', 'block');
	cnv.style('position', 'fixed');
	cnv.style('top', '0px');
	cnv.style('left', '0px');
	cnv.style('z-index', '0');
	pixelDensity(1);
	minSide = min(width, height);
	rectMode(CENTER);
}

function windowResized() {
    // 畫面大小改變時調整 canvas 大小，並更新 minSide
    resizeCanvas(windowWidth, windowHeight);
    minSide = min(width, height);
}

// Easing function: easeOutBounce
function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

// 繪製波動文字
function drawWavyText() {
    textAlign(CENTER, CENTER); // 水平與垂直置中
    textSize(50); // 將字體放大以更突出
    fill(255); // 白色文字
    
    // 計算 bounce 效果
    const animationDuration = 120; // 動畫總時長（幀）
    const bounceHeight = 50; // 跳動的最大高度
    let progress = (frameCount % animationDuration) / animationDuration; // 計算當前進度 (0 to 1)
    let bounce = easeOutBounce(progress); // 應用 easing function
    let yOffset = (1 - bounce) * bounceHeight; // 將 bounce 效果轉換為 Y 軸位移
    
    // 設定字體
    textFont('Arial');
    
    // 繪製文字，位置在畫面正中間
    text('淡江大學', width/2, height/2 - yOffset);
}
function draw() {
	background(0);
	for (let i of objs) {
		i.run();
	}
	
	// 繪製波動文字
	drawWavyText();

	// 在右下角繪製學號姓名
	push(); // 保存當前的繪圖設定
	textAlign(RIGHT, BOTTOM);
	textSize(16);
	fill(255, 150); // 使用白色半透明，讓文字不那麼刺眼
	let padding = 20; // 文字與邊緣的距離
	text('學號411136541江奕葳', width - padding, height - padding);
	pop(); // 恢復之前的繪圖設定

	// 反向迭代以安全地從陣列中移除元素，避免跳過下一個元素
	for (let i = objs.length - 1; i >= 0; i--) {
		if (objs[i].isDead) {
			objs.splice(i, 1);
		}
	}

	if (frameCount % (random([10, 60, 120])) == 0) {
		addObjs();
	}
}

function addObjs() {
	let x = random(-0.1, 1.1) * width;
	let y = random(-0.1, 1.1) * height;
	
	for (let i = 0; i < 20; i++) {
		objs.push(new Orb(x, y));
	}

	for (let i = 0; i < 50; i++) {
		objs.push(new Sparkle(x, y));
	}
	
	for (let i = 0; i < 2; i++) {
		objs.push(new Ripple(x, y));
	}

	for (let i = 0; i < 10; i++) {
		objs.push(new Shapes(x, y));
	}
}

function easeOutCirc(x) {
	return Math.sqrt(1 - Math.pow(x - 1, 2));
}

class Orb {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.radius = 0;
		this.maxRadius = minSide * 0.03;
		this.rStep = random(1);
		this.maxCircleD = minSide * 0.005;
		this.circleD = minSide * 0.005;
		this.isDead = false;
		this.ang = random(10);
	// 修正 random 參數順序，確保輸出是預期的範圍
	this.angStep = random([-1, 1]) * random(0.1, 0.3);
		this.xStep = random([-1, 1]) * minSide * random(0.01) * random(random());
		this.yStep = random([-1, 1]) * minSide * random(0.01) * random(random());
		this.life = 0;
		this.lifeSpan = int(random(50, 180));
		this.col = random(colors);
		this.pos = [];
		this.pos.push(createVector(this.x, this.y));
		this.followers = 10;
	}

	show() {
		this.xx = this.x + this.radius * cos(this.ang);
		this.yy = this.y + this.radius * sin(this.ang);
		push();
		noStroke();
		noFill();
		stroke(this.col);
		strokeWeight(this.circleD);
		beginShape();
		for (let i = 0; i < this.pos.length; i++) {
			vertex(this.pos[i].x, this.pos[i].y);
		}
		endShape();
		pop();
	}

	move() {
		this.ang += this.angStep;
		this.x += this.xStep;
		this.y += this.yStep;
		this.radius += this.rStep;
		this.radius = constrain(this.radius, 0, this.maxRadius);
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		this.circleD = map(this.life, 0, this.lifeSpan, this.maxCircleD, 1);
		this.pos.push(createVector(this.xx, this.yy));
		if (this.pos.length > this.followers) {
			this.pos.splice(0, 1);
		}
	}
	run() {
		this.show();
		this.move();
	}
}

class Sparkle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.r = minSide * random(0.4);
		this.a = random(10);
		this.x0 = x;
		this.y0 = y;
		this.targetX = x + this.r * cos(this.a);
		this.targetY = y + this.r * sin(this.a);
		this.life = 0;
		this.lifeSpan = int(random(50, 280));
		this.col = random(colors);
		this.sw = minSide * random(0.01)
	}

	show() {
		noFill();
		strokeWeight(this.sw);
		stroke(this.col);
		if (random() < 0.5) {
			point(this.x, this.y);
		}
	}

	move() {
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.x = lerp(this.x0, this.targetX, easeOutCirc(nrm));
		this.y = lerp(this.y0, this.targetY, easeOutCirc(nrm));
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
	}

	run() {
		this.show();
		this.move();
	}
}


class Ripple {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.life = 0;
		this.lifeSpan = int(random(50, 150));
		this.col = random(colors);
		this.maxSw = minSide * 0.005;
		this.sw = minSide * 0.005;
		this.d = 0;
		this.maxD = minSide * random(0.1, 0.5);
	}

	show() {
		noFill();
		stroke(this.col);
		strokeWeight(this.sw);
		circle(this.x, this.y, this.d);
	}

	move() {
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.sw = lerp(this.maxSw, 0.1, easeOutCirc(nrm));
		this.d = lerp(0, this.maxD, easeOutCirc(nrm));
	}

	run() {
		this.show();
		this.move();
	}
}

class Shapes {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.life = 0;
		this.lifeSpan = int(random(50, 222));
		this.col = random(colors);
		this.sw = minSide * 0.005;
		this.maxSw = minSide * 0.005;
		this.w = minSide * random(0.05);
		this.ang = random(10);
		this.angStep = random([-1, 1]) * random(0.05);
		this.shapeType = int(random(3));
		this.r = minSide * random(0.4);
		this.a = random(10);
		this.x0 = x;
		this.y0 = y;
		this.targetX = x + this.r * cos(this.a);
		this.targetY = y + this.r * sin(this.a);
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.ang);
		noFill();
		strokeWeight(this.sw);
		stroke(this.col);
		if (this.shapeType == 0) {
			square(0, 0, this.w);
		} else if (this.shapeType == 1) {
			circle(0, 0, this.w);
		} else if (this.shapeType == 2) {
			line(0, this.w / 2, 0, -this.w / 2);
			line(this.w / 2, 0, -this.w / 2, 0);
		}
		pop();

	}

	move() {
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.x = lerp(this.x0, this.targetX, easeOutCirc(nrm));
		this.y = lerp(this.y0, this.targetY, easeOutCirc(nrm));
		this.sw = lerp(this.maxSw, 0.1, easeOutCirc(nrm));
		this.ang += this.angStep;
	}

	run() {
		this.show();
		this.move();
	}
}
