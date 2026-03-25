let movers = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  // Create movers
  for (let i = 0; i < 5; i++) {
    movers.push(new Mover(i));
  }
}

function draw() {
  background(51);

  // pixel bg
  loadPixels();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = (x + y * width) * 4;

      pixels[index + 0] = 255 * sin(x / 40);
      pixels[index + 1] = 255 * sin(y / 10);
      pixels[index + 2] = 10;
      pixels[index + 3] = 255;
    }
  }
  updatePixels();


  // where it moves on top of the pixel
  for (let mover of movers) {
    mover.update();
    mover.checkEdges();
    mover.checkCollision();
    mover.show();
  }
}

class Mover {
  constructor(i) {
    this.mass = 1;
    this.position = createVector(random(width), random(height));
    this.velocity = createVector(random(-2, 2), random(-2, 2));
    this.acceleration = createVector(0, 0);
    this.col = color(220);
    this.index = i;
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    // random wandering
    let wander = p5.Vector.random2D();
    wander.mult(0.2);
    this.applyForce(wander);

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  show() {
    stroke(0);
    strokeWeight(2);
    fill(this.col);
    ellipse(this.position.x, this.position.y, 100);

    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text(this.index, this.position.x, this.position.y);
  }

  checkEdges() {
    if (this.position.x > width || this.position.x < 0) {
      this.velocity.x *= -1;
    }

    if (this.position.y > height || this.position.y < 0) {
      this.velocity.y *= -1;
    }
  }

  checkCollision() {
    this.col = color(random(220), random(0), random(352), 82);

    for (let j = 0; j < movers.length; j++) {
      if (j !== this.index) {
        line(
          this.position.x,
          this.position.y,
          movers[j].position.x,
          movers[j].position.y
        );

        let d = dist(
          this.position.x,
          this.position.y,
          movers[j].position.x,
          movers[j].position.y
        );

        if (d < 100) {
          this.col = color(255, 0, 0);
        }
      }
    }
  }
}