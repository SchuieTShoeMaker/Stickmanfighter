const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.6;

// Player
let player = {
  x: 100,
  y: 200,
  hp: 100
};

// Enemies
let enemies = [];
let wave = 1;

// Spawn enemies
function spawnWave() {
  enemies = [];
  for (let i = 0; i < wave * 2; i++) {
    enemies.push({
      x: 400 + i * 50,
      y: 200,
      hp: 20
    });
  }
}

// Attack
function attack() {
  console.log("ATTACK!");

  enemies.forEach(enemy => {
    if (Math.abs(enemy.x - player.x) < 60 &&
        Math.abs(enemy.y - player.y) < 60) {
      enemy.hp -= 10;
    }
  });
}

// Update game
function update() {
  // Movement (joystick)
  player.x += joyX * 0.1;
  player.y += joyY * 0.1;

  // Enemies follow player 🔥
  enemies.forEach(e => {
    if (e.x < player.x) e.x += 1;
    if (e.x > player.x) e.x -= 1;
    if (e.y < player.y) e.y += 1;
    if (e.y > player.y) e.y -= 1;
  });

  // Remove dead enemies
  enemies = enemies.filter(e => e.hp > 0);

  // Next wave
  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player (BIG + visible)
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, 40, 60);

  // Enemies (bigger + red)
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, 30, 50);
  });

  // UI text
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Wave: " + wave, 10, 20);
  ctx.fillText("HP: " + player.hp, 10, 45);
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start game
spawnWave();
gameLoop();


// 🎮 JOYSTICK CONTROLS
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

// Attack button
attackBtn.addEventListener("touchstart", attack);