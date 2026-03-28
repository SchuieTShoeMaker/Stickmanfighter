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

  // 🔥 BOSS EVERY 10 WAVES
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

    if (dist > 0) {
      let speed = e.speed;

      // Boss movement (floaty)
      if (e.isBoss) {
        speed = 1 + Math.sin(Date.now() / 300) * 0.5;
      }

      e.x += (dx / dist) * speed;
      e.y += (dy / dist) * speed;
    }

    // 😈 EXTRA BOSS BEHAVIOR
    if (e.isBoss) {
      // float effect
      e.y += Math.sin(Date.now() / 200) * 0.5;

      // TELEPORT (rare but scary)
      if (Math.random() < 0.002) {
        e.x = player.x + (Math.random() * 100 - 50);
        e.y = player.y + (Math.random() * 100 - 50);
      }
    }

    // 🔥 DAMAGE PLAYER
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

  // Remove dead
  enemies = enemies.filter(e => e.hp > 0);

  // Next wave
  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }

  // Damage text animation
  damageTexts.forEach(d => {
    d.y -= 1;
    d.life--;
  });
  damageTexts = damageTexts.filter(d => d.life > 0);

  // 💀 GAME OVER
  if (player.hp <= 0) {
    alert("Game Over!");
    location.reload();
  }
}

// ===== DRAW STICKMAN =====
function drawStickman(x, y, w, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Head
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 10, 6, 0, Math.PI * 2);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 16);
  ctx.lineTo(x + w / 2, y + 30);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 8, y + 22);
  ctx.lineTo(x + w / 2 + 8, y + 22);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 30);
  ctx.lineTo(x + w / 2 - 6, y + 40);
  ctx.moveTo(x + w / 2, y + 30);
  ctx.lineTo(x + w / 2 + 6, y + 40);
  ctx.stroke();
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🌑 DARK SCREEN ON BOSS WAVE
  if (wave % 10 === 0) {
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Player (flash when hit)
  if (playerHitTimer > 0) {
    drawStickman(player.x, player.y, player.w, player.h, "red");
    playerHitTimer--;
  } else {
    drawStickman(player.x, player.y, player.w, player.h, "white");
  }

  // Enemies
  enemies.forEach(e => {
    if (e.isBoss) {
      // 👻 Purple aura
      ctx.fillStyle = "rgba(150, 0, 200, 0.2)";
      ctx.beginPath();
      ctx.arc(e.x + 20, e.y + 30, 50, 0, Math.PI * 2);
      ctx.fill();

      drawStickman(e.x, e.y, e.w, e.h, "purple");

      // 👁️ Creepy eyes
      ctx.fillStyle = "pink";
      ctx.fillRect(e.x + 10, e.y + 15, 4, 4);
      ctx.fillRect(e.x + 25, e.y + 15, 4, 4);
    } else {
      drawStickman(e.x, e.y, e.w, e.h, "red");
    }

    // Health bar
    ctx.fillStyle = "black";
    ctx.fillRect(e.x, e.y - 8, e.w, 4);

    ctx.fillStyle = e.isBoss ? "purple" : "lime";
    ctx.fillRect(e.x, e.y - 8, (e.hp / e.maxHp) * e.w, 4);
  });

  // Attack effect
  if (attackTimer > 0) {
    ctx.fillStyle = "rgba(255,255,0,0.3)";
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y + 20, 70, 0, Math.PI * 2);
    ctx.fill();
    attackTimer--;
  }

  // Damage numbers
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

  if (wave % 10 === 0) {
    ctx.fillStyle = "purple";
    ctx.font = "24px Arial";
    ctx.fillText("BOSS WAVE", canvas.width / 2 - 70, 40);
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