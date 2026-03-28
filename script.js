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

// ===== GAME STATE =====
let enemies = [];
let wave = 1;
let attackTimer = 0;
let money = 0; // 💰 NEW

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

  if (wave % 10 === 0) {
    enemies.push({
      x: canvas.width / 2,
      w: 60,
      h: 100,
      hp: 300,
      maxHp: 300,
      speed: 1,
      isBoss: true
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
      isBoss: false
    });
  }
}

// ===== ATTACK =====
function attack() {
  attackTimer = 10;

  enemies.forEach(e => {
    const dist = Math.abs(e.x - player.x);

    if (dist < 60) {
      e.hp -= 15;
    }
  });
}

// ===== UPDATE =====
function update() {
  // ---- MOVEMENT ----
  player.vx = 0;

  if (keys["ArrowLeft"] || keys["a"]) player.vx = -player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.vx = player.speed;

  player.vx += joyX * 0.05;
  player.x += player.vx;

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

    if (e.x < player.x) e.x += e.speed;
    else e.x -= e.speed;

    if (Math.abs(e.x - player.x) < 20) {
      player.hp -= e.isBoss ? 10 : 2;
      playerHitTimer = 10;
    }
  });

  // 💰 REMOVE DEAD + GIVE MONEY
  enemies = enemies.filter(e => {
    if (e.hp <= 0) {
      money += e.isBoss ? 100 : 10;
      return false;
    }
    return true;
  });

  // NEXT WAVE
  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }

  // GAME OVER
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
    if (e.isBoss) {
      ctx.fillStyle = "rgba(150,0,200,0.2)";
      ctx.beginPath();
      ctx.arc(e.x + 30, e.y + 40, 60, 0, Math.PI*2);
      ctx.fill();

      drawStickman(e.x, e.y, e.w, e.h, "purple");
    } else {
      drawStickman(e.x, e.y, e.w, e.h, "red");
    }
  });

  // UI
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Wave: " + wave, 10, 20);
  ctx.fillText("HP: " + player.hp, 10, 40);
  ctx.fillText("Money: $" + money, 10, 60); // 💰 NEW
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