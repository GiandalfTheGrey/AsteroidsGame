import './style.css'


const app = document.querySelector<HTMLDivElement>('#app')!;

// create a new <canvas> element
const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 450;
app.appendChild(canvas);

// get drawing context
const ctx = canvas.getContext("2d")!;


////////////////////////////////////

//Player  
// Asteroids
//Bullets
// Adding and removing asteroids
//Handle keyboard input
//Animation/ loop?

interface Vector{
  x: number,
  y: number
}

interface collider{
  pos: Vector,
  size: number,
}

interface Player{
  pos: Vector,
  vel: Vector,
  colliding: boolean,
  size: number,
  rotate: number
}

interface Projectile{
  pos: Vector,
  angle: number,
  size: number,
  colliding: boolean,
}

interface Asteroid {
  geom: Vector[]
  size: number, 
  pos: Vector,
  vel: Vector,
  colliding: boolean,
}
////////////////////////////////////
let asteroids: Asteroid[]= [];

const initGame = () =>{
  const NUM_ASTEROIDS = 30;
  for(let i = 0; i < NUM_ASTEROIDS; i++){
    let asteroid = spawnAsteroid();
    asteroids.push(asteroid);
  }

  

  //request first animation frame
  requestAnimationFrame(animate);
}

const animate= () => {
  //console.log("animate", time);
  ctx.reset();
  update();
  draw();
  createProjectile();
  
  if(HP>0){
    requestAnimationFrame(animate);
  }
  else{
    let endDiv = document.querySelector<HTMLDivElement>(".Message")!;
    endDiv.textContent = "GAME OVER";
    // let canvasDiv = document.querySelector<HTMLDivElement>("#app canvas")!;
  }

}


const draw = () =>{
  //draw all asteroids
  for(let asteroid of asteroids){
    drawAsteroid(asteroid, ctx);
  }
  //draw the player
  drawPlayer(player, ctx);

  for(let projectile of projectiles){
    drawProjectile(projectile,ctx);
  }
}

// random references
// https://javascript.info/searching-elements-dom 
// https://www.w3schools.com/jsref/prop_node_textcontent.asp

let scoreDiv = document.querySelector<HTMLDivElement>(".score")!;
let scoreCounter = 0;

let hpDiv = document.querySelector<HTMLDivElement>(".HP")!;
let HP = 300;

const update = () => {
 
  //update player
  updatePlayer();
  player.colliding = false;
  //collision detection
  for(let asteroid of asteroids ){
    if(checkCollision(asteroid, player)){
      player.colliding = true;
      HP -= 1;
      hpDiv.textContent = "HP:" + HP.toString();
    }
  }
  
  // remove projectiles and asteroids upon collision
  for(let i = 0; i < asteroids.length; i++  ){
     for(let j = 0; j < projectiles.length; j++){
      if(checkCollision(asteroids[i], projectiles[j])){
        //remove objects
        projectiles.splice(j, 1);
        asteroids.splice(i, 1);
         
        
        //update score number
        scoreCounter += 1;
        scoreDiv.textContent = "score:" + scoreCounter.toString(); 
        break;
      }
      
    } 
  }

   for(let projectile of projectiles){
    updateProjectile(projectile);
  }

   for(let asteroid of asteroids){
    updateAsteroid(asteroid);
  }

}

const checkCollision = (colliderA: collider,
  colliderB: collider): boolean=>{
    let dx= colliderB.pos.x - colliderA.pos.x;
    let dy= colliderB.pos.y - colliderA.pos.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    //tweak dist for closer or further bounds
    return (dist*2 < colliderA.size + colliderB.size);
}

////////////////////////////////////



const randomAsteroidGeom = (): Vector[] => {
  let geom: Vector[] = [];

  const NUM_POINTS = 20;

  for(let k = 0; k < NUM_POINTS; k++){
    let angle = k*(2*Math.PI) / NUM_POINTS;
    let radius = 0.4 + Math.random()*0.3;
    let x = radius* Math.cos(angle) ;
    let y = radius* Math.sin(angle) ;
    geom.push({ x, y});
  }
  
  return geom;
}

