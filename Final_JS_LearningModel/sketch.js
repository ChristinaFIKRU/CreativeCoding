let video;
let  faceMesh, handPose;
let faces = [], hands = [];
let triangles;
let osc1, osc2;

let notes = [68, 70, 71, 73, 75, 76, 78, 80];
// let posterizeAmount = 89;
let freq = 440;
let vibe = 0;
let vol  = 0;

let treeAngle = 0.4;
let branchLen = 80;

let faceReady = false;
let handReady = false;

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

  // Pass the ready callback as second argument — fires only when model is loaded
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true }, faceModelReady);
  handPose = ml5.handPose({ flipped: true }, handModelReady);

  osc1 = new p5.Oscillator("sine");
  osc2 = new p5.Oscillator("sine");
  osc1.start();
  osc2.start();
  osc1.amp(0);
  osc2.amp(0);
}

function draw() {
  background(0);
  // image(video, 0, 0, width, height);

  // Loading screen
  if (!faceReady || !handReady) {
    fill(255); noStroke();
    textSize(18); textAlign(CENTER, CENTER);
    text("Loading models... " + (faceReady ? "✓ face" : "… face") +
         " | " + (handReady ? "✓ hands" : "… hands"), width / 2, height / 2);
    return;
  }

  // ── Face mesh ────────────────────────────────────────────
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

  // ── Hand control ─────────────────────────────────────────
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    let pinch = dist(
      hand.keypoints[4].x, hand.keypoints[4].y,
      hand.keypoints[8].x, hand.keypoints[8].y
    );
    let wrist = hand.keypoints[0];

    if (i === 0) {
      // Hand 0: vibrato + tree angle
      vibe = map(pinch, 15, 250, 0, 10);
      treeAngle = map(wrist.x, 0, width, 0.05, HALF_PI);

      stroke(255, 255, 0); strokeWeight(2);
      line(hand.keypoints[4].x, hand.keypoints[4].y,
           hand.keypoints[8].x, hand.keypoints[8].y);
    }

    if (i === 1) {
      // Hand 1: note + branch length
      let noteIndex = constrain(floor(map(pinch, 15, 200, 0, notes.length - 1)), 0, notes.length - 1);
      freq = midiToFreq(notes[noteIndex]);
      branchLen = map(wrist.y, 0, height, 120, 20);

      stroke(0, 255, 255); strokeWeight(2);
      line(hand.keypoints[4].x, hand.keypoints[4].y,
           hand.keypoints[8].x, hand.keypoints[8].y);
    }

    // Keypoints
    noStroke();
    for (let kp of hand.keypoints) {
      fill(0, 255, 0);
      circle(kp.x, kp.y, 10);
    }
  }

  // ── Audio ─────────────────────────────────────────────────
  osc1.freq(freq - vibe);
  osc2.freq(freq + vibe);
  vol = lerp(vol, hands.length > 0 ? 0.4 : 0, 0.05);
  osc1.amp(vol);
  osc2.amp(vol);

  // ── Recursive tree — drawn BEFORE posterize so it survives the filter ──
  push();
  translate(width / 2, height);
  branch(branchLen);
  pop();

  // ── Post-processing — AFTER tree so tree is included ──────
  // filter(POSTERIZE, posterizeAmount);
}

function branch(len) {
  strokeWeight(map(len, 2, 120, 1, 10));
  stroke(255, 255, 255, 180);
  line(0, 0, 0, -len);
  translate(0, -len);
  len *= 0.67;
  if (len > 4) {
    push(); rotate(treeAngle);  branch(len); pop();
    push(); rotate(-treeAngle); branch(len); pop();
  }
}

function mousePressed() {
  userStartAudio();
}