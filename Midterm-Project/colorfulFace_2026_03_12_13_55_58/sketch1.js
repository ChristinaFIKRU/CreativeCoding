let video;
let faceMesh;
let faces = [];
let triangles;

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
  // video.pixels();
  
// image(video, 0, 0);
if (faces.length > 0){
  let face = faces[0];
  // randomSeed(5);
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
  }






