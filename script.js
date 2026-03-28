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
  attackAnim: 0
};

let playerHitTimer = 0;
let shake = 0;

// ===== NEW EFFECTS =====
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

// ===== SHOP / WEAPONS =====
let inShop = false;
let weapon = "sword";
let attackCooldownMax = 20;
let attackCooldown = 0;

// ===== ABILITIES =====
let abilityTimer = 0;
let isDashing = false;

// ===== ENEMY UNLOCKS =====
let unlockedEnemies = {
  fast: false,
  tank: false,
  ranged: false
};

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

// ===== HIT EFFECT =====
function createHit(x, y) {
  for (let i = 0; i < 8; i++) {
    hitEffects.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 20
    });
  }
  flashTimer = 3;
  shake = 10;
  slowMo = 5;
}

// ===== SPAWN =====
function spawnWave() {
  enemies = [];

  if (wave >= 3) unlockedEnemies.fast = true;
  if (wave >= 6) unlockedEnemies.tank = true;
  if (wave >= 9) unlockedEnemies.ranged = true;

  if (wave % 5 === 0) {
    enemies.push({
      x: canvas.width / 2,
      w: 60, h: 120,
      hp: 400, maxHp: 400,
      speed: 1.5,
      isBoss: true,
      stage: 1,
      poison: 0,
      dead: false,
      attackCooldown: 0,
      attackAnim: 0,
      walkAnim: 0,
      teleportCooldown: 120
    });
    return;
  }

  for (let i = 0; i < wave * 2; i++) {
    let types = ["normal"];
    if (unlockedEnemies.fast) types.push("fast");
    if (unlockedEnemies.tank) types.push("tank");
    if (unlockedEnemies.ranged) types.push("ranged");

    let type = types[Math.floor(Math.random() * types.length)];

    let e = {
      x: Math.random() * canvas.width,
      w: 20, h: 40,
      hp: 30, maxHp: 30,
      speed: 1.5,
      type,
      isBoss: false,
      poison: 0,
      dead: false,
      attackCooldown: 0,
      attackAnim: 0,
      walkAnim: 0,
      shootCooldown: 60
    };

    if (type === "fast") { e.speed = 3; e.hp = 20; }
    if (type === "tank") { e.hp = 80; e.maxHp = 80; e.speed = 0.8; }
    if (type === "ranged") { e.hp = 25; e.speed = 1.2; }

    enemies.push(e);
  }
}

// ===== ATTACK =====
function attack() {
  if (attackCooldown > 0) return;

  attackCooldown = attackCooldownMax;
  player.attackAnim = 10;

  if (weapon === "sword") {
    abilityTimer = 10;
    enemies.forEach(e => {
      if (Math.abs(e.x - player.x) < 70) {
        e.hp -= playerDamage;
        if (hasPoison) e.poison = 60;
        createHit(e.x, e.y);
      }
    });
  }

  if (weapon === "dagger") {
    isDashing = true;
    abilityTimer = 10;
    player.vx = (player.vx >= 0 ? 1 : -1) * 12;
  }

  if (weapon === "hammer") {
    abilityTimer = 15;
    shake = 20;
    enemies.forEach(e => {
      if (Math.abs(e.x - player.x) < 100) {
        e.hp -= playerDamage * 1.5;
        createHit(e.x, e.y);
      }
    });
  }
}

// ===== SHOP =====
function buyDamage() {
  if (money >= 50) { money -= 50; playerDamage += 5; }
}
function buyArmor() {
  if (money >= 100) { money -= 100; playerArmor += 1; }
}
function buyPoison() {
  if (money >= 150 && !hasPoison) {
    money -= 150;
    hasPoison = true;
  }
}
function setWeapon(w) {
  weapon = w;
  if (w === "sword") attackCooldownMax = 20;
  if (w === "dagger") attackCooldownMax = 10;
  if (w === "hammer") attackCooldownMax = 35;
}
function continueGame() {
  inShop = false;
  document.getElementById("shop").style.display = "none";
  wave++;
  spawnWave();
}

