let xLoc = [];
let yLoc = [];

let numSegments = 70;
let counter = 0;

let col1, col2;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Make sure canvas sits behind everything
  let c = document.querySelector("canvas");
  c.style.position = "fixed";
  c.style.top = "0";
  c.style.left = "0";
  c.style.zIndex = "-1";

  // Initialize positions
  for (let i = 0; i < numSegments; i++) {
    xLoc[i] = width / 2;
    yLoc[i] = height / 2;
  }

  col1 = color(random(255), random(255), random(255));
  col2 = color(random(255), random(255), random(255));
}

function draw() {
  background(13, 17, 23, 40); // dark transparent background

  worm(150, 30, col1, col2);
  worm(100, 10, col2, col1);

  counter += 0.01;
}

function worm(wormWidth, offset, c1, c2) {
  let targetX = mouseX;
  let targetY = mouseY;

  xLoc[numSegments - 1] = lerp(xLoc[numSegments - 1], targetX, 0.2);
  yLoc[numSegments - 1] = lerp(yLoc[numSegments - 1], targetY, 0.2);

  for (let i = 0; i < numSegments - 1; i++) {
    xLoc[i] = xLoc[i + 1];
    yLoc[i] = yLoc[i + 1];

    let s = sin(map(i, 0, numSegments - 3, 0, TWO_PI));

    let d = s * offset;
    let e = wormWidth * s;

    let c = lerpColor(c1, c2, s);

    stroke(c);
    noFill();

    ellipse(xLoc[i], yLoc[i], d, e);
  }
}

/* keeps canvas full screen */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
