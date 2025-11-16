// =========================
// VARIÁVEIS PRINCIPAIS
// =========================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 720;

let currentMap = 0;
let mapaCarregado = false;
let mapImg = new Image();
let playerImg = new Image();
playerImg.src = "assets/player.png";

// =========================
// ÁUDIOS (corrigido)
// =========================
const menuMusic = new Audio("assets/musica_menu.mp3");
const cutsceneMusic = new Audio("assets/musica_cutscene.mp3");
const bgMusic = new Audio("assets/musica_fundo.mp3");
const interactSound = new Audio("assets/efeito_interagir.wav");

menuMusic.loop = true;
cutsceneMusic.loop = false;
bgMusic.loop = true;

// =========================
// MAPAS
// =========================
const maps = [
    { image: "assets/mapa1.png" },
    { image: "assets/mapa2.png" }
];

// =========================
// CUTSCENES
// =========================
let scenes = [];
let sceneIndex = 0;
let cutsceneActive = true;

// Carregar as 4 cenas existentes
for (let i = 1; i <= 4; i++) {
    let img = new Image();
    img.src = `assets/cenas/cena${i}.png`;
    scenes.push(img);
}

// =========================
// CARREGAR MAPA (corrigido)
// =========================
function loadMap(id) {
    mapaCarregado = false;
    mapImg = new Image();

    mapImg.onload = () => {
        mapaCarregado = true;
        console.log("Mapa carregado:", maps[id].image);
    };

    mapImg.onerror = () => {
        console.error("ERRO ao carregar mapa:", maps[id].image);
    };

    mapImg.src = maps[id].image;
}

loadMap(0); // carrega primeiro mapa

// =========================
// DESENHAR CUTSCENE (corrigido)
// =========================
function drawCutscene() {
    let img = scenes[sceneIndex];

    // evitar erro caso falhe o load
    if (!img) {
        console.error("Cena inexistente:", sceneIndex);
        endCutscene();
        return;
    }

    // esperar imagem carregar
    if (!img.complete) return;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

// =========================
// TERMINAR CUTSCENE (corrigido)
// =========================
function endCutscene() {
    cutsceneActive = false;
    cutsceneMusic.pause();
    iniciarGameplay();
}

// =========================
// GAMEPLAY
// =========================
let player = { x: 600, y: 350, speed: 4 };

// =========================
// INICIAR GAMEPLAY (corrigido)
// =========================
function iniciarGameplay() {
    console.log("Gameplay iniciado!");

    // Garantir que o canvas aparece
    canvas.style.display = "block";

    bgMusic.play();
}

// =========================
// LOOP PRINCIPAL (corrigido)
// =========================
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (cutsceneActive) {
        drawCutscene();
    } else {
        if (mapaCarregado) {
            ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillText("A carregar mapa...", 20, 20);
        }

        ctx.drawImage(playerImg, player.x, player.y, 64, 64);
    }

    requestAnimationFrame(loop);
}

loop();

// =========================
// CONTROLOS
// =========================
document.addEventListener("keydown", (e) => {
    if (cutsceneActive && e.key === " ") {
        sceneIndex++;
        if (sceneIndex >= scenes.length) {
            endCutscene();
        }
    }

    if (!cutsceneActive) {
        if (e.key === "ArrowUp") player.y -= player.speed;
        if (e.key === "ArrowDown") player.y += player.speed;
        if (e.key === "ArrowLeft") player.x -= player.speed;
        if (e.key === "ArrowRight") player.x += player.speed;
    }
});
