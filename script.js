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
  onGround: false,
  walkAnim: 0,
  attackAnim: 0
};

let playerHitTimer = 0;
let shake = 0;

// ===== GAME STATE =====
let enemies = [];
let wave = 1;

let money = 0;
let playerDamage = 15;
let playerArmor = 0;
let hasPoison = false;

// SHOP + WEAPONS
let inShop = false;
let weapon = "sword";
let attackCooldownMax = 20;
let attackCooldown = 0;

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
      attackAnim: 0,
      walkAnim: 0
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
      attackAnim: 0,
      walkAnim: 0
    });
  }
}

// ===== ATTACK =====
function attack() {
  if (attackCooldown > 0) return;

  player.attackAnim = 10;
  attackCooldown = attackCooldownMax;

  enemies.forEach(e => {
    const dist = Math.abs(e.x - player.x);

    if (dist < 60) {
      e.hp -= playerDamage;

      if (hasPoison) e.poison = 60;
    }
  });
}

// ===== WEAPONS =====
function setWeapon(type) {
  weapon = type;

  if (type === "sword") {
    playerDamage = 15;
    attackCooldownMax = 20;
  }

  if (type === "dagger") {
    playerDamage = 8;
    attackCooldownMax = 8;
  }

  if (type === "hammer") {
    playerDamage = 30;
    attackCooldownMax = 40;
  }
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

function continueGame() {
  inShop = false;
  wave++;
  spawnWave();
  document.getElementById("shop").style.display = "none";
}

// ===== UPDATE =====
function update() {
  if (inShop) return;

  if (attackCooldown > 0) attackCooldown--;

  player.vx = 0;

  if (keys["ArrowLeft"] || keys["a"]) player.vx = -player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.vx = player.speed;

  player.vx += joyX * 0.05;
  player.x += player.vx;

  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.w) player.x = canvas.width - player.w;

  if (Math.abs(player.vx) > 0.1) player.walkAnim += 0.2;

  player.vy += 0.5;
  player.y += player.vy;

  if (player.y + player.h > ground()) {
    player.y = ground() - player.h;
    player.vy = 0;
    player.onGround = true;
  } else player.onGround = false;

  if ((keys["ArrowUp"] || keys["w"]) && player.onGround) {
    player.vy = -player.jump;
  }

  enemies.forEach(e => {
    e.y = ground() - e.h;
    e.walkAnim += 0.15;

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

    if (e.x < player.x) e.x += e.speed;
    else e.x -= e.speed;

    if (Math.abs(e.x - player.x) < 20 && e.attackCooldown <= 0) {
      let damage = e.isBoss ? (e.stage === 3 ? 20 : 12) : 2;

      damage -= playerArmor;
      if (damage < 0) damage = 0;

      player.hp -= damage;
      playerHitTimer = 10;

      let dir = player.x > e.x ? 1 : -1;
      player.vx += dir * (e.isBoss ? 8 : 4);

      shake = e.isBoss ? 15 : 8;

      e.attackAnim = 10;
      e.attackCooldown = e.isBoss ? 40 : 25;
    }

    if (e.attackCooldown > 0) e.attackCooldown--;
    if (e.attackAnim > 0) e.attackAnim--;

    if (e.poison > 0) {
      e.hp -= 0.3;
      e.poison--;
    }

    if (e.hp <= 0 && !e.dead) {
      money += e.isBoss ? 50 : 10;
      e.dead = true;
    }
  });

  enemies = enemies.filter(e => e.hp > 0);

  if (enemies.length === 0 && !inShop) {
    inShop = true;
    document.getElementById("shop").style.display = "block";
    document.getElementById("shopMoney").innerText = money;
  }

  if (player.hp <= 0) {
    alert("Game Over");
    location.reload();
  }
}

// ===== DRAW STICKMAN =====
function drawStickman(x, y, w, h, color, walk, attack) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  let swing = Math.sin(walk) * 6;

  ctx.beginPath();
  ctx.arc(x + w/2, y + 10, 6, 0, Math.PI*2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w/2, y + 16);
  ctx.lineTo(x + w/2, y + 30);
  ctx.stroke();

  let armOffset = attack > 0 ? 10 : swing;

  ctx.beginPath();
  ctx.moveTo(x + w/2, y + 22);
  ctx.lineTo(x + w/2 + armOffset, y + 22);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w/2, y + 30);
  ctx.lineTo(x + w/2 - swing, y + 40);
  ctx.moveTo(x + w/2, y + 30);
  ctx.lineTo(x + w/2 + swing, y + 40);
  ctx.stroke();
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let shakeX = (Math.random() - 0.5) * shake;
  let shakeY = (Math.random() - 0.5) * shake;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  if (shake > 0) shake--;

  ctx.fillStyle = "#222";
  ctx.fillRect(0, ground(), canvas.width, 50);

  drawStickman(
    player.x,
    player.y,
    player.w,
    player.h,
    playerHitTimer > 0 ? "red" : "white",
    player.walkAnim,
    player.attackAnim
  );

  if (player.attackAnim > 0) player.attackAnim--;

  enemies.forEach(e => {
    let drawX = e.x;

    if (e.attackAnim > 0) {
      let dir = player.x > e.x ? 1 : -1;
      drawX += dir * (e.isBoss ? 10 : 5);
    }

    drawStickman(
      drawX,
      e.y,
      e.w,
      e.h,
      e.isBoss ? "purple" : "red",
      e.walkAnim,
      e.attackAnim
    );
  });

  ctx.restore();

  ctx.fillStyle = "white";
  ctx.fillText("Wave: " + wave, 10, 20);
  ctx.fillText("HP: " + player.hp, 10, 40);
  ctx.fillText("Money: $" + money, 10, 60);
}

// ===== LOOP =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ===== CONTROLS =====
attackBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  attack();
}, { passive: false });

jumpBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  if (player.onGround) player.vy = -player.jump;
}, { passive: false });

// ===== START =====
spawnWave();
gameLoop();