//--------------------------------------
// CONFIGURAÇÃO DO CANVAS
//--------------------------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 480;


//--------------------------------------
// ESTADOS DO JOGO
//--------------------------------------
let gameState = "cutscene";  
let currentScene = 0;
let cutsceneImages = [];


//--------------------------------------
// CARREGAR CENAS INICIAIS
//--------------------------------------
const cenasTotais = 4;  // <-- ALTERA AQUI SE TIVERES MAIS CENAS

for (let i = 1; i <= cenasTotais; i++) {
    let img = new Image();
    img.src = `assets/cenas/cena${i}.png`;
    cutsceneImages.push(img);
}


//--------------------------------------
// ÁUDIO
//--------------------------------------
let bgMusic = new Audio("assets/musica_fundo.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

let interactSound = new Audio("assets/efeito_interagir.wav");
interactSound.volume = 0.6;

let cutsceneMusic = new Audio("assets/musica_cutscene.mp3");
cutsceneMusic.volume = 0.8;
cutsceneMusic.loop = true;

cutsceneMusic.play();


//--------------------------------------
// PLAYER
//--------------------------------------
let player = {
    x: 200,
    y: 200,
    width: 64,
    height: 64,
    speed: 2,
    sprite: new Image()
};
player.sprite.src = "assets/player.png";


//--------------------------------------
// MAPAS
//--------------------------------------
let currentMap = 1;

let mapas = {
    1: {
        image: "assets/mapa1.png",
        colliders: [
            { x: 0, y: 0, w: 640, h: 10 },
            { x: 0, y: 470, w: 640, h: 10 },
            { x: 0, y: 0, w: 10, h: 480 },
            { x: 630, y: 0, w: 10, h: 480 }
        ],
        portas: [
            { x: 500, y: 200, w: 60, h: 80, destino: 2 }
        ]
    },

    2: {
        image: "assets/mapa2.png",
        colliders: [
            { x: 0, y: 0, w: 640, h: 10 },
            { x: 0, y: 470, w: 640, h: 10 },
            { x: 0, y: 0, w: 10, h: 480 },
            { x: 630, y: 0, w: 10, h: 480 }
        ],
        portas: [
            { x: 50, y: 200, w: 60, h: 80, destino: 1 }
        ]
    }
};

let mapaAtualImg = new Image();
mapaAtualImg.src = mapas[currentMap].image;


//--------------------------------------
// TECLAS
//--------------------------------------
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);


//--------------------------------------
// COLISÃO
//--------------------------------------
function colisaoComRetangulo(px, py, obj) {
    return (
        px < obj.x + obj.w &&
        px + player.width > obj.x &&
        py < obj.y + obj.h &&
        py + player.height > obj.y
    );
}

function podeMover(novoX, novoY) {
    for (let c of mapas[currentMap].colliders) {
        if (colisaoComRetangulo(novoX, novoY, c)) return false;
    }
    return true;
}


//--------------------------------------
// PORTAS
//--------------------------------------
function interagirPorta() {
    for (let p of mapas[currentMap].portas) {
        if (colisaoComRetangulo(player.x, player.y, p)) {

            interactSound.play();

            currentMap = p.destino;
            mapaAtualImg.src = mapas[currentMap].image;

            if (currentMap === 1) {
                player.x = 450;
                player.y = 200;
            }
            if (currentMap === 2) {
                player.x = 100;
                player.y = 200;
            }
        }
    }
}


//--------------------------------------
// UPDATE NORMAL
//--------------------------------------
function updateGame() {
    let nx = player.x;
    let ny = player.y;

    if (keys["ArrowUp"]) ny -= player.speed;
    if (keys["ArrowDown"]) ny += player.speed;
    if (keys["ArrowLeft"]) nx -= player.speed;
    if (keys["ArrowRight"]) nx += player.speed;

    if (podeMover(nx, ny)) {
        player.x = nx;
        player.y = ny;
    }

    if (keys["e"]) interagirPorta();
}


//--------------------------------------
// DRAW NORMAL
//--------------------------------------
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(mapaAtualImg, 0, 0, canvas.width, canvas.height);

    mapas[currentMap].portas.forEach(p => {
        if (colisaoComRetangulo(player.x, player.y, p)) {
            ctx.font = "22px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("Entrar (E)", p.x - 20, p.y - 10);
        }
    });

    ctx.drawImage(player.sprite, player.x, player.y, player.width, player.height);
}


//--------------------------------------
// CUTSCENE
//--------------------------------------
document.addEventListener("keydown", e => {
    if (gameState === "cutscene" && e.key === "Enter") {
        currentScene++;

        if (currentScene >= cutsceneImages.length) {
            gameState = "play";
            cutsceneMusic.pause();
            bgMusic.play();
        }
    }
});

function drawCutscene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let img = cutsceneImages[currentScene];

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Pressiona ENTER para continuar", 10, 460);
}


//--------------------------------------
// LOOP PRINCIPAL
//--------------------------------------
function loop() {

    if (gameState === "cutscene") {
        drawCutscene();
    } else {
        updateGame();
        drawGame();
    }

    requestAnimationFrame(loop);
}

loop();
