// ===== SETUP =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// ===== PLAYER =====
const player = {
    x: 200,
    y: 200,
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

// ===== SPAWN =====
function spawnWave() {
    enemies = [];

    let count = 3 + wave;

    for (let i = 0; i < count; i++) {
        let isBoss = (wave % 10 === 0 && i === 0);

        enemies.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            w: 20,
            h: 40,
            hp: isBoss ? 200 : 30,
            maxHp: isBoss ? 200 : 30,
            speed: isBoss ? 1.2 : 1.5,
            isBoss: isBoss,
            attackCooldown: 0,
            dashCooldown: 0,
            phase: 0,
            hitTimer: 0
        });
    }
}

// ===== ATTACK =====
function attack() {
    attackTimer = 10;

    enemies.forEach(e => {
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
            e.hp -= 15;
            e.hitTimer = 5;

            // knockback
            e.x += (dx / dist) * 20;
            e.y += (dy / dist) * 20;

            damageTexts.push({
                x: e.x,
                y: e.y,
                text: "-15",
                life: 30
            });
        }
    });
}

// ===== UPDATE =====
function update() {

    // Smooth movement
    player.vx += joyX * 0.02;
    player.vy += joyY * 0.02;

    player.vx *= 0.9;
    player.vy *= 0.9;

    player.x += player.vx;
    player.y += player.vy;

    // Bounds
    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

    enemies.forEach(e => {
        let dx = player.x - e.x;
        let dy = player.y - e.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {

            let speed = e.speed;

            if (e.isBoss) {
                e.phase += 0.05;

                speed = 0.6 + Math.sin(Date.now() / 200) * 0.4;
                e.y += Math.sin(e.phase);

                if (e.dashCooldown <= 0) {
                    speed = 6;
                    e.dashCooldown = 120;
                }
                e.dashCooldown--;
            }

            e.x += (dx / dist) * speed;
            e.y += (dy / dist) * speed;
        }

        // DAMAGE PLAYER
        if (dist < 35 && e.attackCooldown <= 0) {
            let dmg = e.isBoss ? 20 : 4;
            player.hp -= dmg;

            shake = 8;

            if (player.hp < 0) player.hp = 0;

            damageTexts.push({
                x: player.x,
                y: player.y,
                text: "-" + dmg,
                life: 30
            });

            e.attackCooldown = e.isBoss ? 20 : 40;
        }

        if (e.attackCooldown > 0) e.attackCooldown--;

        if (e.hitTimer > 0) e.hitTimer--;
    });

    // Remove dead
    enemies = enemies.filter(e => e.hp > 0);

    // Next wave
    if (enemies.length === 0) {
        wave++;
        spawnWave();
    }

    // Damage text
    damageTexts.forEach(d => {
        d.y -= 1;
        d.life--;
    });

    damageTexts = damageTexts.filter(d => d.life > 0);

    // Game over
    if (player.hp <= 0) {
        alert("Game Over");
        location.reload();
    }
}

// ===== DRAW PLAYER =====
function drawStickman(x, y, w, h, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(x + w / 2, y + 10, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 16);
    ctx.lineTo(x + w / 2, y + 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 8, y + 22);
    ctx.lineTo(x + w / 2 + 8, y + 22);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 30);
    ctx.lineTo(x + w / 2 - 6, y + 40);
    ctx.moveTo(x + w / 2, y + 30);
    ctx.lineTo(x + w / 2 + 6, y + 40);
    ctx.stroke();
}

// ===== DRAW BOSS =====
function drawBoss(e) {
    let cx = e.x + e.w / 2;
    let cy = e.y + e.h / 2;

    ctx.fillStyle = "rgba(180,0,255,0.25)";
    ctx.beginPath();
    ctx.arc(cx, cy, 70 + Math.sin(Date.now()/150)*10, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = e.hitTimer > 0 ? "white" : "#7a00cc";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 35, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 10, 6, 0, Math.PI*2);
    ctx.arc(cx + 10, cy - 10, 6, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 10, 2, 0, Math.PI*2);
    ctx.arc(cx + 10, cy - 10, 2, 0, Math.PI*2);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(cx, cy + 10, 12, 0, Math.PI);
    ctx.stroke();
}

// ===== DRAW =====
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // screen shake
    ctx.save();
    ctx.translate(
        Math.random() * shake - shake / 2,
        Math.random() * shake - shake / 2
    );

    drawStickman(player.x, player.y, player.w, player.h, "white");

    enemies.forEach(e => {
        if (e.isBoss) drawBoss(e);
        else drawStickman(e.x, e.y, e.w, e.h, e.hitTimer > 0 ? "white" : "red");

        // HP bar
        ctx.fillStyle = "black";
        ctx.fillRect(e.x, e.y - 8, e.w, 4);

        ctx.fillStyle = e.isBoss ? "purple" : "lime";
        ctx.fillRect(e.x, e.y - 8, (e.hp / e.maxHp) * e.w, 4);
    });

    ctx.restore();
    if (shake > 0) shake--;

    // Attack circle
    if (attackTimer > 0) {
        ctx.fillStyle = "rgba(255,255,0,0.3)";
        ctx.beginPath();
        ctx.arc(player.x + 10, player.y + 20, 70, 0, Math.PI * 2);
        ctx.fill();
        attackTimer--;
    }

    // Damage text
    ctx.fillStyle = "yellow";
    ctx.font = "14px Arial";
    damageTexts.forEach(d => {
        ctx.fillText(d.text, d.x, d.y);
    });

    // UI
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText("Wave: " + wave, 10, 20);
    ctx.fillText("HP: " + player.hp, 10, 40);

    if (wave % 10 === 0) {
        ctx.fillStyle = "purple";
        ctx.font = "24px Arial";
        ctx.fillText("BOSS WAVE", canvas.width / 2 - 80, 40);
    }
}

// ===== LOOP =====
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ===== CONTROLS =====
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const attackBtn = document.getElementById("attackBtn");

let joyX = 0;
let joyY = 0;

joystick.addEventListener("touchmove", e => {
    const rect = joystick.getBoundingClientRect();
    const touch = e.touches[0];

    let x = touch.clientX - rect.left - 50;
    let y = touch.clientY - rect.top - 50;

    let dist = Math.sqrt(x*x + y*y);

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

// ===== START =====
spawnWave();
gameLoop();