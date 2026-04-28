let pg;
let cnv;

let x =0, y =0;
let vX = 3
let vY = 5

let p1link; 


function setup() {
  cnv = createCanvas(400, 400);
  cnv.hide();
    
  pg = select('#p1'); 
  
  p1link = createA('p1.html', 'link to page1')
  


}

function draw() {
  
 
  
  background(100,0,0);
  ellipse(width/2, height/2, 50)
  
  p1link.style('font-size','25px')
  p1link.style('color','green')
  cnv.style('border', '5px deeppink dashed')
  cnv.style('z-index', '-1')
  cnv.position(windowWidth/2 - 200,windowHeight/2 -200)
  
  
  
  pg.position(x,y)
  
  
  if(x> windowWidth){
    vX = -vX;
  }
  if(y> windowHeight){
    vY= -vY;
  }
  if(x<0){
    vX = -vX;
  }
  if(y< 0){
    vY= -vY;
  }
  
  x+=vX;
  y+=vY;
  
}