let system;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  system = new ParticleSystem(createVector(width/2, 50));
  
}

function draw() {
  background(0);

  let locX = mouseX - width / 2;
  let locY = mouseY - height / 2;

 system.origin.x = mouseX;
system.origin.y = mouseY;

  push();
  resetMatrix();
  translate(-width / 2, -height / 2);

  system.addParticle();
  system.run();

  pop();

  // LIGHTING (only affects 3D objects now)
  ambientLight(50);
  directionalLight(255, 0, 0, 0.25, 0.25, 0);
  spotLight(0, 255, 0, 150, 0, 250, 0, 0, -1);
  pointLight(0, 0, 255, locX, locY, 250);

  push();
  translate(-width / 4, 0, 0);
  rotateZ(frameCount * 0.02);
  rotateX(frameCount * 0.02);
  specularMaterial(250);
  sphere(100);
  pop();

  push();
  translate(width / 4, 0, 0);
  ambientMaterial(250);
  sphere(120);
  pop();
}

// particle code begins here

let Particle = function(position){
  this.acceleration = createVector(0,0.05);
  this.velocity = createVector(random(-1, 1), random(-1, 0));
  this.position = position.copy();
  this.lifespan = 255;
}

Particle.prototype.run = function(){
  this.update();
  this.display();
  
}

// updates position

Particle.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
  
}

// display

Particle.prototype.display = function(){
  stroke(200, this.lifespan);
  strokeWeight(2);
  fill(127, this.lifespan);
  ellipse(this.position.x, this.position.y, 12, 12);
  
}

Particle.prototype.isDead = function(){
  return this.lifespan < 0;
  
}

let ParticleSystem = function(position){
  this.origin = position.copy();
  this.particles = [];
  
}
ParticleSystem.prototype.addParticle = function() {
  this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function() {
  for (let i = this.particles.length-1; i >= 0; i--) {
    let p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }

}
