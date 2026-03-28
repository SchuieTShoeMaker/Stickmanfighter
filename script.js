// 🔥 HARD STOP iPAD ZOOM
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("gesturechange", e => e.preventDefault());
document.addEventListener("gestureend", e => e.preventDefault());

let lastTouch = 0;
document.addEventListener("touchend", function (e) {
  let now = new Date().getTime();
  if (now - lastTouch <= 300) {
    e.preventDefault();
  }
  lastTouch = now;
}, false);

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

    if (e.isBoss) {
      e.y += Math.sin(Date.now() / 200) * 0.5;

      if (Math.random() < 0.002) {
        e.x = player.x + (Math.random() * 100 - 50);
        e.y = player.y + (Math.random() * 100 - 50);
      }
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

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  enemies.forEach(e => {
    ctx.fillStyle = e.isBoss ? "purple" : "red";
    ctx.fillRect(e.x, e.y, e.w, e.h);
  });

  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "white";
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