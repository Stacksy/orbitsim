var futuraFont;
let star;
let G = 100; //this is the gravity
let planets = [];
let numPlanets = 10;
let extraMomentum = 0.25;

function preload() {
  futuraFont = loadFont('./assets/futuraBook.otf');
  starTexture = loadImage('/assets/sun.jpg');
  planetTexture = loadImage('/assets/planet.jpg');
}


function setup() {
  textFont(futuraFont);
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(0);

  star = new body(100, createVector(0,0), createVector(0, 0));
  
  for (let i = 0; i < numPlanets; i++){
    //position
    let rad = random(star.rad * 4, star.rad * 10);
    let theta = random(TWO_PI);
    let planetPos = createVector(rad * cos(theta), rad * sin(theta), 10); //10 is the ammount of wobble the planets have on z axis
    //velocity V = (2πa) / 2
    let planetVel = planetPos.copy();
    planetVel.rotate(HALF_PI);
    planetVel.setMag( sqrt(G * star.mass / planetPos.mag()) );
    
    //this reverses some planets directions
    if(random(1) < 0.2){
      planetVel.mult(-1);
    }

    //in order to make orbits elliptical
    planetVel.mult( random(1 - extraMomentum, 1 + extraMomentum) );

    planets.push ( new body(random(10, 30), planetPos, planetVel) );


  }
  
}

function draw() {
  angleMode(DEGREES); 
  //background(0, 0, 0, 0);
  background(180);
  orbitControl();
  axis();
  //lights();
  //line(100, 100, 1000, 0, 0, 0)
  texture(starTexture);
  star.show();
  
  for (let planet of planets){
    planet.drawTrail();
    texture(planetTexture);
    tint(planet.tint[0], planet.tint[1], planet.tint[2]);
    star.attract(planet);
    planet.update();
    planet.show();
  }


}

function axis() {
  let len = 200;
  fill('white');
  stroke('white');
  sphere(2);
  stroke('green');
  line(0, 0, 0, len, 0, 0);
  stroke('blue');
  line(0, 0, 0, 0, len, 0);
  rotateX(90);
  stroke('red');
  line(0, 0, 0, 0, len, 0);
}



function body(_mass, _pos, _vel){
  this.mass = _mass;
  this.pos = _pos;
  this.vel = _vel;
  this.rad = this.mass;
  this.tint = [Math.floor(random(0, 255)), Math.floor(random(0, 255)), Math.floor(random(0, 255))];
  this.path = [];
  
  this.show = function() {
    noStroke();
    translate(this.pos.x, this.pos.y, this.pos.z);
    sphere(this.rad);
    translate(-this.pos.x, -this.pos.y, this.pos.z);
    
    
  }

  this.update = function() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.pos.z += this.vel.z;
    this.path.push(this.pos.copy());
    if(this.path.length > 100) { //path cannot grow larger than limit
      this.path.splice(0, 1);
    }
    
  }

  this.applyForces = function(F) {
    this.vel.x += F.x / this.mass;
    this.vel.y += F.y / this.mass;
    this.vel.z += F.z / this.mass;
  }

  //F = G(m1m2)/R2.
  this.attract = function(child){
    let R = dist(this.pos.x, this.pos.y, this.pos.z, child.pos.x, child.pos.y, child.pos.z);
    let F = this.pos.copy().sub(child.pos);
    F.setMag( (G * this.mass * child.mass) / (R * R));
    child.applyForces(F);
  }

  this.drawTrail = function(){
    fill(255);
    for(let i = 0; i < this.path.length - 2; i++){
      line(this.path[i].x, this.path[i].y, this.path[i].z, this.path[i + 1].x, this.path[i + 1].y, this.path[i + 1].z);
    }
    line(100, 100, 1000, 0, 0, 0);
  }
}
