let balls = [];
let stairs = [];
let gravity = 0.3;
let t2 = 0;
function fR(max, min = 0) {
	return min + parseInt((max - min + 1) * fxrand());
}
// 背景rgb
let r;
let g;
let b;
let a;
// 階梯rgb
let rs;
let gs;
let bs;
// 彈珠rgb (static)
let rb;
let gb;
let bb;
let gradient;
let st = 0;
let st2 = 0;
let maxc = 0;
//let ground = 0;
let ballColor = 200; //彈珠顏色值域
let stairNum = 6; // 階梯數量
let sounds = ["ding", "ping", "short_sound"];
let random_sound = `./asset/${sounds[fR(sounds.length - 1)]}.wav`;
let melody;
let cur_root = 0;
let cur_melody = 0;
let so = [];
for (let i = 0; i < stairNum; i++) so.push(fR(3));
let xSpace = 75; //階梯長度
let yStart = 5 * 16; //階梯起始y值
let ySpace = 25 * 3; //階梯間距
let flow = fR(1, 0); //隨機鏡像
let sp = 0;
if (flow == 0) {
	flow--;
	sp = 500;
}
let xvs = flow * 0.7;
let ys = 0.7;
let ballNum = 10;
let swi = 0;
let if_start = false;
const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	for (let i = array.length - 1; i > 0; i--) {
		if (array[i] == 0) {
			array[i] = array[0];
			array[0] = 0;
		}
	}
};
const get_scales = () => {
	scale_names = [
		"Ionian",
		"Dorian",
		"Phrygian",
		"Lydian",
		"Mixolydian",
		"Aeolian",
		"Locrian",
        "china",
	];

	let scales = {
		Ionian: [0, 2, 4, 5, 7, 9, 11],
		Dorian: [0, 2, 3, 5, 7, 9, 10],
		Phrygian: [0, 1, 2, 5, 7, 8, 10],
		Lydian: [0, 2, 4, 6, 7, 9, 11],
		Mixolydian: [0, 2, 4, 5, 7, 9, 10],
		Aeolian: [0, 2, 3, 5, 7, 8, 10],
		Locrian: [0, 1, 2, 5, 6, 8, 10],
		china: [0, 2, 4, 7, 9],
	};

	let random_scale = scale_names[fR(scale_names.length - 1)];
	let scale = scales[random_scale];
	shuffleArray(scale);
	console.log(random_scale);
	return scale;
};

function setup() {
	createCanvas(500, 500);
	resetRGB();
}

function resetRGB() {
	r = fR(255, 200);
	g = fR(255, 200);
	b = fR(255, 200);
	a = fR(255, 200);
	rs = fR(255, 200);
	gs = 255 - rs;
	bs = fR(255, 150);
	rs2 = fR(255, 200);
	gs2 = 255 - rs2;
	bs2 = fR(255, 150);
	rb = fR(ballColor);
	gb = fR(ballColor);
	bb = fR(ballColor);
	gradient = (rs - gs) / (stairNum - 1);
}

