let star;
let planets = [];
let gravitySlider
let bgSlider;
let planetsNum = 12;
let unstable = 0.2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  gravitySlider = createSlider(0, 50, 10, 10);
  gravitySlider.position(10, 10);
  gravitySlider.style('width', '80px');
  bgSlider = createSlider(0, 255, 180);
  bgSlider.position(1810, 950);
  bgSlider.style('width', '100px');

//create attractor
  star = new body(100, createVector(0,0), createVector(0,0));
//create planets
  for(let i = 0; i < planetsNum; i++){
    let rad = random(star.rad, (windowWidth / 2, windowHeight / 2));
    let theta = random(TWO_PI);
    let planetPos = createVector(rad*cos(theta), rad*sin(theta));

    planetVel = planetPos.copy();
    planetVel.rotate(HALF_PI);
    planetVel.setMag(sqrt(gravitySlider.value() * star.mass/planetPos.mag()));
    //reverse directions
    if (random(1) < 0.4){
      planetVel.mult(-1);
    }

    planetVel.mult(random (1 - unstable, 1 + unstable));
    planets.push( new body(random(10, 30), planetPos, planetVel) );

  }

  rgb = [random(0, 255), random(0, 255), random(0, 255)];

}

function draw() {
  textAlign(CENTER);
  translate(width/2, height/2);
  background(bgSlider.value()); 
  fill(255);
  textSize(15);
  text("Gravity: " + gravitySlider.value(), -910, -445);
  for(let i = 0; i < planets.length; i++){
    star.attract(planets[i]);
    planets[i].update();
    planets[i].show(color(rgb[0], rgb[1], rgb[2]));
    console.log("planet: ",i ,planetVel);
  }
  star.show(color(255, 255, 102));
}

function body(_mass, _pos, _vel){
  this.mass = _mass;
  this.pos = _pos;
  this.vel = _vel;
  this.rad = this.mass;
  this.path = [];
//build body
  this.show = function(c){
    stroke(30); fill(c);
    ellipse(this.pos.x , this.pos.y, this.rad, this.rad); 
    //tail
    stroke(30);
    for (let i = 0; i < this.path.length - 2; i++){
      line(this.path[i].x, this.path[i].y, this.path[i + 1].x, this.path[i + 1].y);
    }
  }
//update position of body
  this.update = function(){
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.path.push(this.pos.copy());
    if (this.path.length > 100) {
      this.path.splice(0, 1);
    }
  }
  
  //gravity
  this.applyF = function(f){
    this.vel.x += f.x / this.mass;
    this.vel.y += f.y / this.mass;
  }

  this.attract = function(child){
    let r = dist(this.pos.x, this.pos.y, child.pos.x, child.pos.y);
    let f = this.pos.copy().sub(child.pos);
    f.setMag((gravitySlider.value() * this.mass * child.mass) / (r * r))
    child.applyF(f);
  }

}

