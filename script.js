// ===== SETUP =====
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
  hp: 100,
  maxHp: 100
};

// ===== GAME STATE =====
let enemies = [];
let wave = 1;
let attackTimer = 0;
let damageTexts = [];

// ===== SPAWN =====
function spawnWave() {
  enemies = [];

  // 🔥 BOSS EVERY 10 WAVES
  if (wave % 10 === 0) {
    enemies.push({
      x: canvas.width / 2,
      y: canvas.height / 3,
      w: 80,
      h: 120,
      hp: 500,
      maxHp: 500,
      speed: 0.8,
      isBoss: true,
      attackCooldown: 0,
      dashCooldown: 60,
      phase: 0
    });
    return;
  }

  // NORMAL ENEMIES
  for (let i = 0; i < wave * 2; i++) {
    enemies.push({
      x: Math.random() * (canvas.width - 30),
      y: Math.random() * (canvas.height - 50),
      w: 20,
      h: 40,
      hp: 30,
      maxHp: 30,
      speed: 1.5,
      isBoss: false,
      attackCooldown: 0
    });
  }
}

// ===== ATTACK =====
function attack() {
  attackTimer = 10;

  enemies.forEach(enemy => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 70) {
      enemy.hp -= 15;

      damageTexts.push({
        x: enemy.x,
        y: enemy.y,
        text: "-15",
        life: 30
      });
    }
  });
}

// ===== UPDATE =====
function update() {
  // Movement
  player.x += joyX * 0.2;
  player.y += joyY * 0.2;

  // Boundaries
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  enemies.forEach(e => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Movement
    if (dist > 0) {
      let speed = e.speed;

      if (e.isBoss) {
        e.phase += 0.05;

        // Floaty movement
        speed = 0.6 + Math.sin(Date.now() / 200) * 0.4;
        e.y += Math.sin(e.phase) * 1;

        // 🔥 DASH ATTACK
        if (e.dashCooldown <= 0) {
          speed = 6; // big lunge
          e.dashCooldown = 120;
        }

        e.dashCooldown--;
      }

      e.x += (dx / dist) * speed;
      e.y += (dy / dist) * speed;
    }

    // DAMAGE PLAYER
    if (dist < 35) {
      if (e.attackCooldown <= 0) {
        let dmg = e.isBoss ? 20 : 4;

        player.hp -= dmg;

        // 🔥 FIX negative HP
        if (player.hp < 0) player.hp = 0;

        damageTexts.push({
          x: player.x,
          y: player.y,
          text: "-" + dmg,
          life: 30
        });

        e.attackCooldown = e.isBoss ? 20 : 40;
      }
    }

    if (e.attackCooldown > 0) e.attackCooldown--;
  });

  // Remove dead
  enemies = enemies.filter(e => e.hp > 0);

  // Next wave
  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }

  // Damage text
  damageTexts.forEach(d => {
    d.y -= 1;
    d.life--;
  });
  damageTexts = damageTexts.filter(d => d.life > 0);
}

// ===== DRAW STICKMAN =====
function drawStickman(x, y, w, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(x + w / 2, y + 10, 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 16);
  ctx.lineTo(x + w / 2, y + 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 8, y + 22);
  ctx.lineTo(x + w / 2 + 8, y + 22);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 30);
  ctx.lineTo(x + w / 2 - 6, y + 40);
  ctx.moveTo(x + w / 2, y + 30);
  ctx.lineTo(x + w / 2 + 6, y + 40);
  ctx.stroke();
}

// ===== 🔥 CATNAP BOSS DRAW =====
function drawBoss(e) {
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;

  // Aura
  ctx.fillStyle = "rgba(180, 0, 255, 0.25)";
  ctx.beginPath();
  ctx.arc(cx, cy, 70 + Math.sin(Date.now()/150)*10, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = "#7a00cc";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 35, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.moveTo(cx - 25, cy - 40);
  ctx.lineTo(cx - 10, cy - 70);
  ctx.lineTo(cx - 5, cy - 40);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + 25, cy - 40);
  ctx.lineTo(cx + 10, cy - 70);
  ctx.lineTo(cx + 5, cy - 40);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(cx - 10, cy - 10, 6, 0, Math.PI * 2);
  ctx.arc(cx + 10, cy - 10, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(cx - 10, cy - 10, 2, 0, Math.PI * 2);
  ctx.arc(cx + 10, cy - 10, 2, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.arc(cx, cy + 10, 12, 0, Math.PI);
  ctx.stroke();

  // Tentacles
  ctx.strokeStyle = "#a020f0";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.sin(Date.now()/200 + i) * 50,
      cy + Math.cos(Date.now()/200 + i) * 50
    );
    ctx.stroke();
  }
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  drawStickman(player.x, player.y, player.w, player.h, "white");

  // Enemies
  enemies.forEach(e => {
    if (e.isBoss) {
      drawBoss(e);
    } else {
      drawStickman(e.x, e.y, e.w, e.h, "red");
    }

    // Health bar
    ctx.fillStyle = "black";
    ctx.fillRect(e.x, e.y - 8, e.w, 4);

    ctx.fillStyle = e.isBoss ? "purple" : "lime";
    ctx.fillRect(e.x, e.y - 8, (e.hp / e.maxHp) * e.w, 4);
  });

  // Attack circle
  if (attackTimer > 0) {
    ctx.fillStyle = "rgba(255,255,0,0.3)";
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y + 20, 70, 0, Math.PI * 2);
    ctx.fill();
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
  ctx.font = "18px Arial";
  ctx.fillText("Wave: " + wave, 10, 20);
  ctx.fillText("HP: " + player.hp, 10, 40);

  // Boss text
  if (wave % 10 === 0) {
    ctx.fillStyle = "purple";
    ctx.font = "24px Arial";
    ctx.fillText("BOSS WAVE", canvas.width / 2 - 80, 40);
  }
}

// ===== LOOP =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ===== CONTROLS =====
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

attackBtn.addEventListener("touchstart", attack);

// ===== START =====
spawnWave();
gameLoop();