let video;
let faceMesh;
let faces = [];
let triangles;
let canvas;
// wave hands on screen

let notes = [68, 70, 71, 73, 75, 76, 78, 80];

let handPose;
let hands = [];

let osc1, osc2;

// let blurAmount = 1;
let posterizeAmount = 1;


let freq = 440;
let vibe = 0;
let ampl = 0;
let vol = 0;

function preload(){
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
  
    // Load the handPose model
  handPose = ml5.handPose();
  
}
function mousePressed(){
  console.log(faces);
}
function gotFaces(results){
  faces= results;
}
function gotHands(results) {
  hands = results;
}




function setup() {
  //you can give it x and y cordinates and take windows width and height
  
  canvas = createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true});
  video.hide();
  faceMesh.detectStart(video,gotFaces);
  handPose.detectStart(video, gotHands);
  triangles = faceMesh.getTriangles();
  console.log(triangles);
  
osc1 = new p5.Oscillator("sine");
  osc2 = new p5.Oscillator("sine");
 

  osc1.start();
  osc2.start();
  
}

function draw() {
  background(0);
  // video.pixels();
    image(video, 0, 0, width, height);

// image(video, 0, 0);
if (faces.length > 0){
  let face = faces[0];
  randomSeed(0);
  beginShape(TRIANGLES);
  
    for(let i = 0; i < triangles.length; i++){
      let tri = triangles[i];
      let [a, b, c] = tri;
      let pointA = face.keypoints[a];
      let pointB = face.keypoints[b];
      let pointC = face.keypoints[c];
      // stroke(255, 255, 0);
      let cx = pointA.x + pointB.x + pointC.x
      let cy = pointA.y + pointB.x + pointC.x
      cx /= 3;
      cy /=3;
      
//       let index = floor(cx) + floor(cy)*video.width;
//       index *= 4;
//       let rr = video.pixels[index];
//       let gg = video.pixels[index + 1];
//       let bb = video.pixels[index + 2];
      
//       // let col = video.get(cx,cy);
      
//       noStroke();
      // fill(rr, gg, bb);
      fill(random(255), random (321), random(255));
    
      vertex(pointA.x, pointA.y);
      vertex(pointB.x, pointB.y);
      vertex(pointC.x, pointC.y);
      
 
    }
  endShape();
      
    }
  
  osc1.freq(freq - vibe);
  osc2.freq(freq + vibe);

  vol = lerp(vol, ampl, 0.3);

  osc1.amp(1);
  osc2.amp(1);


  
   // filter(BLUR, blurAmount);
    filter(POSTERIZE, posterizeAmount);

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    if (i == 0) {
      stroke(255, 255, 0);
      line(
        hand.keypoints[4].x,
        hand.keypoints[4].y,
        hand.keypoints[8].x,
        hand.keypoints[8].y
      );

      vibe = dist(
        hand.keypoints[4].x,
        hand.keypoints[4].y,
        hand.keypoints[8].x,
        hand.keypoints[8].y
      );

      vibe = map(vibe, 15, 250, 0, 10);

      print(vibe);

    }


    if (i == 1) {
      stroke(0, 255, 255);

      line(
        hand.keypoints[4].x,
        hand.keypoints[4].y,
        hand.keypoints[8].x,
        hand.keypoints[8].y
      );

      
      let index = dist(
        hand.keypoints[4].x,
        hand.keypoints[4].y,
        hand.keypoints[8].x,
        hand.keypoints[8].y
      );
      
      index = floor(map(index,15,200,0,9))
      
      freq = midiToFreq(notes[index]);
    }

    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(0, 255, 352);

      if (i == 0) {
        if (j == counter) {
          fill(255, 0, 255);
        } else {
          fill(0, 255, 0);
        }
      }
      circle(keypoint.x, keypoint.y, 10);
    }
  }
  
  }


let counter = 0;






