// ===== SETUP =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== PLAYER =====
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 20,
  hp: 100
};

// ===== GAME STATE =====
let enemies = [];
let wave = 1;
let gameOver = false;
let attackCooldown = 0;

// ===== SPAWN ENEMIES =====
function spawnWave() {
  enemies = [];

  for (let i = 0; i < wave * 3; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20,
      hp: 30
    });
  }
}

// ===== ATTACK =====
function attack() {
  if (attackCooldown > 0) return;

  attackCooldown = 20;

  enemies.forEach(e => {
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 80) {
      e.hp -= 20;

      // knockback
      e.x += dx * 0.5;
      e.y += dy * 0.5;
    }
  });
}

// ===== UPDATE =====
function update() {
  if (gameOver) return;

  if (attackCooldown > 0) attackCooldown--;

  enemies.forEach(e => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.hypot(dx, dy);

    // move toward player
    e.x += dx * 0.01;
    e.y += dy * 0.01;

    // damage player
    if (dist < 20) {
      player.hp -= 0.2;

      if (player.hp <= 0) {
        gameOver = true;
      }
    }
  });

  // remove dead enemies
  enemies = enemies.filter(e => e.hp > 0);

  // next wave
  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }
}

// ===== DRAW =====
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // player
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // enemies
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, e.size, e.size);
  });

  // UI
  ctx.fillStyle = "white";
  ctx.fillText("HP: " + Math.floor(player.hp), 20, 30);
  ctx.fillText("Wave: " + wave, 20, 60);

  if (gameOver) {
    ctx.fillText("GAME OVER - TAP TO RESTART", canvas.width / 2 - 120, canvas.height / 2);
  }
}

// ===== GAME LOOP =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ===== INPUT =====
canvas.addEventListener("touchstart", () => {
  if (gameOver) {
    location.reload();
  } else {
    attack();
  }
});

// ===== START =====
spawnWave();
gameLoop();