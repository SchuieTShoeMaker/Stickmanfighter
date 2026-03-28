// ===== CANVAS =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.6;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const ground = () => canvas.height - 50;

// ===== PLAYER =====
const player = {
  x: 100,
  y: 100,
  w: 20,
  h: 40,
  hp: 100,
  vx: 0,
  vy: 0,
  speed: 3,
  jump: 10,
  onGround: false
};

let playerHitTimer = 0;

// 💥 SCREEN SHAKE
let shake = 0;

// ===== GAME STATE =====
let enemies = [];
let wave = 1;
let attackTimer = 0;

let money = 0;
let playerDamage = 15;
let playerArmor = 0;
let hasPoison = false;

// ===== INPUT =====
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// MOBILE
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const attackBtn = document.getElementById("attackBtn");
const jumpBtn = document.getElementById("jumpBtn");

let joyX = 0;

// ===== SPAWN =====
function spawnWave() {
  enemies = [];

  if (wave % 5 === 0) {
    enemies.push({
      x: canvas.width / 2,
      w: 60,
      h: 100,
      hp: 300,
      maxHp: 300,
      speed: 1,
      isBoss: true,
      stage: 1,
      poison: 0,
      dead: false,
      attackCooldown: 0,
      attackAnim: 0
    });
    return;
  }

  for (let i = 0; i < wave * 2; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      w: 20,
      h: 40,
      hp: 30,
      maxHp: 30,
      speed: 1.5,
      isBoss: false,
      poison: 0,
      dead: false,
      attackCooldown: 0,
      attackAnim: 0
    });
  }
}

// ===== ATTACK =====
function attack() {
  attackTimer = 10;

  enemies.forEach(e => {
    const dist = Math.abs(e.x - player.x);

    if (dist < 60) {
      e.hp -= playerDamage;

      if (hasPoison) {
        e.poison = 60;
      }
    }
  });
}

// ===== SHOP =====
function buyDamage() {
  if (money >= 50) {
    money -= 50;
    playerDamage += 5;
  }
}

function buyArmor() {
  if (money >= 100) {
    money -= 100;
    playerArmor += 1;
  }
}

function buyPoison() {
  if (money >= 150 && !hasPoison) {
    money -= 150;
    hasPoison = true;
  }
}

// ===== UPDATE =====
function update() {
  // ---- MOVEMENT ----
  player.vx = 0;

  if (keys["ArrowLeft"] || keys["a"]) player.vx = -player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.vx = player.speed;

  player.vx += joyX * 0.05;
  player.x += player.vx;

  // 🛑 SCREEN LIMIT
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.w) player.x = canvas.width - player.w;

  // ---- GRAVITY ----
  player.vy += 0.5;
  player.y += player.vy;

  if (player.y + player.h > ground()) {
    player.y = ground() - player.h;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  // ---- JUMP ----
  if ((keys["ArrowUp"] || keys["w"]) && player.onGround) {
    player.vy = -player.jump;
  }

  // ---- ENEMIES ----
  enemies.forEach(e => {
    e.y = ground() - e.h;

    // 👹 BOSS STAGES
    if (e.isBoss) {
      let hpPercent = e.hp / e.maxHp;

      if (hpPercent < 0.66 && e.stage === 1) {
        e.stage = 2;
        e.speed = 2;
      }

      if (hpPercent < 0.33 && e.stage === 2) {
        e.stage = 3;
        e.speed = 3;
      }
    }

    // movement
    if (e.x < player.x) e.x += e.speed;
    else e.x -= e.speed;

    // 💥 ATTACK
    if (Math.abs(e.x - player.x) < 20 && e.attackCooldown <= 0) {
      let damage = e.isBoss ? (e.stage === 3 ? 20 : 12) : 2;

      damage -= playerArmor;
      if (damage < 0) damage = 0;

      player.hp -= damage;
      playerHitTimer = 10;

      // 💥 KNOCKBACK
      let dir = player.x > e.x ? 1 : -1;
      player.vx += dir * (e.isBoss ? 8 : 4);

      // 📳 SCREEN SHAKE
      shake = e.isBoss ? 15 : 8;

      // animation
      e.attackAnim = 10;

      e.attackCooldown = e.isBoss ? 40 : 25;
    }

    if (e.attackCooldown > 0) e.attackCooldown--;
    if (e.attackAnim > 0) e.attackAnim--;

    // poison
    if (e.poison > 0) {
      e.hp -= 0.3;
      e.poison--;
    }

    // money
    if (e.hp <= 0 && !e.dead) {
      money += e.isBoss ? 50 : 10;
      e.dead = true;
    }
  });

  // remove dead
  enemies = enemies.filter(e => e.hp > 0);

  // next wave
  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }

  // game over
  if (player.hp <= 0) {
    alert("Game Over");
    location.reload();
  }
}

