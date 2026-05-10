// zoom out and after 10sec rotate screen/sketch
let video;
let handPose;
let hands = [];

let handReady = false;

let fft;
let audioStarted = false;

let pieces = 12;
let radius = 220;

let bgColor = "#070814";

let bassColor = ["#4f6cff", "#1900ff"];
let midColor = "#ff3b30";
let trebleColor = "#c3ff00";

let keys = [];
let keySounds = [];

let notes = [
  'C4.wav', 'D4.wav', 'E4.wav', 'F4.wav',
  'G4.wav', 'A4.wav', 'B4.wav', 'C5.wav'
];

let lastPlayed = -1;

let loadingOverlay;


// LOAD

function preload() {
  soundFormats('wav');
  for (let i = 0; i < notes.length; i++) {
    keySounds.push(loadSound(notes[i]));
  }
}

// HAND CALLBACKS

function gotHands(results) {
  hands = results;
}

function handModelReady() {
  console.log("HandPose ready");
  handPose.detectStart(video, gotHands);
  handReady = true;

  // Fade out and remove the overlay
  loadingOverlay.style('opacity', '0');
  setTimeout(() => loadingOverlay.remove(), 600);
}

// SETUP

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);

  fft = new p5.FFT(0.9, 256);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose = ml5.handPose(
    { flipped: true },
    handModelReady
  );

  // Loading overlay — styled div instead of a raw <p> block
  loadingOverlay = createDiv(`
    <div class="pv-spinner"></div>
    <div class="pv-label">Piano Vision</div>
    <div class="pv-sub">Initialising hand tracking…</div>
  `);

  loadingOverlay.style('position', 'fixed');
  loadingOverlay.style('inset', '0');
  loadingOverlay.style('display', 'flex');
  loadingOverlay.style('flex-direction', 'column');
  loadingOverlay.style('align-items', 'center');
  loadingOverlay.style('justify-content', 'center');
  loadingOverlay.style('gap', '16px');
  loadingOverlay.style('background', '#070814');
  loadingOverlay.style('z-index', '999');
  loadingOverlay.style('transition', 'opacity 0.6s ease');
  loadingOverlay.style('pointer-events', 'none');

  // Inject spinner + label styles once
  let styleTag = createElement('style', `
    .pv-spinner {
      width: 50px; height: 50px;
      border: 2px solid rgba(79,108,255,0.15);
      border-top-color: #4f6cff;
      border-radius: 50%;
      animation: pv-spin 1s linear infinite;
    }
    @keyframes pv-spin { to { transform: rotate(360deg); } }
    .pv-label {
      font-family: 'Courier New', monospace;
      font-size: 22px;
      letter-spacing: 0.18em;
      color: #4f6cff;
      text-transform: uppercase;
    }
    .pv-sub {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      letter-spacing: 0.12em;
      color: rgba(255,255,255,0.35);
    }
  `);
  styleTag.parent(document.head);

  // Piano keys
  let startX = -220;
  for (let i = 0; i < 8; i++) {
    keys.push({ x: startX + i * 60, active: false });
  }
}


// DRAW


function draw() {
  background(bgColor);
  orbitControl();

  fft.analyze();

  let bass   = fft.getEnergy("bass");
  let mid    = fft.getEnergy("mid");
  let treble = fft.getEnergy(2000, 6000);

  let mapBass     = map(bass,   0, 255, 0, 250);
  let scaleBass   = map(bass,   0, 255, 1, 1.8);
  let mapMid      = map(mid,    0, 255, -radius, radius);
  let scaleTreble = map(treble, 0, 255, 0.7, 2);

  // AMBIENT GLOW

  push();
  noStroke();
  for (let i = 0; i < 15; i++) {
    fill(30, 40, 100 + bass, 12);
    ellipse(0, 0, 700 + i * 70 + bass, 700 + i * 70 + bass);
  }
  pop();

  // RADIAL MUSIC VISUALIZER

  translate(-50, -50);

  for (let i = 0; i < pieces; i++) {
    rotate(TWO_PI / pieces);
    noFill();

    // BASS
    // push();
    // strokeWeight(8);
    // stroke(bassColor[0]);
    // scale(scaleBass);
    // rotate(frameCount * 0.3);
    // point(mapBass, radius);
    // stroke(bassColor[1]);
    // strokeWeight(2);
    // line(0, 0, radius, radius);
    // pop();

    // MID
    // push();
    // stroke(midColor);
    // strokeWeight(4);
    // rotate(-frameCount * 0.15);
    // point(mapMid, radius * 0.8);
    // pop();

    // TREBLE
  //   push();
  //   stroke(trebleColor);
  //   strokeWeight(3);
  //   scale(scaleTreble);
  //   rotate(frameCount * 0.4);
  //   point(-120, radius / 2);
  //   point(120, radius / 2);
  //   pop();
   }

  // WAVEFORM

  let waveform = fft.waveform();

  push();
  translate(0, 260);
  noFill();
  stroke(255);
  strokeWeight(3);
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, -width / 2, width / 2);
    let y = map(waveform[i], -1, 1, -80, 80);
    vertex(x, y);
  }
  endShape();
  pop();

  
  // PIANO FLOOR
  

  push();
  // rotateX(85);
  translate(0, 350, -100);
  noStroke();
  fill(15, 15, 25);
  // plane(1800, 800);
  pop();

  // PIANO KEYS

  for (let key of keys) {
    push();
    translate(key.x, 240, 0);
    if (key.active) {
      emissiveMaterial(255, 240, 120);
    } else {
      ambientMaterial(255);
    }
    stroke(0);
    box(55, 220, 25);
    pop();
    key.active = false;
  }

  // HAND TRACKING

  if (hands.length > 0) {
    let hand   = hands[0];
    let finger = hand.keypoints[8];
    let thumb  = hand.keypoints[4];

    let pinch = dist(finger.x, finger.y, thumb.x, thumb.y);

    let keyIndex = constrain(
      floor(map(finger.x, 0, video.width, 0, keys.length)),
      0,
      keys.length - 1
    );

    keys[keyIndex].active = true;

    if (pinch < 40 && keyIndex !== lastPlayed) {
      keySounds[keyIndex].play();
      lastPlayed = keyIndex;
    }
    if (pinch > 50) lastPlayed = -1;

    // HAND ORB
    push();
    translate(
      map(finger.x, 0, video.width,  -width / 2,  width / 2),
      map(finger.y, 0, video.height, -height / 2, height / 2),
      120
    );
    noStroke();
    emissiveMaterial(255, 100 + bass, 100);
    sphere(18 + bass * 0.05);
    pop();
  }
}

// START AUDIO ON CLICK

function mousePressed() {
  if (!audioStarted) {
    userStartAudio();
    audioStarted = true;
  }
}

// RESIZE

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}