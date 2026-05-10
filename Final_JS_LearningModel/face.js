let video;
let faceMesh, handPose;
let faces = [], hands = [];
let triangles;
let osc1, osc2;
let angle;
let system = [];

let notes = [68, 70, 71, 73, 75, 76, 78, 80];
let posterizeAmount = 3;
let freq = 440;
let vibe = 0;
let vol  = 0;

let treeAngle = 0.4;
let branchLen = 80;

let faceReady = false;
let handReady = false;

//  Background particle system 
let bgParticles = [];
const NUM_BG = 180;
let noiseScale = 0.0025;
let noiseZ = 0;

// palette: electric blue / violet / cyan / magenta
let palette = [
  [80,  160, 255],
  [160, 80,  255],
  [40,  220, 220],
  [220, 60,  220],
  [100, 220, 255],
];

function initParticles() {
  bgParticles = [];
  for (let i = 0; i < NUM_BG; i++) {
    let c = palette[floor(random(palette.length))];
    bgParticles.push({
      x:    random(width),
      y:    random(height),
      px:   0,   // previous x (for line trail)
      py:   0,
      r:    c[0], g: c[1], b: c[2],
      size: random(1.2, 3.5),
      speed: random(0.8, 2.2),
    });
  }
  for (let p of bgParticles) { p.px = p.x; p.py = p.y; }
}


function gotFaces(results) { faces = results; }
function gotHands(results) { hands = results; }

function faceModelReady() {
  console.log("faceMesh ready");
  faceMesh.detectStart(video, gotFaces);
  triangles = faceMesh.getTriangles();
  faceReady = true;
}

function handModelReady() {
  console.log("handPose ready");
  handPose.detectStart(video, gotHands);
  handReady = true;
}

function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true }, faceModelReady);
  handPose = ml5.handPose({ flipped: true }, handModelReady);

  osc1 = new p5.Oscillator("sine");
  osc2 = new p5.Oscillator("sine");
  osc1.start(); osc2.start();
  osc1.amp(0); osc2.amp(0);

  initParticles();
}

function draw() {
  background(10, 100);

  // Loading screen
  if (!faceReady || !handReady) {
    fill(255); noStroke();
    textSize(18); textAlign(CENTER, CENTER);
    text(
      "Loading models... " +
      (faceReady ? "✓ face" : "… face") +
      " | " +
      (handReady ? "✓ hands" : "… hands"),
      width / 2, height / 2
    );
    return;
  }

  //  Background particle flow field 
  noiseZ += 0.005;

  // it gahters wrist attractors from live hands
  let attractors = hands.map(h => {
    let pinch = dist(
      h.keypoints[4].x, h.keypoints[4].y,
      h.keypoints[8].x, h.keypoints[8].y
    );
    return {
      x:      h.keypoints[0].x,
      y:      h.keypoints[0].y,
      // tight pinch → strong vortex; open hand so that ti gentle drift
      strength: map(pinch, 15, 220, 6.5, 0.3, true),
    };
  });

  for (let p of bgParticles) {
    let flowAngle = noise(p.x * noiseScale, p.y * noiseScale, noiseZ) * TWO_PI * 2.5;

    // Accumulate hand-vortex influence
    let axTotal = 0, ayTotal = 0;
    for (let att of attractors) {
      let dx = att.x - p.x;
      let dy = att.y - p.y;
      let d  = max(sqrt(dx*dx + dy*dy), 1);
      // Perpendicular to the radial direction -> swirl / vortex
      let perpX = -dy / d;
      let perpY =  dx / d;
      // Also a small inward pull so particles spiral toward the wrist
      let inX = dx / d;
      let inY = dy / d;
      let falloff = att.strength * (300 / (d + 80));
      axTotal += (perpX * 0.75 + inX * 0.25) * falloff;
      ayTotal += (perpY * 0.75 + inY * 0.25) * falloff;
    }

    let vx = cos(flowAngle) * p.speed + axTotal;
    let vy = sin(flowAngle) * p.speed + ayTotal;

    // Draw trail line for flowing thingys
    strokeWeight(p.size);
    let alpha = attractors.length > 0 ? 200 : 130;
    stroke(p.r, p.g, p.b, alpha);
    line(p.px, p.py, p.x, p.y);

    // Occasionally pulse a small glow dot at the head
    if (random() < 0.06 && attractors.length > 0) {
      noStroke();
      fill(p.r, p.g, p.b, 160);
      circle(p.x, p.y, p.size * 3.5);
    }

    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy;

    // Wrap edges ( added this so it reset trail to avoid long diagonal line)
    if (p.x < 0)      { p.x = width;  p.px = p.x; }
    if (p.x > width)  { p.x = 0;      p.px = p.x; }
    if (p.y < 0)      { p.y = height; p.py = p.y; }
    if (p.y > height) { p.y = 0;      p.py = p.y; }
  }

  //  Face mesh 
  if (faces.length > 0 && triangles) {
    let face = faces[0];
    randomSeed(0);
    noStroke();
    beginShape(TRIANGLES);
    for (let i = 0; i < triangles.length; i++) {
      let [a, b, c] = triangles[i];
      let pA = face.keypoints[a];
      let pB = face.keypoints[b];
      let pC = face.keypoints[c];
      fill(random(255), random(255), random(255));
      vertex(pA.x, pA.y);
      vertex(pB.x, pB.y);
      vertex(pC.x, pC.y);
    }
    endShape();
  }

  //  Hand control 
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    let pinch = dist(
      hand.keypoints[4].x, hand.keypoints[4].y,
      hand.keypoints[8].x, hand.keypoints[8].y
    );
    let wrist = hand.keypoints[0];

    if (i === 0) {
      vibe      = map(pinch, 15, 250, 0, 10);
      treeAngle = map(wrist.x, 0, width, 0.05, HALF_PI);
      stroke(255, 255, 0); strokeWeight(2);
      line(hand.keypoints[4].x, hand.keypoints[4].y,
           hand.keypoints[8].x, hand.keypoints[8].y);
    }

    if (i === 1) {
      let noteIndex = constrain(
        floor(map(pinch, 15, 200, 0, notes.length - 1)), 0, notes.length - 1
      );
      freq      = midiToFreq(notes[noteIndex]);
      branchLen = map(wrist.y, 0, height, 120, 20);
      stroke(0, 255, 255); strokeWeight(2);
      line(hand.keypoints[4].x, hand.keypoints[4].y,
           hand.keypoints[8].x, hand.keypoints[8].y);
    }

    noStroke();
    for (let kp of hand.keypoints) {
      fill(0, 255, 0);
      circle(kp.x, kp.y, 10);
    }
  }

  //  Audio
  osc1.freq(freq - vibe);
  osc2.freq(freq + vibe);
  vol = lerp(vol, hands.length > 0 ? 0.4 : 0, 0.05);
  osc1.amp(vol);
  osc2.amp(vol);

  //  Recursive tree 
  for (let x = 50; x < width; x += 80) {
    push();
    translate(x, height);
    branch(branchLen);
    pop();
  }

  push();
  translate(width / 2, height);
  branch(branchLen);
  pop();

  filter(POSTERIZE, posterizeAmount);
}

function branch(len) {
  strokeWeight(map(len, 2, 120, 1, 10));
  stroke(219, 181, 55);
  line(0, 0, 0, -len);
  translate(0, -len);
  len *= 0.67;
  if (len > 4) {
    push(); rotate(-treeAngle); branch(len); pop();
    push(); rotate(treeAngle);  branch(len); pop();
  }
}

function mousePressed() {
  userStartAudio();
}