// ===== DRAW STICKMAN =====
function drawStickman(x, y, w, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(x + w/2, y + 10, 6, 0, Math.PI*2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w/2, y + 16);
  ctx.lineTo(x + w/2, y + 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w/2 - 8, y + 22);
  ctx.lineTo(x + w/2 + 8, y + 22);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w/2, y + 30);
  ctx.lineTo(x + w/2 - 6, y + 40);
  ctx.moveTo(x + w/2, y + 30);
  ctx.lineTo(x + w/2 + 6, y + 40);
  ctx.stroke();
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 📳 APPLY SCREEN SHAKE
  let shakeX = (Math.random() - 0.5) * shake;
  let shakeY = (Math.random() - 0.5) * shake;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  if (shake > 0) shake--;

  // ground
  ctx.fillStyle = "#222";
  ctx.fillRect(0, ground(), canvas.width, 50);

  // player
  drawStickman(
    player.x,
    player.y,
    player.w,
    player.h,
    playerHitTimer > 0 ? "red" : "white"
  );
  if (playerHitTimer > 0) playerHitTimer--;

  // enemies
  enemies.forEach(e => {
    let drawX = e.x;

    if (e.attackAnim > 0) {
      let dir = player.x > e.x ? 1 : -1;
      drawX += dir * (e.isBoss ? 10 : 5);
    }

    if (e.isBoss) {
      let color = e.stage === 1 ? "purple" :
                  e.stage === 2 ? "magenta" : "red";

      ctx.fillStyle = "rgba(150,0,200,0.2)";
      ctx.beginPath();
      ctx.arc(drawX + 30, e.y + 40, 60, 0, Math.PI*2);
      ctx.fill();

      drawStickman(drawX, e.y, e.w, e.h, color);
    } else {
      drawStickman(drawX, e.y, e.w, e.h, "red");
    }
  });

  ctx.restore();

  // UI (no shake)
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Wave: " + wave, 10, 20);
  ctx.fillText("HP: " + player.hp, 10, 40);
  ctx.fillText("Money: $" + money, 10, 60);
  ctx.fillText("Damage: " + playerDamage, 10, 80);
  ctx.fillText("Armor: " + playerArmor, 10, 100);
}

// ===== LOOP =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ===== MOBILE CONTROLS =====
joystick.addEventListener("touchmove", e => {
  e.preventDefault();
  const rect = joystick.getBoundingClientRect();
  const touch = e.touches[0];

  let x = touch.clientX - rect.left - 50;
  joyX = Math.max(-40, Math.min(40, x));

  stick.style.left = 50 + joyX - 20 + "px";
}, { passive: false });

joystick.addEventListener("touchend", () => {
  joyX = 0;
  stick.style.left = "30px";
});

attackBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  attack();
}, { passive: false });

jumpBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  if (player.onGround) player.vy = -player.jump;
}, { passive: false });

// PC attack
document.addEventListener("keydown", e => {
  if (e.key === " ") attack();
});

// ===== START =====
spawnWave();
gameLoop();