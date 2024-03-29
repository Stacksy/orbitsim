let inconsolata;
let star;
//let G = 100; this is the gravity
let planets = [];
let numPlanets = 10;
let extraMomentum = 0.25;
let moons = [];
let skybox;
let checked;

function preload() {
  //whats up with him thern ??
  //skybox = loadImage("/assets/stars1.png")
  inconsolata = loadFont("/assets/inconsolata.otf");
  starTexture = loadImage("/assets/sun.jpg");
  planetTexture = loadImage("/assets/planet.jpg");
}

function setup() {
  gravitySlider = createSlider(1, 1001, 100, 10); //new gravity
  gravitySlider.position(10, 10);
  bgSlider = createSlider(0, 255, 180);
  bgSlider.position(windowWidth-150, windowHeight-50);
  collisionCheckbox = createCheckbox('Collision', false);
  collisionCheckbox.position(200, 10);

  createCanvas(windowWidth, windowHeight, WEBGL);
  background(0);

  star = new body(100, createVector(0, 0), createVector(0, 0));

  for (let i = 0; i < numPlanets; i++) {
    //position
    let rad = random(star.rad * 4, star.rad * 10);
    let theta = random(TWO_PI);
    let planetPos = createVector(rad * cos(theta), rad * sin(theta), 2.5); //2.5 is the ammount of wobble the planets have on z axis
    
    //velocity V = (2πa) / 2
    //pi symbol?>??????????????????????????? tf??!?!?!?!????
    //what !????
    let planetVel = planetPos.copy();
    planetVel.rotate(HALF_PI);
    planetVel.setMag( sqrt((gravitySlider.value() * star.mass) / planetPos.mag()) );
    
    //this reverses some planets directions
    if (random(1) < 0.2) {
      planetVel.mult(-1);
    }
  
    //in order to make orbits elliptical
    planetVel.mult(random(1 - extraMomentum, 1 + extraMomentum));
    planets.push(new body(random(10, 30), planetPos, planetVel));
  }
}
function draw() {
  orbitControl();
  
  push();
  angleMode(DEGREES);
  //background(0, 0, 0, 0);
  background(bgSlider.value());
  axis();

  //this makes lights vvvv
  //lights();
  //this makes a line vvvv
  //line(100, 100, 1000, 0, 0, 0)
  texture(starTexture);
  //this makes is go weeeeeeeeeeeeeeeeeee
  //rotateY(millis() / 2000);

  star.show();
    
  for (let planet of planets) {  
    //collision
    // of of n^2? ?? TF SOOOOOO LONG SHEEESH
    //more likle O(log(n))
    //ummm linked list much?
    if(collisionCheckbox.checked()){
      for (let other of planets){
        if(planet != other && planet.collides(other)) {
          boom(planet, other);
        }
      }   
    }
    
    planet.drawTrail();
    texture(planetTexture);
    tint(planet.tint[0], planet.tint[1], planet.tint[2]);
    star.attract(planet);
    planet.update();
    planet.show();

  }
   
  pop();
  push();
  fill('red');
  textFont(inconsolata);
  textSize(100);
  textAlign(CENTER, CENTER)
  text("F: " + Math.floor(frameRate()), 200, 110);
  pop();

  // noStroke();
  // texture(skybox);
  // textureWrap(REPEAT)
  // sphere(5000,100,100)
}
//what happens after collision
function boom(planet, other) {
  let p = planet.rad;
  let o = other.rad;
  
  if(p - 4 > o){ 
    console.log("removed planet at index " + planets.indexOf(other));
    console.log("mass of " + p + " > " + o);
    planets.splice(planets.indexOf(other), 1);   
  }
  if(o - 4 > p){
    console.log("removed planet at index " + planets.indexOf(planet));
    console.log("mass of " + o + " > " + p);
    planets.splice(planets.indexOf(planet), 1);
  }
  
  // else{
  //   console.log("removed planet at index " + planets.indexOf(other));
  //   console.log("removed planet at index " + planets.indexOf(planet));
  //   console.log("mass of " + o + " and " + p);
  //   planets.splice(planets.indexOf(planet), 1);  
  //   planets.splice(planets.indexOf(other), 1); 
//
  // }
  
}

function axis() {
  let len = 200;
  fill("white");
  stroke("white");
  sphere(2);
  stroke("green");
  line(0, 0, 0, len, 0, 0);
  stroke("blue");
  line(0, 0, 0, 0, len, 0);
  rotateX(90);
  stroke("red");
  line(0, 0, 0, 0, len, 0);
}

function body(_mass, _pos, _vel) {
  this.mass = _mass;
  this.pos = _pos;
  this.vel = _vel;
  this.rad = this.mass;
  this.tint = [
    Math.floor(random(0, 255)),
    Math.floor(random(0, 255)),
    Math.floor(random(0, 255)),
  ];
  this.path = [];

  this.show = function () {
    noStroke();
    translate(this.pos.x, this.pos.y, this.pos.z);
    sphere(this.rad, 30, 30);
    translate(-this.pos.x, -this.pos.y, this.pos.z);
  };

  this.update = function () {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.pos.z += this.vel.z;
    this.path.push(this.pos.copy());
    if (this.path.length > 100) {
      //path cannot grow larger than limit
      this.path.splice(0, 1);
    }
  };

  this.applyForces = function (F) {
    this.vel.x += F.x / this.mass;
    this.vel.y += F.y / this.mass;
    this.vel.z += F.z / this.mass;
  };

  //F = G(m1m2)/R2.
  this.attract = function (child) {
    let R = dist(
      this.pos.x,
      this.pos.y,
      this.pos.z,
      child.pos.x,
      child.pos.y,
      child.pos.z
    );
    let F = this.pos.copy().sub(child.pos);
    F.setMag((gravitySlider.value() * this.mass * child.mass) / (R * R));
    child.applyForces(F);
  };

  this.drawTrail = function () {
    fill(255); //trail color
    for (let i = 0; i < this.path.length - 2; i++) {
      //line(this.path[i].x, this.path[i].y, this.path[i].z, this.path[i + 1].x, this.path[i + 1].y, this.path[i + 1].z); this doesnt work for some reason
      translate(this.path[i].x, this.path[i].y, this.path[i].z);
      box(5, 5, 3);
      translate(-this.path[i].x, -this.path[i].y, -this.path[i].z);
      //console.log(this.path[i]);
    }
    //line(100, 100, 1000, 0, 0, 0);
  };

  this.collides = function (other){
    //ing'utu palmer by thomas draper & nathan mark redfearn & alexandros seth skanananananananananavis
    let pos = other.pos
    let d = dist(this.pos.x, this.pos.y, this.pos.z, pos.x, pos.y, pos.z);
    return (d < Math.floor( this.rad + other.rad ));
  }
}
