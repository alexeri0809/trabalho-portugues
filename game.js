// ---------------------------
// CONFIGURAÇÃO DO CANVAS
// ---------------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 320;
canvas.height = 240;

let gameState = "story"; 
// story → mostrando cenas
// fade  → transição
// play  → jogador pode andar


// ---------------------------
// PLAYER
// ---------------------------
let player = {
    x: 150,
    y: 120,
    width: 16,
    height: 16,
    speed: 2,
    sprite: new Image()
};
player.sprite.src = "assets/player.png";


// ---------------------------
// Mapa / Cena de jogo
// ---------------------------
let mapa = new Image();
mapa.src = "assets/mapa1.png";


// ---------------------------
// TECLAS
// ---------------------------
let keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);


// ---------------------------
// SISTEMA DE DIÁLOGO
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
// SISTEMA DE HISTÓRIA (CENAS)
// ---------------------------
let storyScene = null;
let storySceneImg = new Image();

function showStoryScene(img, dialog = []) {
    gameState = "story";
    storyScene = img;
    storySceneImg.src = img;

    if (dialog.length > 0) {
        showDialog(dialog);
    }
}


// ---------------------------
// FADE TRANSITIONS
// ---------------------------
let fadeAlpha = 0;
let fadeDirection = 0;
let fadeCallback = null;

function startFadeOut(callback) {
    fadeDirection = 0.05; // escurecendo
    fadeCallback = callback;
}

function startFadeIn() {
    fadeDirection = -0.05; // clareando
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

    if (fadeAlpha <= 0) {
        fadeDirection = 0;
    }
}


// ---------------------------
// OBJETOS INTERATIVOS
// ---------------------------
let objetos = [
    { x: 200, y: 100, w: 16, h: 16, dialog: ["Um velho baú.", "Está vazio."] }
];

function playerNear(obj) {
    return Math.abs(player.x - obj.x) < 20 &&
           Math.abs(player.y - obj.y) < 20;
}


// ---------------------------
// ATUALIZAÇÃO DO JOGO
// ---------------------------
function update() {
    if (dialogActive) return;

    if (gameState === "story") {
        // Apenas espera espaço nos diálogos
        return;
    }

    if (gameState === "play") {
        if (keys["ArrowUp"]) player.y -= player.speed;
        if (keys["ArrowDown"]) player.y += player.speed;
        if (keys["ArrowLeft"]) player.x -= player.speed;
        if (keys["ArrowRight"]) player.x += player.speed;

        // Interação com objetos
        if (keys["e"]) {
            objetos.forEach(obj => {
                if (playerNear(obj)) {
                    showDialog(obj.dialog);
                }
            });
        }
    }
}


// ---------------------------
// DESENHAR TUDO
// ---------------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "story") {
        if (storyScene) ctx.drawImage(storySceneImg, 0, 0, canvas.width, canvas.height);
    }

    if (gameState === "play") {
        ctx.drawImage(mapa, 0, 0);
        ctx.drawImage(player.sprite, player.x, player.y);

        objetos.forEach(obj => {
            ctx.fillStyle = "yellow";
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        });
    }

    drawFade();
}


// ---------------------------
// LOOPS
// ---------------------------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();


// ---------------------------
// HISTÓRIA INICIAL
// ---------------------------
setTimeout(() => {
    showStoryScene("assets/cena1.png", [
        "Num dia, D.joao de Portugal foi para a guerra...",
        "Mas durante essa guerra, ninguem esperava que ele, o heroi portugues desapareceu...",
        "Depois que ele desapareceu, tudo mudou na vida de D.Madalena."
    ]);
}, 500);

setTimeout(() => {
    showStoryScene("assets/cena2.png", [
        "Todos os seus amigos e familiares foram no seu funeral...",
        "Todos estavam abalados, mas tinha uma pessoa que estava ainda mais abalada...",
        "D.Madalena, sua esposa estava muito abalada por saber a noticia que o seu homem faleceu durante a guerra..."
    ]);
}, 6000);

// Quando terminar história → fade → jogo
setTimeout(() => {
    startFadeOut(() => {
        // Quando ficar preto:
        gameState = "play";
        startFadeIn();
    });
}, 11000);
