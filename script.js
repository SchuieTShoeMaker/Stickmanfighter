// ===== CANVAS SETUP =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== GAME STATE =====
let gameStarted = false;
let difficulty = "normal";

let enemies = [];
let bullets = [];
let boss = null;

// ===== MENU BUTTON FIX =====
const buttons = document.querySelectorAll(".difficulty-btn");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => {
            b.style.background = "white";
            b.style.color = "black";
        });

        btn.style.background = "blue"; // 🔵 selected color
        btn.style.color = "white";

        difficulty = btn.dataset.diff;
        startGame();
    });
});

// ===== PLAYER =====
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    size: 30,
    speed: 5
};

// ===== INPUT =====
let keys = {};

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// ===== SHOOTING =====
window.addEventListener("click", () => {
    bullets.push({
        x: player.x,
        y: player.y,
        size: 5,
        speed: 8
    });
});

// ===== START GAME =====
function startGame() {
    gameStarted = true;
    enemies = [];
    bullets = [];
    boss = null;

    spawnEnemies();
    gameLoop();
}

// ===== ENEMY SPAWN =====
function spawnEnemies() {
    setInterval(() => {
        if (!gameStarted) return;

        enemies.push({
            x: Math.random() * canvas.width,
            y: -20,
            size: 20,
            speed: 2 + Math.random() * 2
        });

    }, 1000);
}

// ===== CATNAP BOSS =====
function spawnBoss() {
    boss = {
        x: canvas.width / 2,
        y: 100,
        size: 80,
        hp: 100,
        direction: 1,
        sleepWave: 0
    };
}

// spawn boss after time
setTimeout(spawnBoss, 15000);

// ===== UPDATE =====
function update() {
    // movement
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    // bullets
    bullets.forEach((b, i) => {
        b.y -= b.speed;
        if (b.y < 0) bullets.splice(i, 1);
    });

    // enemies
    enemies.forEach((e, i) => {
        e.y += e.speed;
        if (e.y > canvas.height) enemies.splice(i, 1);
    });

    // boss movement (CATNAP style)
    if (boss) {
        boss.x += boss.direction * 2;

        if (boss.x < 0 || boss.x > canvas.width) {
            boss.direction *= -1;
        }

        boss.sleepWave += 0.05;
    }
}

// ===== DRAW =====
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // player
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // bullets
    ctx.fillStyle = "yellow";
    bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.size, b.size);
    });

    // enemies
    ctx.fillStyle = "red";
    enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.size, e.size);
    });

    // ===== CATNAP BOSS DRAW =====
    if (boss) {
        // body
        ctx.fillStyle = "purple";
        ctx.fillRect(boss.x, boss.y, boss.size, boss.size);

        // eyes (sleepy vibe)
        ctx.fillStyle = "white";
        ctx.fillRect(boss.x + 10, boss.y + 20, 10, 5);
        ctx.fillRect(boss.x + 50, boss.y + 20, 10, 5);

        // sleep wave effect
        ctx.beginPath();
        ctx.arc(
            boss.x + boss.size / 2,
            boss.y + boss.size / 2,
            100 + Math.sin(boss.sleepWave) * 20,
            0,
            Math.PI * 2
        );
        ctx.strokeStyle = "rgba(150,0,255,0.3)";
        ctx.stroke();
    }
}

// ===== GAME LOOP =====
function gameLoop() {
    if (!gameStarted) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}