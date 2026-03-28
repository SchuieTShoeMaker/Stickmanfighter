const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

let player = {
  x: 100,
  y: 200,
  hp: 100
};
let keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});
let enemies = [];
let wave = 1;

// Spawn enemies
function spawnWave() {
  enemies = [];
  for (let i = 0; i < wave * 2; i++) {
    enemies.push({
      x: 500 + i * 40,
      y: 200,
      hp: 20
    });
  }
}

// Attack system
document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    enemies.forEach(enemy => {
      if (Math.abs(enemy.x - player.x) < 50) {
        enemy.hp -= 10;
      }
    });
  }
});

function update() {
  // Movement
player.x += joyX * 0.1;
player.y += joyY * 0.1;
  enemies = enemies.filter(e => e.hp > 0);

  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, 20, 40);

  // Enemies
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, 20, 40);
  });

  ctx.fillStyle = "white";
  ctx.fillText("Wave: " + wave, 10, 20);
}
function move(direction) {
  if (direction === "left") player.x -= 10;
  if (direction === "right") player.x += 10;
  if (direction === "up") player.y -= 10;
  if (direction === "down") player.y += 10;
}

function attack() {
  enemies.forEach(enemy => {
    if (Math.abs(enemy.x - player.x) < 50) {
      enemy.hp -= 10;
    }
  });
}
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

spawnWave();
gameLoop();
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const attackBtn = document.getElementById("attackBtn");

let joyX = 0;
let joyY = 0;

joystick.addEventListener("touchmove", (e) => {
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