// ===== UPDATE =====
function update() {
  if (inShop) return;

  if (attackCooldown > 0) attackCooldown--;
  if (abilityTimer > 0) abilityTimer--;
  if (slowMo > 0) slowMo--;

  player.vx = 0;
  if (keys["a"]) player.vx = -player.speed;
  if (keys["d"]) player.vx = player.speed;

  player.x += player.vx;

  if (Math.abs(player.vx) > 0.1) player.walkAnim += 0.2;
  else player.walkAnim = 0;

  player.vy += 0.5;
  player.y += player.vy;

  if (player.y + player.h > ground()) {
    player.y = ground() - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  if (keys["w"] && player.onGround) player.vy = -player.jump;

  if (isDashing && abilityTimer <= 0) isDashing = false;

  // ===== ENEMIES =====
  enemies.forEach(e => {
    e.y = ground() - e.h;
    e.walkAnim += 0.15;

    let predict = wave > 5 ? player.vx * 10 : 0;

    if (e.x < player.x + predict) e.x += e.speed;
    else e.x -= e.speed;

    if (wave > 8) e.speed += 0.02;

    // boss teleport
    if (e.isBoss) {
      e.teleportCooldown--;
      if (e.teleportCooldown <= 0) {
        e.x = player.x + (Math.random() * 200 - 100);
        e.teleportCooldown = 120;
        flashTimer = 5;
      }
    }

    // ranged attack
    if (e.type === "ranged") {
      if (e.shootCooldown <= 0) {
        projectiles.push({
          x: e.x,
          y: e.y + 20,
          vx: player.x > e.x ? 6 : -6,
          hit: false
        });
        e.shootCooldown = 90;
      } else e.shootCooldown--;
    }

    if (Math.abs(e.x - player.x) < 20 && e.attackCooldown <= 0) {
      let dmg = e.isBoss ? 15 : 2;
      dmg = Math.max(0, dmg - playerArmor);

      player.hp -= dmg;
      playerHitTimer = 10;

      createHit(player.x, player.y);

      let dir = player.x > e.x ? 1 : -1;
      player.vx += dir * (e.isBoss ? 8 : 4);

      shake = 10;

      e.attackCooldown = 25;
    }

    if (e.attackCooldown > 0) e.attackCooldown--;

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

  // projectiles
  projectiles.forEach(p => {
    p.x += p.vx;

    if (Math.abs(p.x - player.x) < 10 &&
        Math.abs(p.y - player.y) < 20) {
      player.hp -= 5;
      createHit(player.x, player.y);
      p.hit = true;
    }
  });

  projectiles = projectiles.filter(p => !p.hit && p.x > 0 && p.x < canvas.width);

  // hit particles
  hitEffects.forEach(h => {
    h.x += h.vx;
    h.y += h.vy;
    h.life--;
  });
  hitEffects = hitEffects.filter(h => h.life > 0);

  // shop
  if (enemies.length === 0 && !inShop) {
    inShop = true;
    document.getElementById("shop").style.display = "block";
    document.getElementById("shopMoney").innerText = money;
  }

  if (player.hp <= 0) {
    document.getElementById("gameOver").style.display = "block";
    inShop = true;
  }
}

// ===== DRAW CATNAP (SCARY) =====
function drawCatnap(e) {
  let x = e.x;
  let y = e.y;

  ctx.fillStyle = "rgba(50,0,80,0.4)";
  ctx.beginPath();
  ctx.arc(x + 30, y + 50, 90, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2b0040";
  ctx.beginPath();
  ctx.ellipse(x + 30, y + 60, 25, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2b0040";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + 30, y + 60);
  ctx.lineTo(x + 5, y + 120);
  ctx.moveTo(x + 30, y + 60);
  ctx.lineTo(x + 55, y + 120);
  ctx.stroke();

  ctx.fillStyle = "hotpink";
  ctx.beginPath();
  ctx.arc(x + 20, y + 40, 5, 0, Math.PI * 2);
  ctx.arc(x + 40, y + 40, 5, 0, Math.PI * 2);
  ctx.fill();
}

// ===== DRAW STICKMAN =====
function drawStickman(x,y,w,h,color,walk,attack){
  ctx.strokeStyle=color;
  let swing=Math.sin(walk)*6;

  ctx.beginPath();
  ctx.arc(x+w/2,y+10,6,0,Math.PI*2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x+w/2,y+16);
  ctx.lineTo(x+w/2,y+30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x+w/2,y+22);
  ctx.lineTo(x+w/2+(attack>0?10:swing),y+22);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x+w/2,y+30);
  ctx.lineTo(x+w/2-swing,y+40);
  ctx.moveTo(x+w/2,y+30);
  ctx.lineTo(x+w/2+swing,y+40);
  ctx.stroke();
}

// ===== DRAW =====
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.save();
  ctx.translate((Math.random()-0.5)*shake,(Math.random()-0.5)*shake);
  if(shake>0)shake--;

  ctx.fillStyle="#222";
  ctx.fillRect(0,ground(),canvas.width,50);

  // player
  drawStickman(player.x,player.y,player.w,player.h,
    playerHitTimer>0?"red":"white",
    player.walkAnim,
    player.attackAnim
  );

  // weapon visuals
  if (weapon === "sword" && player.attackAnim > 0) {
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y + 20, 30, -0.5, 0.5);
    ctx.stroke();
  }

  if (weapon === "dagger" && isDashing) {
    ctx.fillStyle="rgba(0,255,255,0.3)";
    ctx.fillRect(player.x-15,player.y,50,player.h);
  }

  if (weapon === "hammer" && abilityTimer > 0) {
    ctx.beginPath();
    ctx.arc(player.x+10,player.y+30,80,0,Math.PI*2);
    ctx.fill();
  }

  enemies.forEach(e=>{
    if(e.isBoss) drawCatnap(e);
    else{
      drawStickman(e.x,e.y,e.w,e.h,"red",e.walkAnim,e.attackAnim);

      if(e.type==="ranged"){
        ctx.strokeStyle="brown";
        ctx.beginPath();
        ctx.arc(e.x+10,e.y+20,10,-1,1);
        ctx.stroke();
      }
    }
  });

  // particles
  ctx.fillStyle="orange";
  hitEffects.forEach(h=>{
    ctx.fillRect(h.x,h.y,3,3);
  });

  ctx.restore();

  if (flashTimer > 0) {
    ctx.fillStyle="rgba(255,255,255,0.2)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    flashTimer--;
  }

  ctx.fillStyle="white";
  ctx.fillText("Wave: "+wave,10,20);
  ctx.fillText("HP: "+player.hp,10,40);
  ctx.fillText("Money: $"+money,10,60);
}

// ===== LOOP =====
function gameLoop(){
  update();
  draw();
  setTimeout(gameLoop, slowMo>0 ? 40 : 16);
}

// ===== CONTROLS =====
attackBtn.addEventListener("touchstart",e=>{
  e.preventDefault();
  attack();
},{passive:false});

jumpBtn.addEventListener("touchstart",e=>{
  e.preventDefault();
  if(player.onGround) player.vy=-player.jump;
},{passive:false});

// ===== START =====
spawnWave();
gameLoop();