// Canvas config
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 240;

// Player
let player = {
    x: 150,
    y: 120,
    width: 16,
    height: 16,
    speed: 2,
    sprite: new Image()
};

player.sprite.src = "assets/player.png";

// Cena atual
let currentScene = "mapa1";

let maps = {
    mapa1: "assets/mapa1.png",
    mapa2: "assets/mapa2.png"
};

let mapa = new Image();
mapa.src = maps[currentScene];

let keys = {};

// TECLAS
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    // Fechar diálogo ao pressionar espaço
    if (e.key === " " && dialogActive) {
        nextDialogLine();
    }
});

document.addEventListener("keyup", (e) => keys[e.key] = false);

// --- SISTEMA DE DIÁLOGO ---
let dialogActive = false;
let dialogIndex = 0;
let dialogLines = [];

function showDialog(lines) {
    dialogLines = lines;
    dialogIndex = 0;
    dialogActive = true;

    document.getElementById("dialogText").innerText = dialogLines[dialogIndex];
    document.getElementById("dialogBox").classList.remove("hidden");
}

function nextDialogLine() {
    dialogIndex++;
    if (dialogIndex >= dialogLines.length) {
        hideDialog();
        return;
    }
    document.getElementById("dialogText").innerText = dialogLines[dialogIndex];
}

function hideDialog() {
    dialogActive = false;
    document.getElementById("dialogBox").classList.add("hidden");
}

// --- TROCA DE CENAS ---
function changeScene(name) {
    currentScene = name;
    mapa.src = maps[name];

    // Se quiser resetar posição:
    player.x = 150;
    player.y = 120;
}

// --- SISTEMA PRINCIPAL ---
function update() {
    if (dialogActive) return; // Não move enquanto fala

    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    // Exemplo: ao chegar ao lado direito do mapa 1 → muda para mapa 2
    if (currentScene === "mapa1" && player.x > 300) {
        changeScene("mapa2");
        showDialog([
            "Você entrou na segunda sala!",
            "Continue explorando..."
        ]);
    }

    // Voltar para o mapa anterior
    if (currentScene === "mapa2" && player.x < 5) {
        changeScene("mapa1");
        showDialog([
            "Você voltou para a primeira sala."
        ]);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(mapa, 0, 0);
    ctx.drawImage(player.sprite, player.x, player.y);
}

// LOOP PRINCIPAL
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();

// Exemplo: diálogo inicial
setTimeout(() => {
    showDialog([
        "Olá viajante...",
        "Este é o começo da sua jornada.",
        "Use as setas para se mover."
    ]);
}, 800);