const updateAsteroid = (asteroids: Asteroid)=> {
  asteroids.pos.x += asteroids.vel.x;
  asteroids.pos.y += asteroids.vel.y;

  let padding = 30;
  // padding controls offscreen respawn distance 

  // if bounce is set to 1 then the asteroids simply wrap around
  //the screen and reappear on opposite side
  // if set to -1 they bounce back when hitting the border 
  // outside canvas frame
  let bounce = -1

    if (asteroids.pos.x < -padding)
      asteroids.pos.x = canvas.width + padding;
      asteroids.vel.x *= bounce;

    if (asteroids.pos.x > canvas.width + padding)
      asteroids.pos.x = -padding;
      asteroids.vel.x *= bounce;

    if (asteroids.pos.y > canvas.height + padding)
      asteroids.pos.y = -padding;
      asteroids.vel.y *= bounce;

    if (asteroids.pos.y < -padding)
      asteroids.pos.y = canvas.height + padding;
      asteroids.vel.y *= bounce;
}


const drawAsteroid = (asteroid: Asteroid, ctx: CanvasRenderingContext2D) =>{
  ctx.fillStyle = "rgb(74, 67, 54)";
  ctx.beginPath();
  for(let point of asteroid.geom){
    let x = asteroid.pos.x + point.x * asteroid.size;
    let y = asteroid.pos.y + point.y * asteroid.size;
    ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();
}

const spawnAsteroid = (): Asteroid => {

  let geom = randomAsteroidGeom();

  let size = 25 + Math.random() * 30;

  let pos: Vector = {x: Math.random() * canvas.width,
    y: Math.random() * (canvas.height / 2) //make all asteroids
    //initially spawn above ship
  }

  //tweak velocity of asteroids. Make sure they're not too fast
  let vel: Vector = {
    x: (Math.random()*2-1)*0.7,
    y: (Math.random()*2-1)*0.7,
  }

  let colliding: boolean = false;

  return{
    geom,
    size,
    pos,
    vel,
    colliding
  }
}



////////////////////////////////////

//https://developer.mozilla.org/en-US/docs/Web/CSS/
// Reference/Properties/rotate

const player: Player ={
  pos: {x: 400, y: 400},
  vel: {x:0, y:0},
  size: 30,
  colliding: false,
  rotate: 0,
}


const drawPlayer = (player: Player, ctx: CanvasRenderingContext2D) =>{
  
  if(player.colliding){
    ctx.fillStyle = "red";
  }
  else{ctx.fillStyle = "blue";}
  
  
  ctx.beginPath();


  // customize dimension of arrow
  let offset_x = 12;
  let offset_y = 28;


  //length of point from pivot/ centroid
  let hyp1 = Math.sqrt(offset_x**2 + offset_y**2 );
  let hyp2 = Math.sqrt((offset_y/1.5)**2 );
  let hyp3 = hyp1;

  // angle radians minus thr rotation fromuser
  let theta1 = Math.atan2(offset_y, offset_x);
  let theta2 = Math.atan2(offset_y/1.5, 0);
  let theta3 = Math.atan2(offset_y, -offset_x);

  console.log( "debug" , theta1, theta2, theta3);

 //some reference for using lineTo method
  // |
  // V
  //https://codingnomads.com/draw-triangle-javascript-canvas

  //using trigonometry and reconverting polar coordinates to Cartesian coordinates
  ctx.moveTo(player.pos.x, player.pos.y);
  ctx.lineTo(player.pos.x + hyp1*Math.cos(theta1+player.rotate), player.pos.y + hyp1*Math.sin(theta1+player.rotate));
  ctx.lineTo(player.pos.x + hyp2*Math.cos(theta2+player.rotate), player.pos.y + hyp2*Math.sin(theta2+player.rotate));
  ctx.lineTo(player.pos.x + hyp3*Math.cos(theta3+player.rotate), player.pos.y + hyp3*Math.sin(theta3+player.rotate));
  ctx.moveTo(player.pos.x, player.pos.y);
 

  ctx.closePath();
  ctx.fill();
}


let trigger = false;
let v = 0.3;

const updatePlayer = () =>{
  
  
  
  //calculate angle and new pos of centroid using polar coordinates
   let offset_y = 5;
   let hyp2 = Math.sqrt((offset_y/1.5)**2 );
   let theta2 = Math.atan2(offset_y/1.5, 0);

  if(isKeyDown(Keys.DOWN))
  {
    trigger = true
    player.pos.x +=  hyp2*Math.cos(theta2+player.rotate);
    player.pos.y +=   hyp2*Math.sin(theta2+player.rotate);
    
    v = Math.abs(v);
   
  }
  if(isKeyDown(Keys.UP))
  {
    trigger = true;
    player.pos.x -= hyp2*Math.cos(theta2+player.rotate);
    player.pos.y -= hyp2*Math.sin(theta2+player.rotate);

    
     v = -v;
    
  }
  // rotate by increments of 30 deg
  if(isKeyDown(Keys.LEFT))
  {
    player.rotate += (5 * Math.PI) / 180;
  }
  if(isKeyDown(Keys.RIGHT))
  {
    player.rotate -= (5 * Math.PI) / 180;
  }
  
  
  // update player velocity 
  player.vel.x = v;
  player.vel.y = v;
  //add drift only after first upward or downward thrust
  if( trigger == true){
  player.pos.x += hyp2*Math.cos(theta2+player.rotate)* (player.vel.x );
  player.pos.y += hyp2*Math.sin(theta2+player.rotate)* (player.vel.y );
  }
  

  //This code prevents player from exiting canvas
  // player.pos.x = Math.max(0, Math.min(canvas.width, player.pos.x));
  // player.pos.y = Math.max(0, Math.min(canvas.height, player.pos.y));

  //how far away player can travel before reappearing
  let padding = 12;
  let bounce = 1;

    if (player.pos.x < -padding)
      player.pos.x = canvas.width + padding;
      player.vel.x *= bounce;

    if (player.pos.x > canvas.width + padding)
      player.pos.x = -padding;
      player.vel.x *= bounce;

    if (player.pos.y > canvas.height + padding)
      player.pos.y = -padding;
      player.vel.y *= bounce;

    if (player.pos.y < -padding)
      player.pos.y = canvas.height + padding;
      player.vel.y *= bounce;
}

////////////////////////////////////


const Keys = {
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  SHOOT: "Space"
}
const keyboardState = new Map<String, boolean>();

const handleKeyDown = (e: KeyboardEvent) =>{
  e.preventDefault();
  console.log("DOWN:", e.code);
  keyboardState.set(e.code, true);
}
window.addEventListener("keydown", handleKeyDown);

const handleKeyUp = (e: KeyboardEvent) =>{
  console.log("UP:", e.code);
  keyboardState.set(e.code, false);
}
window.addEventListener("keyup", handleKeyUp);

const isKeyDown = (code: string): boolean =>{
  return keyboardState.get(code) ?? false;
}
////////////////////////////////////
// interface reference
//          |
//          v
// interface Projectile{
//   pos: Vector,
//   vel: Vector,
//   Size: number
// }

// Projectile initialization
// const projectile: Projectile ={
//   pos: {x:player.pos.x, y:player.pos.y},
//   vel: {x:0, y:0},
//   size: 10,
// }
//Create array, to update, loop over created projectiles
let projectiles: Projectile[]= [];

// Whenenver spacebar is clicked a new projectile with a trajectory, orientation is created
const createProjectile =() =>{

  if(isKeyDown(Keys.SHOOT)){
    let newProjectile: Projectile ={
       pos: {x:player.pos.x, y:player.pos.y},
      //  angle: Math.atan2(player.pos.y, player.pos.x) - (Math.PI/2),
      angle: player.rotate,
       size: 2,
       colliding: false
    };

    projectiles.push(newProjectile);

    // let happened = false;
    // if(((projectiles.length + 1) % 3 == 0) && happened == false){
    //     projectiles.pop();
    //     happened = true;
    //   }
    
    
  }
}

//projectile updates it position after every time frame
const updateProjectile = (projectiles: Projectile)=>{

  let r = 2; //how far it travels
  projectiles.pos.x = projectiles.pos.x + r * Math.cos(projectiles.angle - Math.PI/2);
  projectiles.pos.y = projectiles.pos.y + r * Math.sin(projectiles.angle - Math.PI/2);


}
//projectile measures distance to determine colllsion with asteroid


// This projectile is drawn as a circle
const drawProjectile =(projectile: Projectile, ctx: CanvasRenderingContext2D) =>{
  ctx.beginPath();
  ctx.arc(projectile.pos.x, projectile.pos.y, projectile.size, 0, 2*Math.PI);
  ctx.fillStyle = "yellow";
  ctx.fill();
}

////////////////////////////////////

initGame();


