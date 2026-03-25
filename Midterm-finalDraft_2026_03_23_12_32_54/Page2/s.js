
let myGeometry;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  
  
  
  // Create a very small torus.
  beginGeometry();
  torus(1, 0.25);
  myGeometry = endGeometry();

  // Normalize the torus so its vertices fill
  // the range [-100, 100].
  myGeometry.normalize();
  


}

function draw() {
 background(random(0, 353));
  
    orbitControl();

  lights();

  rotateY(frameCount * 0.03);

  // Style the torus.
  noStroke(0);

  // Draw the torus.
  model(myGeometry);
    stroke(255,0, 353);

   for (let i = 0; i < myGeometry.vertices.length; i += 1) {

    // Get the vertex p5.Vector object.
    let v = myGeometry.vertices[i];

    // Get the vertex normal p5.Vector object.
    let n = myGeometry.vertexNormals[i];

    // Calculate a point along the vertex normal.
    let p = p5.Vector.mult(n, 8);
     
      push();
    translate(v);
    line(1, 2, 1, p.x, p.y, p.z);
    pop();
  }
  
  
    // orbitControl(mouseX, mouseY, 1, options);

}