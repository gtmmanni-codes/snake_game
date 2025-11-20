// Snake game (separate file)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');

const TILE = 20; // size of one tile in pixels
const COLS = canvas.width / TILE; // 20 if 400/20
const ROWS = canvas.height / TILE;

let snake, dir, food, score, highScore, running, paused, gameLoopId, speed;

function resetGame(){
  snake = [ {x: Math.floor(COLS/2), y: Math.floor(ROWS/2)} ];
  dir = {x: 1, y: 0};
  placeFood();
  score = 0;
  speed = 120; // ms per frame (lower = faster)
  running = true;
  paused = false;
  scoreEl.textContent = score;
  highScore = Number(localStorage.getItem('snakeHigh') || 0);
  highScoreEl.textContent = highScore;
  loop();
}

function placeFood(){
  while(true){
    const pos = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) };
    if(!snake.some(s => s.x===pos.x && s.y===pos.y)) { food = pos; break; }
  }
}

function loop(){
  if(!running) return;
  if(paused){ gameLoopId = setTimeout(loop, speed); return; }
  update();
  draw();
  gameLoopId = setTimeout(loop, speed);
}

function update(){
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  // wrap around edges
  head.x = (head.x + COLS) % COLS;
  head.y = (head.y + ROWS) % ROWS;

  // collision with self
  if(snake.some(s => s.x===head.x && s.y===head.y)){
    // game over
    running = false;
    clearTimeout(gameLoopId);
    // update high score
    if(score > highScore){ localStorage.setItem('snakeHigh', score); highScore = score; highScoreEl.textContent = highScore; }
    return;
  }

  snake.unshift(head);

  // eating food
  if(head.x === food.x && head.y === food.y){
    score += 10;
    scoreEl.textContent = score;
    placeFood();
    // speed up slightly
    if(speed > 50) speed -= 2;
  } else {
    snake.pop();
  }
}

function draw(){
  // clear
  ctx.fillStyle = '#071022';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw food
  ctx.fillStyle = '#ef4444';
  roundRect(ctx, food.x*TILE+2, food.y*TILE+2, TILE-4, TILE-4, 6, true, false);

  // draw snake
  for(let i=0;i<snake.length;i++){
    const s = snake[i];
    if(i===0) ctx.fillStyle = '#10b981'; else ctx.fillStyle = '#059669';
    roundRect(ctx, s.x*TILE+2, s.y*TILE+2, TILE-4, TILE-4, 6, true, false);
  }
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke){
  if (typeof stroke === 'undefined') stroke = true;
  if (typeof radius === 'undefined') radius = 5;
  if (typeof radius === 'number') radius = {tl: radius, tr: radius, br: radius, bl: radius};
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if(fill) ctx.fill();
  if(stroke) ctx.stroke();
}

// Controls
window.addEventListener('keydown', (e)=>{
  const key = e.key;
  if(key === ' '){ // space = pause
    paused = !paused;
    if(!paused && running) loop();
    return;
  }
  if(key === 'r' || key === 'R'){
    clearTimeout(gameLoopId);
    resetGame();
    return;
  }
  if(key === 'ArrowUp' || key === 'w' || key === 'W') setDir(0,-1);
  if(key === 'ArrowDown' || key === 's' || key === 'S') setDir(0,1);
  if(key === 'ArrowLeft' || key === 'a' || key === 'A') setDir(-1,0);
  if(key === 'ArrowRight' || key === 'd' || key === 'D') setDir(1,0);
});

function setDir(x,y){
  // prevent 180 turns
  if(dir.x === -x && dir.y === -y) return;
  dir = {x,y};
}

// start
resetGame();