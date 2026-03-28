// ===== CANVAS SETUP =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.6;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===== PLAYER =====
const player = {
  x: 100,
  y: 200,
  w: 40,
  h: 60,
  hp: 100
};

// ===== GAME STATE =====
let enemies = [];
let wave = 1;

let attackTimer = 0;
let attackCooldown = 0;

let damageTexts = [];

// ===== SPAWN ENEMIES =====
function spawnWave() {
  enemies = [];

  for (let i = 0; i < wave * 2; i++) {
    enemies.push({
      x: Math.random() * (canvas.width - 30),
      y: Math.random() * (canvas.height - 50),
      w: 30,
      h: 50,
      hp: 20,
      hitTimer: 0
    });
  }
}

// ===== ATTACK =====
function attack() {
  if (attackCooldown > 0) return;

  attackTimer = 10;
  attackCooldown = 20;

  enemies.forEach(enemy => {
    if (
      Math.abs(enemy.x - player.x) < 60 &&
      Math.abs(enemy.y - player.y) < 60
    ) {
      enemy.hp -= 10;
      enemy.hitTimer = 5;

      damageTexts.push({
        x: enemy.x + enemy.w / 2,
        y: enemy.y,
        text: "-10",
        life: 30
      });
    }
  });
}

// ===== UPDATE =====
function update() {
  // Player movement
  player.x += joyX * 0.2;
  player.y += joyY * 0.2;

  // Clamp player inside screen
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  // Enemy movement (smooth)
  enemies.forEach(e => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const speed = 1.5;
      e.x += (dx / dist) * speed;
      e.y += (dy / dist) * speed;
    }
  });

  // Remove dead enemies
  enemies = enemies.filter(e => e.hp > 0);

  // Next wave
  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }

  // Attack cooldown
  if (attackCooldown > 0) attackCooldown--;

  // Damage text animation
  damageTexts.forEach(d => {
    d.y -= 1;
    d.life--;
  });
  damageTexts = damageTexts.filter(d => d.life > 0);
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Enemies
  enemies.forEach(e => {
    // Hit flash
    if (e.hitTimer > 0) {
      ctx.fillStyle = "white";
      e.hitTimer--;
    } else {
      ctx.fillStyle = "red";
    }

    ctx.fillRect(e.x, e.y, e.w, e.h);

    // Health bar background
    ctx.fillStyle = "black";
    ctx.fillRect(e.x, e.y - 8, e.w, 5);

    // Health bar fill
    ctx.fillStyle = "lime";
    ctx.fillRect(e.x, e.y - 8, (e.hp / 20) * e.w, 5);
  });

  // Attack effect
  if (attackTimer > 0) {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(
      player.x + player.w / 2,
      player.y + player.h / 2,
      60,
      0,
      Math.PI * 2
    );
    ctx.fill();

    attackTimer--;
  }

  // Damage numbers
  ctx.fillStyle = "yellow";
  ctx.font = "16px Arial";
  damageTexts.forEach(d => {
    ctx.fillText(d.text, d.x, d.y);
  });

  // UI
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Wave: ${wave}`, 10, 20);
  ctx.fillText(`HP: ${player.hp}`, 10, 45);
}

// ===== GAME LOOP =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ===== JOYSTICK CONTROLS =====
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const attackBtn = document.getElementById("attackBtn");

let joyX = 0;
let joyY = 0;

joystick.addEventListener("touchmove", e => {
  const rect = joystick.getBoundingClientRect();
  const touch = e.touches[0];

  let x = touch.clientX - rect.left - 50;
  let y = touch.clientY - rect.top - 50;

  const dist = Math.sqrt(x * x + y * y);

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
  joyX = 0;
  joyY = 0;

  stick.style.left = "30px";
  stick.style.top = "30px";
});

// Attack button
attackBtn.addEventListener("touchstart", attack);

// ===== START GAME =====
spawnWave();
gameLoop();