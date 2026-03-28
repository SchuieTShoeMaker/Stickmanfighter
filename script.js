// ===== SETTINGS =====
let device = "mobile";
let difficulty = "normal";
let gameOver = false;
let paused = false;
let score = 0;

// ===== DOM =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const controls = document.getElementById("controls");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

// ===== CANVAS =====
canvas.width = innerWidth;
canvas.height = innerHeight;

// ===== PLAYER =====
let player;

// ===== GAME STATE =====
let enemies = [];
let wave = 1;
let attackTimer = 0;
let shake = 0;

// ===== MENU =====
function setDevice(d) { device = d; }
function setDifficulty(d) { difficulty = d; }

startBtn.onclick = () => {
  menu.style.display = "none";
  canvas.style.display = "block";

  if (device === "mobile") {
    controls.style.display = "flex";
  }

  startGame();
};

// ===== START / RESET =====
function startGame() {
  player = {
    x: 200,
    y: 200,
    hp: difficulty === "easy" ? 150 : difficulty === "hard" ? 70 : 100,
    vx: 0,
    vy: 0
  };

  enemies = [];
  wave = 1;
  score = 0;
  gameOver = false;
  paused = false;

  spawnWave();
}

// ===== SPAWN =====
function spawnWave() {
  for (let i = 0; i < 3 + wave; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      hp: difficulty === "hard" ? 40 : 25,
      speed: difficulty === "easy" ? 1.2 : difficulty === "hard" ? 2 : 1.5
    });
  }
}

// ===== CONTROLS =====
let joyX = 0;
let joyY = 0;

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const attackBtn = document.getElementById("attackBtn");

joystick.addEventListener("touchmove", e => {
  const rect = joystick.getBoundingClientRect();
  const touch = e.touches[0];

  let x = touch.clientX - rect.left - 50;
  let y = touch.clientY - rect.top - 50;

  let dist = Math.sqrt(x*x + y*y);
  if (dist > 40) {
    x = (x / dist) * 40;
    y = (y / dist) * 40;
  }

  joyX = x;
  joyY = y;

  stick.style.left = 50 + x - 20 + "px";
  stick.style.top = 50 + y - 20 + "px";
});

joystick.addEventListener("touchend", () => {
  joyX = joyY = 0;
  stick.style.left = "30px";
  stick.style.top = "30px";
});

attackBtn.addEventListener("touchstart", attack);

// ===== PC CONTROLS =====
window.addEventListener("keydown", e => {
  if (e.key === " ") attack();
});

// ===== ATTACK =====
function attack() {
  if (gameOver) return;

  enemies.forEach(e => {
    let dx = e.x - player.x;
    let dy = e.y - player.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 80) {
      e.hp -= 15;
      score += 10;
    }
  });
}

// ===== UPDATE =====
function update() {
  if (gameOver || paused) return;

  player.vx += joyX * 0.02;
  player.vy += joyY * 0.02;
  player.vx *= 0.9;
  player.vy *= 0.9;

  player.x += player.vx;
  player.y += player.vy;

  enemies.forEach(e => {
    let dx = player.x - e.x;
    let dy = player.y - e.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    e.x += (dx / dist) * e.speed;
    e.y += (dy / dist) * e.speed;

    if (dist < 30) {
      player.hp -= 0.5;
      if (player.hp <= 0) {
        gameOver = true;
      }
    }
  });

  enemies = enemies.filter(e => e.hp > 0);

  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // player
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, 20, 20);

  // enemies
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, 20, 20);
  });

  // UI
  ctx.fillText("HP: " + Math.floor(player.hp), 20, 20);
  ctx.fillText("Wave: " + wave, 20, 40);
  ctx.fillText("Score: " + score, 20, 60);

  if (paused) {
    ctx.fillText("PAUSED", canvas.width/2 - 40, canvas.height/2);
  }

  if (gameOver) {
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width/2 - 120, canvas.height/2);
  }
}

// ===== LOOP =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();

// ===== UI BUTTONS =====
pauseBtn.onclick = () => paused = !paused;
restartBtn.onclick = startGame;