class Ball {
	constructor(x, y, r, xspeed, yspeed) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.xspeed = xspeed;
		this.yspeed = yspeed;
		this.static = false;
		this.bouncing = true;
		this.times = 0;
		this.fillr = fR(ballColor);
		this.fillg = fR(ballColor);
		this.fillb = fR(ballColor);
	}
	show() {
		noStroke();
		fill(this.fillr, this.fillg, this.fillb, 150);
		ellipse(this.x, this.y, this.r * 2);
	}
	move() {
		if (!this.static) this.yspeed += gravity;
		this.y = this.y + this.yspeed;
		if (this.bouncing && this.y > yStart - this.r + ySpace * stairNum) {
			// 在最下面的樓梯之下
			this.bouncing = false;
			this.xspeed = flow * -3;
			this.yspeed = -22;
			this.fillr = rb;
			this.fillg = gb;
			this.fillb = bb;
			let nc = new Ball(sp + (75 / 2) * flow, 50, this.r, xvs, ys);
			balls.pop();
			balls.push(nc);
		}
		if (this.x > width || this.x < 0) {
			xvs = (flow * fR(7, 3)) / 10;
			let id = balls.indexOf(this);
			let nc = new Ball(sp + (75 / 2) * flow, 50, this.r, xvs, ys);
			balls = balls.filter((_, i) => i != id);
			balls.push(nc);
		}
	}
	bounce() {
		for (let i = 0; i < stairNum; i++) {
			if (
				this.y > stairs[i].y_start - this.r &&
				this.bouncing &&
				(this.x - stairs[i].x_end) * (this.x - stairs[i].x_start) < 0
			) {
				let vol2 = min(max(abs(abs(this.yspeed) - 14) / 3, 0.1), 1);
				cur_melody = (cur_melody + 1) % melody.length;
				if (cur_melody === 0) {
					melody = get_scales();
					resetRGB();
				}
				Pd.send("vol2", [1]);
				Pd.send("sound_number", [melody[cur_melody]]);
				if_start = true;
				if (this.yspeed < 0) this.yspeed = 10.6;
				if (this.yspeed > 0) this.yspeed = -10.6;
				console.log(melody[cur_melody]);
			}
		}
	}
}

class Stair {
	constructor(x_start, x_end, y_start, y_end, i_color) {
		this.x_start = x_start;
		this.x_end = x_end;
		this.y_start = y_start;
		this.y_end = y_end;
		this.i_color = i_color;
		this.x_speed = 1.07;
		this.y_speed = 1.07;
	}

	show() {
		stroke(rs - this.i_color * gradient, gs + this.i_color * gradient, bs);
		strokeWeight(7);
		line(this.x_start, this.y_start, this.x_end, this.y_end);
	}
	move() {
		if (if_start == true) {
			this.x_start -= flow * this.x_speed;
			this.x_end -= flow * this.x_speed;
			this.y_start -= this.y_speed;
			this.y_end -= this.y_speed;
			if (this.x_start < 0 || this.x_end > width) {
				let id = stairs.indexOf(this);
				let xs = sp + 5 * xSpace * flow;
				let xe = xs + flow * xSpace;
				let ys = 5 * ySpace + yStart;
				let new_stair = new Stair(xs, xe, ys, ys, this.i_color);
				stairs = stairs.filter((_, i) => i != id);
				stairs.push(new_stair);
			}
		}
	}
}



function mousePressed() {
	if (swi === 0) {
		Pd.start();
		Pd.send("readfile", [random_sound]);
		melody = get_scales();
		swi = 1;
	}
	cnt = 0;
	xvs = flow * 0.7;
	if (balls.length == ballNum) balls = balls.slice(1);
	let r = 20;
	if (flow == 1) {
		let c = new Ball(210, 25, r, xvs, ys);
		balls.push(c);
	} else {
		let c = new Ball(290, 25, r, xvs, ys);
		balls.push(c);
	}

	for (let i = 0; i < stairNum; i++) {
		let xs = sp + i * xSpace * flow;
		let xe = xs + flow * xSpace;
		let ys = i * ySpace + yStart;
		let new_stair = new Stair(xs, xe, ys, ys, i);
		stairs.push(new_stair);
	}
}



function draw() {
	background(0);
	noStroke();
	fill(r, g, b, a);
	rect(width - width, height - height, width, height);
	let space = 25;
	// 畫格線
	for (let i = 0; i * space < height; i++) {
		stroke(b, r, g, 70);
		strokeWeight(2);
		line(0, i * space, width, i * space);
	}
	for (let i = 0; i * space < width; i++) {
		stroke(b, r, g, 70);
		strokeWeight(2);
		line(i * space, height, i * space, 0);
	}
	// 畫樓梯
	for (s of stairs) {
		s.move();
		s.show();
	}
	stroke(rs2 - st2 * gradient, gs2 + st2 * gradient, bs2, 200 + (st % 56));
	st++;
	if (st % 30 == 0) {
		st2++;
		if (st2 == 5) st2 = 0;
	}
	strokeWeight(4);
	for (c of balls) {
		c.move();
		c.bounce();
		c.show();
	}
}
