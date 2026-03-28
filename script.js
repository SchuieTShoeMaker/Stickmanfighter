// ===== CANVAS =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== GAME STATE =====
let enemies = [];
let bullets = [];
let gameOver = false;

// ===== PLAYER =====
const player = {
    x: canvas.width / 2,
    y: canvas.height - 120,
    size: 30,
    speed: 5
};

// ===== INPUT =====
let keys = {};

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// ===== ATTACK =====
function attack() {
    bullets.push({
        x: player.x,
        y: player.y,
        size: 6,
        speed: 8
    });
}

// mobile button
const attackBtn = document.getElementById("attackBtn");
attackBtn.addEventListener("touchstart", attack);

// ===== ENEMY SPAWN (WAVES) =====
function spawnWave() {
    for (let i = 0; i < 5; i++) {
        enemies.push({
            x: Math.random() * canvas.width,
            y: -Math.random() * 200,
            size: 20,
            speed: 2 + Math.random() * 2
        });
    }

    // next wave
    setTimeout(spawnWave, 3000);
}

// ===== UPDATE =====
function update() {
    if (gameOver) return;

    // movement
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    // bullets
    bullets.forEach((b, bi) => {
        b.y -= b.speed;

        if (b.y < 0) bullets.splice(bi, 1);

        // hit enemies
        enemies.forEach((e, ei) => {
            if (
                b.x < e.x + e.size &&
                b.x + b.size > e.x &&
                b.y < e.y + e.size &&
                b.y + b.size > e.y
            ) {
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
            }
        });
    });

    // enemies
    enemies.forEach((e, i) => {
        e.y += e.speed;

        // hit player
        if (
            e.x < player.x + player.size &&
            e.x + e.size > player.x &&
            e.y < player.y + player.size &&
            e.y + e.size > player.y
        ) {
            gameOver = true;
        }

        if (e.y > canvas.height) enemies.splice(i, 1);
    });
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

    // game over
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
    }
}

// ===== LOOP =====
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ===== RESTART =====
canvas.addEventListener("touchstart", () => {
    if (gameOver) location.reload();
});

// ===== START =====
spawnWave();
gameLoop();