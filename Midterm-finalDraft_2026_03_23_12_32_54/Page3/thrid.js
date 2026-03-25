let video;
let faceMesh;
let faces = [];
let triangles;
let particles = [];
let mouthAngle = 0;
let mouthSpeed = 0.05;
let isOpening = true;

function preload(){
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}
function mousePressed(){
  console.log(faces);
}
function gotFaces(results){
  faces= results;
}



function setup() {
  createCanvas(640, 400);
  video = createCapture(VIDEO, { flipped: true});
  video.hide();
  faceMesh.detectStart(video,gotFaces);
  triangles = faceMesh.getTriangles();
  console.log(triangles);
}

function draw() {
  background(0); 

  // image(video, 0, 0);

  // 
  if (isOpening) {
    mouthAngle += mouthSpeed;
    if (mouthAngle > 0.5) isOpening = false;
  } else {
    mouthAngle -= mouthSpeed;
    if (mouthAngle < 0.01) isOpening = true;
  }

  //  Draw mouth as an arc
  fill(20);
  let start = PI - mouthAngle * PI;
  let end = PI + mouthAngle * PI;
  arc(width / 2, height / 2, 200, 200, start, end, PIE);

  //  Emit particles from mouth
  if (mouthAngle > 0.2) {
    for (let i = 0; i < 3; i++) {
      particles.push(new Particle(width / 2, height / 2)); // You could replace this with actual mouth position from FaceMesh
    }
  }

  //  Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) particles.splice(i, 1);
  }

  //  Draw face triangles (on top of particles)
  if (faces.length > 0) {
    let face = faces[0];
    beginShape(TRIANGLES);
    for (let i = 0; i < triangles.length; i++) {
      let tri = triangles[i];
      let [a, b, c] = tri;
      let pointA = face.keypoints[a];
      let pointB = face.keypoints[b];
      let pointC = face.keypoints[c];

      fill(random(255), random(255), random(255));
      vertex(pointA.x, pointA.y);
      vertex(pointB.x, pointB.y);
      vertex(pointC.x, pointC.y);
    }
    endShape();
  }
}



//Particle Class
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, -3); // Flow to the left
    this.vy = random(-2, 2);
    this.alpha = 255;
    this.size = random(5, 12);
  }

  finished() {
    return this.alpha < 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5; // Fade out
  }

  show() {
    noStroke();
    fill(255, 100, 50, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}







