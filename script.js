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
  x: 100, y: 100, w: 20, h: 40,
  hp: 100, vx: 0, vy: 0,
  speed: 3, jump: 10,
  onGround: false,
  walkAnim: 0,
  attackAnim: 0,
  recoil: 0
};

let playerHitTimer = 0;
let shake = 0;
let horror = 0;

// ===== EFFECTS =====
let hitEffects = [];
let flashTimer = 0;
let slowMo = 0;

// ===== GAME STATE =====
let enemies = [];
let projectiles = [];
let wave = 1;

let money = 0;
let playerDamage = 15;
let playerArmor = 0;
let hasPoison = false;

// ===== SHOP =====
let inShop = false;
let weapon = "sword";
let attackCooldownMax = 20;
let attackCooldown = 0;

// ===== ABILITIES =====
let abilityTimer = 0;
let isDashing = false;

// ===== INPUT =====
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ===== HIT EFFECT =====
function createHit(x, y) {
  for (let i = 0; i < 10; i++) {
    hitEffects.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 25
    });
  }
  flashTimer = 2;
  shake = 12;
  slowMo = 3;
}

// ===== SPAWN =====
function spawnWave() {
  enemies = [];

  if (wave % 10 === 0) {
    enemies.push({
      x: canvas.width / 2,
      w: 70, h: 140,
      hp: 600, maxHp: 600,
      speed: 1.5,
      isBoss: true,
      stage: 1,
      teleportCooldown: 120,
      rage: 0,
      attackCooldown: 0
    });
    return;
  }

  for (let i = 0; i < wave * 2; i++) {
    let types = ["normal"];
    if (wave > 3) types.push("fast");
    if (wave > 6) types.push("tank");
    if (wave > 8) types.push("ranged");

    let type = types[Math.floor(Math.random() * types.length)];

    let e = {
      x: Math.random() * canvas.width,
      w: 20, h: 40,
      hp: 30, speed: 1.5,
      type,
      walkAnim: 0,
      attackCooldown: 0
    };

    if (type === "fast") { e.speed = 3; e.hp = 20; }
    if (type === "tank") { e.hp = 80; e.speed = 0.7; }
    if (type === "ranged") { e.hp = 25; e.speed = 1.2; e.shootCooldown = 60; }

    enemies.push(e);
  }
}

// ===== ATTACK =====
function attack() {
  if (attackCooldown > 0) return;

  attackCooldown = attackCooldownMax;
  player.attackAnim = 10;
  player.recoil = 5;

  enemies.forEach(e => {
    if (Math.abs(e.x - player.x) < 70) {
      e.hp -= playerDamage;
      createHit(e.x, e.y);
    }
  });
}

// ===== UPDATE =====
function update() {
  if (inShop) return;

  if (attackCooldown > 0) attackCooldown--;
  if (player.recoil > 0) player.recoil--;

  player.vx = 0;
  if (keys["a"]) player.vx = -player.speed;
  if (keys["d"]) player.vx = player.speed;

  player.x += player.vx;

  player.walkAnim += Math.abs(player.vx) > 0.1 ? 0.2 : 0;

  player.vy += 0.5;
  player.y += player.vy;

  if (player.y + player.h > ground()) {
    player.y = ground() - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  if (keys["w"] && player.onGround) player.vy = -player.jump;

  // ===== ENEMIES =====
  enemies.forEach(e => {
    e.y = ground() - e.h;
    e.walkAnim += 0.15;

    if (!e.isBoss) {
      if (e.x < player.x) e.x += e.speed;
      else e.x -= e.speed;
    }

    // ===== CATNAP PHASE SYSTEM =====
    if (e.isBoss) {

      let hpPercent = e.hp / e.maxHp;

      if (hpPercent < 0.66) e.stage = 2;
      if (hpPercent < 0.33) e.stage = 3;

      // Phase behaviors
      if (e.stage === 1) {
        e.speed = 1.5;
      }

      if (e.stage === 2) {
        e.speed = 2.5;
        if (Math.random() < 0.02) {
          e.x = player.x + (Math.random() * 200 - 100);
          flashTimer = 5;
        }
      }

      if (e.stage === 3) {
        e.speed = 3.5;
        horror += 0.01;

        if (Math.random() < 0.05) {
          e.x = player.x + (Math.random() * 100 - 50);
          shake = 20;
          flashTimer = 6;
        }
      }
    }

    // attack
    if (Math.abs(e.x - player.x) < 20 && e.attackCooldown <= 0) {
      player.hp -= 5;
      createHit(player.x, player.y);
      e.attackCooldown = 30;
    }

    if (e.attackCooldown > 0) e.attackCooldown--;
  });

  enemies = enemies.filter(e => e.hp > 0);

  if (enemies.length === 0) {
    inShop = true;
    document.getElementById("shop").style.display = "block";
    wave++;
    spawnWave();
  }

  if (player.hp <= 0) {
    document.getElementById("gameOver").style.display = "block";
    inShop = true;
  }
}

// ===== DRAW =====
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.save();
  ctx.translate((Math.random()-0.5)*shake,(Math.random()-0.5)*shake);

  ctx.fillStyle="#222";
  ctx.fillRect(0,ground(),canvas.width,50);

  // player
  ctx.strokeStyle = playerHitTimer > 0 ? "red" : "white";

  let swing = Math.sin(player.walkAnim) * 6;

  ctx.beginPath();
  ctx.arc(player.x+10,player.y+10,6,0,Math.PI*2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(player.x+10,player.y+16);
  ctx.lineTo(player.x+10,player.y+30);
  ctx.stroke();

  // enemies
  enemies.forEach(e=>{
    if(e.isBoss){
      ctx.fillStyle="purple";
      ctx.fillRect(e.x,e.y,e.w,e.h);

      // glowing eyes
      ctx.fillStyle="red";
      ctx.fillRect(e.x+15,e.y+20,5,5);
      ctx.fillRect(e.x+35,e.y+20,5,5);
    } else {
      ctx.strokeStyle="red";
      ctx.strokeRect(e.x,e.y,e.w,e.h);
    }
  });

  ctx.restore();

  // horror overlay
  if (horror > 0) {
    ctx.fillStyle = "rgba(0,0,0," + horror + ")";
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  ctx.fillStyle="white";
  ctx.fillText("Wave: "+wave,10,20);
  ctx.fillText("HP: "+Math.floor(player.hp),10,40);
}

// ===== LOOP =====
function gameLoop(){
  update();
  draw();
  setTimeout(gameLoop, slowMo>0 ? 40 : 16);
}

// ===== START =====
spawnWave();
gameLoop();