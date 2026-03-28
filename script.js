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
  w: 20,
  h: 40,
  hp: 100
};

// ===== GAME STATE =====
let enemies = [];
let wave = 1;
let attackTimer = 0;
let damageTexts = [];

// ===== SPAWN =====
function spawnWave() {
  enemies = [];

  // 🔥 Boss every 20 waves
  if (wave % 20 === 0) {
    enemies.push({
      x: canvas.width / 2,
      y: 100,
      w: 60,
      h: 80,
      hp: 200,
      maxHp: 200,
      speed: 0.8,
      isBoss: true,
      hitTimer: 0
    });
    return;
  }

  // Normal enemies
  for (let i = 0; i < wave * 2; i++) {
    enemies.push({
      x: Math.random() * (canvas.width - 30),
      y: Math.random() * (canvas.height - 50),
      w: 20,
      h: 40,
      hp: 20,
      maxHp: 20,
      speed: 1.5,
      isBoss: false,
      hitTimer: 0
    });
  }
}

// ===== ATTACK =====
function attack() {
  attackTimer = 10;

  enemies.forEach(enemy => {
    if (
      Math.abs(enemy.x - player.x) < 70 &&
      Math.abs(enemy.y - player.y) < 70
    ) {
      enemy.hp -= 10;
      enemy.hitTimer = 5;

      damageTexts.push({
        x: enemy.x,
        y: enemy.y,
        text: "-10",
        life: 30
      });
    }
  });
}

// ===== UPDATE =====
function update() {
  player.x += joyX * 0.2;
  player.y += joyY * 0.2;

  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  enemies.forEach(e => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      e.x += (dx / dist) * e.speed;
      e.y += (dy / dist) * e.speed;
    }
  });

  enemies = enemies.filter(e => e.hp > 0);

  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }

  damageTexts.forEach(d => {
    d.y -= 1;
    d.life--;
  });

  damageTexts = damageTexts.filter(d => d.life > 0);
}

// ===== DRAW STICKMAN =====
function drawStickman(x, y, isBoss = false) {
  ctx.strokeStyle = isBoss ? "purple" : "white";
  ctx.lineWidth = isBoss ? 4 : 2;

  ctx.beginPath();
  ctx.arc(x, y - 15, isBoss ? 12 : 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y - 5);
  ctx.lineTo(x, y + 20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 10, y + 5);
  ctx.lineTo(x + 10, y + 5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y + 20);
  ctx.lineTo(x - 10, y + 35);
  ctx.moveTo(x, y + 20);
  ctx.lineTo(x + 10, y + 35);
  ctx.stroke();
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  drawStickman(player.x + 10, player.y + 10);

  // Enemies
  enemies.forEach(e => {
    if (e.hitTimer > 0) {
      ctx.globalAlpha = 0.5;
      e.hitTimer--;
    }

    drawStickman(e.x + e.w / 2, e.y + 20, e.isBoss);
    ctx.globalAlpha = 1;

    // Health bar
    ctx.fillStyle = "black";
    ctx.fillRect(e.x, e.y - 10, e.w, 5);

    ctx.fillStyle = e.isBoss ? "purple" : "lime";
    ctx.fillRect(e.x, e.y - 10, (e.hp / e.maxHp) * e.w, 5);
  });

  // Attack effect
  if (attackTimer > 0) {
    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    ctx.arc(
      player.x + 10,
      player.y + 10,
      70,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    attackTimer--;
  }

  // Damage text
  ctx.fillStyle = "yellow";
  ctx.font = "14px Arial";
  damageTexts.forEach(d => {
    ctx.fillText(d.text, d.x, d.y);
  });

  // UI
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Wave: " + wave, 10, 20);
  ctx.fillText("HP: " + player.hp, 10, 45);

  if (wave % 20 === 0 && enemies.length > 0) {
    ctx.fillStyle = "purple";
    ctx.fillText("BOSS WAVE", canvas.width / 2 - 60, 30);
  }
}

// ===== LOOP =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ===== JOYSTICK =====
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

// ===== START =====
spawnWave();
gameLoop();