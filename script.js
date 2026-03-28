// ===== MENU SETTINGS =====
let device = "mobile";
let difficulty = "normal";
let gameOver = false;

function setDevice(d) { device = d; }
function setDifficulty(d) { difficulty = d; }

// ===== DOM =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const controls = document.getElementById("controls");

// ===== CANVAS =====
canvas.width = innerWidth;
canvas.height = innerHeight;

// ===== PLAYER =====
const player = {
  x: 200, y: 200, w: 20, h: 40,
  hp: 100, vx: 0, vy: 0
};

// ===== STATE =====
let enemies = [];
let damageTexts = [];
let wave = 1;
let attackTimer = 0;
let shake = 0;

// ===== START BUTTON =====
startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  canvas.style.display = "block";

  if (device === "mobile") controls.style.display = "flex";

  applyDifficulty();
  spawnWave();
});

// ===== DIFFICULTY =====
function applyDifficulty() {
  if (difficulty === "easy") player.hp = 150;
  if (difficulty === "normal") player.hp = 100;
  if (difficulty === "hard") player.hp = 70;
}

// ===== SPAWN =====
function spawnWave() {
  enemies = [];

  let hp = 30, speed = 1.5;

  if (difficulty === "easy") { hp = 20; speed = 1.2; }
  if (difficulty === "hard") { hp = 40; speed = 2; }

  let count = 3 + wave;

  for (let i = 0; i < count; i++) {
    let isBoss = (wave % 10 === 0 && i === 0);

    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      w: 20, h: 40,
      hp: isBoss ? 200 : hp,
      maxHp: isBoss ? 200 : hp,
      speed: isBoss ? 1.2 : speed,
      isBoss,
      attackCooldown: 0,
      dashCooldown: 0,
      phase: 0,
      hitTimer: 0
    });
  }
}

// ===== ATTACK =====
function attack() {
  if (gameOver) return;

  attackTimer = 10;

  enemies.forEach(e => {
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 80) {
      e.hp -= 15;
      e.hitTimer = 5;

      e.x += (dx / dist) * 20;
      e.y += (dy / dist) * 20;

      damageTexts.push({ x:e.x, y:e.y, text:"-15", life:30 });
    }
  });
}

// ===== UPDATE =====
function update() {
  if (gameOver) return;

  player.vx += joyX * 0.02;
  player.vy += joyY * 0.02;
  player.vx *= 0.9;
  player.vy *= 0.9;

  player.x += player.vx;
  player.y += player.vy;

  player.x = Math.max(0, Math.min(canvas.width-player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height-player.h, player.y));

  enemies.forEach(e => {
    let dx = player.x - e.x;
    let dy = player.y - e.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 0) {
      let speed = e.speed;

      if (e.isBoss) {
        e.phase += 0.05;
        speed = 0.6 + Math.sin(Date.now()/200)*0.4;
        e.y += Math.sin(e.phase);

        if (e.dashCooldown <= 0) {
          speed = 6;
          e.dashCooldown = 120;
        }
        e.dashCooldown--;
      }

      e.x += (dx/dist)*speed;
      e.y += (dy/dist)*speed;
    }

    if (dist < 35 && e.attackCooldown <= 0) {
      let dmg = e.isBoss ? 20 : 4;
      player.hp -= dmg;
      shake = 8;

      if (player.hp <= 0) {
        player.hp = 0;
        gameOver = true;
      }

      damageTexts.push({ x:player.x, y:player.y, text:"-"+dmg, life:30 });

      e.attackCooldown = e.isBoss ? 20 : 40;
    }

    if (e.attackCooldown > 0) e.attackCooldown--;
    if (e.hitTimer > 0) e.hitTimer--;
  });

  enemies = enemies.filter(e => e.hp > 0);

  if (enemies.length === 0 && !gameOver) {
    wave++;
    spawnWave();
  }

  damageTexts.forEach(d => { d.y -= 1; d.life--; });
  damageTexts = damageTexts.filter(d => d.life > 0);
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.save();
  ctx.translate(Math.random()*shake-shake/2, Math.random()*shake-shake/2);

  drawStickman(player.x, player.y, player.w, player.h, "white");

  enemies.forEach(e => {
    if (e.isBoss) drawBoss(e);
    else drawStickman(e.x, e.y, e.w, e.h, e.hitTimer ? "white":"red");

    ctx.fillStyle="black";
    ctx.fillRect(e.x, e.y-8, e.w,4);

    ctx.fillStyle=e.isBoss?"purple":"lime";
    ctx.fillRect(e.x, e.y-8,(e.hp/e.maxHp)*e.w,4);
  });

  ctx.restore();
  if (shake>0) shake--;

  ctx.fillStyle="white";
  ctx.fillText("Wave: "+wave,10,20);
  ctx.fillText("HP: "+player.hp,10,40);

  if (gameOver) {
    ctx.font="40px Arial";
    ctx.fillText("GAME OVER", canvas.width/2-140, canvas.height/2);
    ctx.font="20px Arial";
    ctx.fillText("Tap to Restart", canvas.width/2-80, canvas.height/2+40);
  }
}

// ===== DRAW HELPERS =====
function drawStickman(x,y,w,h,color){
  ctx.strokeStyle=color;
  ctx.beginPath();
  ctx.arc(x+w/2,y+10,6,0,Math.PI*2);
  ctx.stroke();
}

function drawBoss(e){
  let cx=e.x+e.w/2, cy=e.y+e.h/2;

  ctx.fillStyle="rgba(180,0,255,0.25)";
  ctx.beginPath();
  ctx.arc(cx,cy,70,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle=e.hitTimer?"white":"purple";
  ctx.beginPath();
  ctx.ellipse(cx,cy,35,50,0,0,Math.PI*2);
  ctx.fill();
}

// ===== LOOP =====
function gameLoop(){
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ===== CONTROLS =====
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const attackBtn = document.getElementById("attackBtn");

let joyX=0, joyY=0;

joystick.addEventListener("touchmove", e=>{
  const rect=joystick.getBoundingClientRect();
  const t=e.touches[0];
  let x=t.clientX-rect.left-50;
  let y=t.clientY-rect.top-50;
  let dist=Math.sqrt(x*x+y*y);
  if(dist>40){x=x/dist*40;y=y/dist*40;}
  joyX=x; joyY=y;
  stick.style.left=50+x-20+"px";
  stick.style.top=50+y-20+"px";
});

joystick.addEventListener("touchend", ()=>{
  joyX=0; joyY=0;
  stick.style.left="30px";
  stick.style.top="30px";
});

canvas.addEventListener("touchstart", ()=>{
  if(gameOver) location.reload();
});

attackBtn.addEventListener("touchstart", attack);

// ===== START =====
gameLoop();