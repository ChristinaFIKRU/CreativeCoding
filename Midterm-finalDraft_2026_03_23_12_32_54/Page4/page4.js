
let pg;
let movers = [];

let keyWords = {
  'H': "Hola", 
  'O': "Olá ", 
  'E': "Hello",
  'S': "Selam", 
  'N': "Namaste"

};

///wordmover clss

class WordMover{
  constructor (word, x, y){
    this.word=word;
    this.x=x;
    this.y=y;
    this.xV=random(-2,2);
    this.yV=random(-2,2);
    this.osc = random(TWO_PI);
    this.color=color(random(255), random(255), random(255));
    
  }
  
  update(){
    this.x += this.xV;
    this.y += this.yV;
    
    //this allows ut to bounce off edges
    
    if (this.x < 0 || this.x > width) this.xV *= -1;
    if (this.y < 0 || this.y > height) this.yv *= -1;
    
    this.osc += 0.05; 
  }
  
  show (pg){
    pg.push();
    pg.textSize(30);
    pg.textAlign(CENTER, CENTER);
    pg.fill(this.color);
    pg.noStroke();
    
    //draws leeter with sin osc
    
  for (let i = 0; i < this.word.length; i++){
    let letterX = this.x + i * 40;
    let letterY = this.y + sin(this.osc + i) * 20;
    pg.text(this.word[i], letterX, letterY);
    
  }
    pg.pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  pg = createGraphics(width, height);
}

function draw() {
  background(51);

  // pixel effect
  loadPixels();
  // pixel loop...
  for (let y= 0; y<height; y++){
    for (let x = 0; x < width; x++){
      let index = (x + y * width)* 4;
      pixels[index + 0] = 255 * (x/300);
      pixels [index + 1] = 255 * sin(y/10);
      pixels[index + 2] = 10;
      pixels[index + 3] = 255;
    }
  }
  updatePixels();
  
  pg.clear();
  for (let m of movers){
    m.update();
    m.show(pg);
  }
    image(pg, 0, 0);

  
  }
 function keyPressed(){
   let word = keyWords[key.toUpperCase()];
   if (word){
     movers.push(new WordMover(word, mouseX, mouseY));
   }

  

}