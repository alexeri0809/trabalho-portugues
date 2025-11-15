// ---------------------------
// CONFIGURAÇÃO DO CANVAS
// ---------------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Tamanho ideal para pixel art
canvas.width = 640;
canvas.height = 480;

let gameState = "story";


// ---------------------------
// PLAYER
// ---------------------------
let player = {
    x: 300,
    y: 300,
    width: 64,      // personagem GRANDE
    height: 64,
    speed: 2,
    sprite: new Image()
};
player.sprite.src = "assets/player.png"; // substitui pela imagem que quiseres


// ---------------------------
// MAPA
// ---------------------------
let mapa = new Image();
mapa.src = "assets/mapa1.png";


// ---------------------------
// TECLADO
// ---------------------------
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);


// ---------------------------
// DIÁLOGO
// ---------------------------
let dialogActive = false;
let dialogLines = [];
let dialogIndex = 0;

function showDialog(lines) {
    dialogActive = true;
    dialogLines = lines;
    dialogIndex = 0;

    dialogBox.classList.remove("hidden");
    dialogText.innerText = dialogLines[0];
}

document.addEventListener("keydown", (e) => {
    if (e.key === " " && dialogActive) nextDialog();
});

function nextDialog() {
    dialogIndex++;
    if (dialogIndex >= dialogLines.length) {
        dialogActive = false;
        dialogBox.classList.add("hidden");
        return;
    }
    dialogText.innerText = dialogLines[dialogIndex];
}


// ---------------------------
// CENAS DA HISTÓRIA (FULLSCREEN)
// ---------------------------
let storySceneImg = new Image();

function showStoryScene(img, dialog = []) {
    gameState = "story";
    storySceneImg = new Image();
    storySceneImg.src = img;

    if (dialog.length > 0) {
        showDialog(dialog);
    }
}


// ---------------------------
// FADE
// ---------------------------
let fadeAlpha = 0;
let fadeDirection = 0;
let fadeCallback = null;

function startFadeOut(callback) {
    fadeDirection = 0.03;
    fadeCallback = callback;
}

function startFadeIn() {
    fadeDirection = -0.03;
}

function drawFade() {
    if (fadeDirection === 0) return;

    fadeAlpha += fadeDirection;

    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (fadeAlpha >= 1) {
        fadeDirection = 0;
        if (fadeCallback) fadeCallback();
        fadeCallback = null;
    }

    if (fadeAlpha <= 0) fadeDirection = 0;
}


// ---------------------------
// OBJETOS INTERATIVOS (INVISÍVEIS)
// ---------------------------
let objetos = [
    {
        x: 350,
        y: 200,
        w: 60,
        h: 60,
        dialog: [
            "Um baú... mas não há nada dentro.",
            "A sensação estranha permanece."
        ]
    }
];

function playerNear(obj) {
    return Math.abs(player.x - obj.x) < 80 &&
           Math.abs(player.y - obj.y) < 80;
}


// ---------------------------
// UPDATE
// ---------------------------
function update() {
    if (dialogActive) return;

    if (gameState === "story") return;

    if (gameState === "play") {
        if (keys["ArrowUp"]) player.y -= player.speed;
        if (keys["ArrowDown"]) player.y += player.speed;
        if (keys["ArrowLeft"]) player.x -= player.speed;
        if (keys["ArrowRight"]) player.x += player.speed;

        if (keys["e"]) {
            objetos.forEach(obj => {
                if (playerNear(obj)) showDialog(obj.dialog);
            });
        }
    }
}


// ---------------------------
// DRAW
// ---------------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // História
    if (gameState === "story") {
        ctx.drawImage(storySceneImg, 0, 0, canvas.width, canvas.height);
    }

    // Gameplay
    if (gameState === "play") {
        ctx.drawImage(mapa, 0, 0, canvas.width, canvas.height);

        // Player
        ctx.drawImage(
            player.sprite,
            player.x,
            player.y,
            player.width,
            player.height
        );

        // Objetos invisíveis + Interagir
        objetos.forEach(obj => {
            if (playerNear(obj)) {
                ctx.font = "22px Arial";
                ctx.fillStyle = "white";
                ctx.fillText("Interagir", obj.x - 10, obj.y - 15);
            }
        });
    }

    drawFade();
}


// ---------------------------
// LOOP
// ---------------------------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();


// ---------------------------
// HISTÓRIA INICIAL (exemplo)
// ---------------------------
setTimeout(() => {
    showStoryScene("assets/cena1.png", [
        "Era uma noite fria...",
        "Tudo estava prestes a mudar."
    ]);
}, 500);

setTimeout(() => {
    showStoryScene("assets/cena2.png", [
        "O garoto estava sozinho.",
        "Mas ele tinha um destino."
    ]);
}, 5500);

setTimeout(() => {
    startFadeOut(() => {
        gameState = "play";
        startFadeIn();
    });
}, 11000);
