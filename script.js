// 🔥 NUCLEAR ZOOM FIX
document.addEventListener("touchstart", e => {
  e.preventDefault();
}, { passive: false });

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

let playerHitTimer = 0;

// ===== GAME STATE =====
let enemies = [];
let wave = 1;
let attackTimer = 0;
let damageTexts = [];

// ===== SPAWN =====
function spawnWave() {
  enemies = [];

  if (wave % 10 === 0) {
    enemies.push({
      x: canvas.width / 2,
      y: canvas.height / 3,
      w: 60,
      h: 100,
      hp: 300,
      maxHp: 300,
      speed: 1,
      isBoss: true,
      attackCooldown: 0
    });
    return;
  }

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
  player.x += joyX * 0.2;
  player.y += joyY * 0.2;

  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  enemies.forEach(e => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      let speed = e.speed;

      if (e.isBoss) {
        speed = 1 + Math.sin(Date.now() / 300) * 0.5;
      }

      e.x += (dx / dist) * speed;
      e.y += (dy / dist) * speed;
    }

    if (dist < 30) {
      if (e.attackCooldown <= 0) {
        let dmg = e.isBoss ? 10 : 3;

        player.hp -= dmg;
        playerHitTimer = 10;

        damageTexts.push({
          x: player.x,
          y: player.y,
          text: "-" + dmg,
          life: 30
        });

        e.attackCooldown = 30;
      }
    }

    if (e.attackCooldown > 0) e.attackCooldown--;
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

  if (player.hp <= 0) {
    alert("Game Over!");
    location.reload();
  }
}

// ===== 🔥 STICKMAN DRAW FUNCTION =====
function drawStickman(x, y, w, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // head
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 8, 6, 0, Math.PI * 2);
  ctx.stroke();

  // body
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 14);
  ctx.lineTo(x + w / 2, y + 28);
  ctx.stroke();

  // arms
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 8, y + 20);
  ctx.lineTo(x + w / 2 + 8, y + 20);
  ctx.stroke();

  // legs
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 28);
  ctx.lineTo(x + w / 2 - 6, y + 40);
  ctx.moveTo(x + w / 2, y + 28);
  ctx.lineTo(x + w / 2 + 6, y + 40);
  ctx.stroke();
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🌑 DARK SCREEN ON BOSS WAVE
  if (wave % 10 === 0) {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // PLAYER (flash when hit)
  if (playerHitTimer > 0) {
    drawStickman(player.x, player.y, player.w, player.h, "red");
    playerHitTimer--;
  } else {
    drawStickman(player.x, player.y, player.w, player.h, "white");
  }

  // ENEMIES
  enemies.forEach(e => {

    if (e.isBoss) {
      // 👻 PULSING AURA
      let pulse = Math.sin(Date.now() / 200) * 10 + 50;

      ctx.fillStyle = "rgba(150, 0, 200, 0.25)";
      ctx.beginPath();
      ctx.arc(e.x + 20, e.y + 30, pulse, 0, Math.PI * 2);
      ctx.fill();

      // 🌫️ EXTRA SHADOW LAYER
      ctx.fillStyle = "rgba(80, 0, 120, 0.2)";
      ctx.beginPath();
      ctx.arc(e.x + 20, e.y + 30, pulse + 15, 0, Math.PI * 2);
      ctx.fill();

      // 😈 SLIGHT JITTER (creepy movement)
      let jitterX = (Math.random() - 0.5) * 2;
      let jitterY = (Math.random() - 0.5) * 2;

      drawStickman(
        e.x + jitterX,
        e.y + jitterY,
        e.w,
        e.h,
        "purple"
      );

      // 👁️ GLOWING EYES
      ctx.fillStyle = "pink";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "pink";

      ctx.fillRect(e.x + 12, e.y + 15, 4, 4);
      ctx.fillRect(e.x + 26, e.y + 15, 4, 4);

      ctx.shadowBlur = 0;
    } 
    else {
      drawStickman(e.x, e.y, e.w, e.h, "red");
    }

    // HEALTH BAR
    ctx.fillStyle = "black";
    ctx.fillRect(e.x, e.y - 8, e.w, 4);

    ctx.fillStyle = e.isBoss ? "purple" : "lime";
    ctx.fillRect(e.x, e.y - 8, (e.hp / e.maxHp) * e.w, 4);
  });

  // ATTACK EFFECT
  if (attackTimer > 0) {
    ctx.fillStyle = "rgba(255,255,0,0.3)";
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y + 20, 70, 0, Math.PI * 2);
    ctx.fill();
    attackTimer--;
  }

  // DAMAGE TEXT
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

  // BOSS TEXT
  if (wave % 10 === 0) {
    ctx.fillStyle = "purple";
    ctx.font = "24px Arial";
    ctx.fillText("BOSS WAVE", canvas.width / 2 - 80, 40);
  }
  // enemies
  enemies.forEach(e => {
    if (e.isBoss) {
      // aura
      ctx.fillStyle = "rgba(150,0,200,0.2)";
      ctx.beginPath();
      ctx.arc(e.x + 20, e.y + 30, 50, 0, Math.PI * 2);
      ctx.fill();

      drawStickman(e.x, e.y, e.w, e.h, "purple");
    } else {
      drawStickman(e.x, e.y, e.w, e.h, "red");
    }

    // health bar
    ctx.fillStyle = "black";
    ctx.fillRect(e.x, e.y - 8, e.w, 4);

    ctx.fillStyle = e.isBoss ? "purple" : "lime";
    ctx.fillRect(e.x, e.y - 8, (e.hp / e.maxHp) * e.w, 4);
  });

  // attack effect
  if (attackTimer > 0) {
    ctx.fillStyle = "rgba(255,255,0,0.3)";
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y + 20, 70, 0, Math.PI * 2);
    ctx.fill();
    attackTimer--;
  }

  // UI
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Wave: " + wave, 10, 20);
  ctx.fillText("HP: " + player.hp, 10, 40);
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
  e.preventDefault();

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
}, { passive: false });

joystick.addEventListener("touchend", () => {
  joyX = 0;
  joyY = 0;
  stick.style.left = "30px";
  stick.style.top = "30px";
});

attackBtn.addEventListener("touchstart", function(e) {
  e.preventDefault();
  attack();
}, { passive: false });

// ===== START =====
spawnWave();
gameLoop();