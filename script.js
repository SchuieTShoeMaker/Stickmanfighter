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
if (keys["ArrowRight"]) player.x += 3;
if (keys["ArrowLeft"]) player.x -= 3;
if (keys["ArrowUp"]) player.y -= 3;
if (keys["ArrowDown"]) player.y += 3;
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
