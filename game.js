//--------------------------------------
// ESTADOS DO JOGO
//--------------------------------------
let gameState = "menu";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;

//--------------------------------------
// MÚSICAS
//--------------------------------------
let menuMusic = new Audio("assets/musica_menu.mp3");
menuMusic.loop = true;
menuMusic.volume = 0.5;

let cutsceneMusic = new Audio("assets/musica_cutscene.mp3");
cutsceneMusic.loop = true;
cutsceneMusic.volume = 0.8;

let bgMusic = new Audio("assets/musica_fundo.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

let interactSound = new Audio("assets/efeito_interagir.wav");
interactSound.volume = 0.6;

menuMusic.play();

//--------------------------------------
// MENU AÇÕES
//--------------------------------------
function iniciarJogo() {
    let menu = document.getElementById("menu");
    menu.style.animation = "fadeOut 1s forwards";

    setTimeout(() => {
        menu.style.display = "none";
        canvas.style.display = "block";

        menuMusic.pause();
        iniciarCutscene();
    }, 1000);
}

function abrirPersonagens() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("tela-personagens").style.display = "flex";
}

function voltarMenu() {
    document.getElementById("tela-personagens").style.display = "none";
    document.getElementById("menu").style.display = "flex";
}

function abrirConfig() {
    alert("Futuramente: volume, fullscreen, controles etc.");
}

function sair() {
    alert("Obrigado por jogar!");
}

//--------------------------------------
// CUTSCENE SISTEMA
//--------------------------------------
let scenes = [];
let sceneTexts = [
    'Manuel de Souza Coutinho, depois de ver que D.João de Portugal desapareceu quis casar com a D.Madalena.',
    'Depois disso o governo queria fugir para casa deles, Manuel De Souza coutinho queima a sua propria casa onde vivia ele, sua esposa e filha de D.Madalena.',
    'Logo apos isso, Manuel De Souza Coutinho vai viver juntamente com a sua mulher em casa de seu antigo homem, D.João de Portugal.',
    'Um  tempo depois, D.João de Portugal volta para sua casa e descobre que sua esposa, D.Madalena esta casada com o Manuel De Souza Coutinho.',
    'Continua...'
];

let sceneIndex = 0;
let sceneTimer = 0;
let sceneDuration = 4000;

// texto animado
let letraIndex = 0;
let textoAtual = "";
let tempoTexto = 0;
let velocidadeLetra = 30;

function iniciarCutscene() {
    gameState = "cutscene";
    scenes = [];
    sceneIndex = 0;
    textoAtual = "";
    letraIndex = 0;

    for (let i = 1; i <= 5; i++) {
        let img = new Image();
        img.src = `assets/cenas/cena${i}.png`;
        scenes.push(img);
    }

    cutsceneMusic.play();
}

function updateCutscene(dt) {
    sceneTimer += dt;

    tempoTexto += dt;
    if (letraIndex < sceneTexts[sceneIndex].length && tempoTexto > velocidadeLetra) {
        textoAtual += sceneTexts[sceneIndex][letraIndex];
        letraIndex++;
        tempoTexto = 0;
    }

    if (sceneTimer >= sceneDuration) {
        sceneTimer = 0;
        sceneIndex++;
        letraIndex = 0;
        textoAtual = "";

        if (sceneIndex >= scenes.length) {
            cutsceneMusic.pause();
            bgMusic.play();
            iniciarGameplay();
        }
    }
}

function drawCutscene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let img = scenes[sceneIndex];
    if (img.complete) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    ctx.fillStyle = "white";
    ctx.font = "22px Arial";
    ctx.fillText(textoAtual, 20, canvas.height - 40);
}

//--------------------------------------
// GAMEPLAY
//--------------------------------------
let player = {
    x: 200, y: 200,
    width: 64, height: 64,
    speed: 2,
    sprite: new Image()
};
player.sprite.src = "assets/player.png";

let maps = {
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

let currentMap = 1;

let mapImg = new Image();
let mapaCarregado = false;

mapImg.onload = () => mapaCarregado = true;
mapImg.src = maps[currentMap].image;

function iniciarGameplay() {
    gameState = "play";
    loadMap(currentMap);
}

function loadMap(id) {
    mapaCarregado = false;
    mapImg = new Image();
    mapImg.onload = () => mapaCarregado = true;
    mapImg.src = maps[id].image;
}

//--------------------------------------
// CONTROLES
//--------------------------------------
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

//--------------------------------------
// COLISÃO
//--------------------------------------
function colisao(px, py, obj) {
    return (
        px < obj.x + obj.w &&
        px + player.width > obj.x &&
        py < obj.y + obj.h &&
        py + player.height > obj.y
    );
}

function podeMover(nx, ny) {
    for (let c of maps[currentMap].colliders) {
        if (colisao(nx, ny, c)) return false;
    }
    return true;
}

//--------------------------------------
// PORTAS
//--------------------------------------
function interagirPorta() {
    for (let p of maps[currentMap].portas) {
        if (colisao(player.x, player.y, p)) {
            interactSound.play();
            currentMap = p.destino;
            loadMap(currentMap);
            player.x = 200;
            player.y = 200;
        }
    }
}

//--------------------------------------
// UPDATE GAME
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
// DRAW GAME
//--------------------------------------
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!mapaCarregado) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("A carregar mapa...", 20, 40);
        return;
    }

    ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);

    maps[currentMap].portas.forEach(p => {
        if (colisao(player.x, player.y, p)) {
            ctx.fillStyle = "white";
            ctx.font = "22px Arial";
            ctx.fillText("Interagir (E)", p.x - 15, p.y - 10);
        }
    });

    ctx.drawImage(player.sprite, player.x, player.y, player.width, player.height);
}

//--------------------------------------
// LOOP PRINCIPAL
//--------------------------------------
let lastTime = 0;

function loop(timestamp) {
    let dt = timestamp - lastTime;
    lastTime = timestamp;

    if (gameState === "cutscene") {
        updateCutscene(dt);
        drawCutscene();
    } else if (gameState === "play") {
        updateGame();
        drawGame();
    }

    requestAnimationFrame(loop);
}

loop();
