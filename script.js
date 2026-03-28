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
let damageTexts = [];
let wave = 1;

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

// ===== START =====
function startGame() {
  player = {
    x: 200,
    y: 200,
    w: 20,
    h: 20,
    hp: difficulty === "easy" ? 150 : difficulty === "hard" ? 70 : 100,
    vx: 0,
    vy: 0
  };

  enemies = [];
  damageTexts = [];
  wave = 1;
  score = 0;
  gameOver = false;
  paused = false;

  spawnWave();
}

// ===== SPAWN =====
function spawnWave() {
  enemies = [];

  let count = 3 + wave;

  for (let i = 0; i < count; i++) {
    let isBoss = (wave % 5 === 0 && i === 0);

    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      w: 20,
      h: 20,
      hp: isBoss ? 200 : 30,
      maxHp: isBoss ? 200 : 30,
      speed: isBoss ? 1.2 : 1.5,
      isBoss,
      dashCooldown: 0,
      phase: 0,
      hitTimer: 0,
      attackCooldown: 0
    });
  }
}

// ===== CONTROLS =====
let joyX = 0, joyY = 0;

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

// ===== PC =====
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
      e.hitTimer = 5;
      score += 10;

      damageTexts.push({
        x: e.x,
        y: e.y,
        text: "-15",
        life: 30
      });
    }
  });
}

// ===== UPDATE =====
function update() {
  if (gameOver || paused) return;

  // player movement
  player.vx += joyX * 0.02;
  player.vy += joyY * 0.02;
  player.vx *= 0.9;
  player.vy *= 0.9;

  player.x += player.vx;
  player.y += player.vy;

  // enemies
  enemies.forEach(e => {
    let dx = player.x - e.x;
    let dy = player.y - e.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    let speed = e.speed;

    if (e.isBoss) {
      e.phase += 0.05;
      e.y += Math.sin(e.phase);

      if (e.dashCooldown <= 0) {
        speed = 6;
        e.dashCooldown = 120;
      }
      e.dashCooldown--;
    }

    e.x += (dx / dist) * speed;
    e.y += (dy / dist) * speed;

    // damage player
    if (dist < 30 && e.attackCooldown <= 0) {
      let dmg = e.isBoss ? 20 : 5;
      player.hp -= dmg;

      damageTexts.push({
        x: player.x,
        y: player.y,
        text: "-" + dmg,
        life: 30
      });

      e.attackCooldown = 40;

      if (player.hp <= 0) {
        player.hp = 0;
        gameOver = true;
      }
    }

    if (e.attackCooldown > 0) e.attackCooldown--;
    if (e.hitTimer > 0) e.hitTimer--;
  });

  enemies = enemies.filter(e => e.hp > 0);

  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }

  // damage text
  damageTexts.forEach(d => {
    d.y -= 1;
    d.life--;
  });

  damageTexts = damageTexts.filter(d => d.life > 0);
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // player
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, 20, 20);

  // enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.hitTimer ? "white" : (e.isBoss ? "purple" : "red");
    ctx.fillRect(e.x, e.y, 20, 20);

    // hp bar
    ctx.fillStyle = "black";
    ctx.fillRect(e.x, e.y - 6, 20, 4);

    ctx.fillStyle = e.isBoss ? "purple" : "lime";
    ctx.fillRect(e.x, e.y - 6, (e.hp / e.maxHp) * 20, 4);
  });

  // damage text
  ctx.fillStyle = "white";
  damageTexts.forEach(d => {
    ctx.fillText(d.text, d.x, d.y);
  });

  // UI
  ctx.fillText("HP: " + player.hp, 20, 20);
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

// ===== UI =====
pauseBtn.onclick = () => paused = !paused;
restartBtn.onclick = startGame;