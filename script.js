// ===== SETUP =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// ===== PLAYER =====
const player = {
    x: 200,
    y: 400,
    w: 20,
    h: 40,
    hp: 100,
    vx: 0,
    vy: 0
};

// ===== GAME STATE =====
let enemies = [];
let damageTexts = [];
let wave = 1;
let attackTimer = 0;
let shake = 0;
let gameOver = false;

// ===== INPUT =====
let keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

// ===== ATTACK =====
function attack() {
    if (attackTimer > 0) return;

    attackTimer = 20;

    enemies.forEach(e => {
        let dx = e.x - player.x;
        let dy = e.y - player.y;
        let dist = Math.hypot(dx, dy);

        if (dist < 80) {
            e.hp -= 20;

            // knockback
            e.x += dx * 0.3;
            e.y += dy * 0.3;

            // damage text
            damageTexts.push({
                x: e.x,
                y: e.y,
                text: "20",
                life: 30
            });

            // screen shake
            shake = 10;
        }
    });
}

// mobile
document.getElementById("attackBtn")
.addEventListener("touchstart", attack);

// ===== ENEMY SPAWN =====
function spawnWave() {
    for (let i = 0; i < wave * 2; i++) {
        enemies.push({
            x: Math.random() * canvas.width,
            y: -50,
            w: 20,
            h: 20,
            hp: 40
        });
    }

    wave++;

    setTimeout(spawnWave, 4000);
}

// ===== UPDATE =====
function update() {
    if (gameOver) return;

    // movement physics
    if (keys["ArrowLeft"]) player.vx -= 0.5;
    if (keys["ArrowRight"]) player.vx += 0.5;

    player.vx *= 0.9;
    player.x += player.vx;

    // attack cooldown
    if (attackTimer > 0) attackTimer--;

    // enemies
    enemies.forEach((e, i) => {
        let dx = player.x - e.x;
        let dy = player.y - e.y;
        let dist = Math.hypot(dx, dy);

        e.x += dx / dist * 1.5;
        e.y += dy / dist * 1.5;

        // hit player
        if (dist < 20) {
            player.hp -= 0.5;
            shake = 5;
        }

        if (e.hp <= 0) {
            enemies.splice(i, 1);
        }
    });

    // damage text
    damageTexts.forEach((t, i) => {
        t.y -= 1;
        t.life--;

        if (t.life <= 0) damageTexts.splice(i, 1);
    });

    // game over
    if (player.hp <= 0) {
        gameOver = true;
    }
}

// ===== DRAW =====
function draw() {
    ctx.save();

    // screen shake
    ctx.translate(
        Math.random() * shake - shake / 2,
        Math.random() * shake - shake / 2
    );
    shake *= 0.9;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // player
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // enemies
    ctx.fillStyle = "red";
    enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.w, e.h);
    });

    // damage text
    ctx.fillStyle = "yellow";
    damageTexts.forEach(t => {
        ctx.fillText(t.text, t.x, t.y);
    });

    ctx.restore();

    // UI
    ctx.fillStyle = "white";
    ctx.fillText("HP: " + Math.floor(player.hp), 20, 30);
    ctx.fillText("Wave: " + wave, 20, 60);

    // game over
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width/2 - 120, canvas.height/2);
        ctx.fillText("Tap to restart", canvas.width/2 - 140, canvas.height/2 + 50);
    }
}

// ===== LOOP =====
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// restart
canvas.addEventListener("touchstart", () => {
    if (gameOver) location.reload();
});

// ===== START =====
spawnWave();
gameLoop();