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
// MENU FUNÇÕES
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
    alert("Mais tarde vamos colocar um menu de personagens com imagens. :)");
}

function abrirConfig() {
    alert("Futuramente podemos colocar: volume, fullscreen, controles, etc.");
}

function sair() {
    alert("Obrigado por jogar! (num jogo real, isto fecharia o programa)");
}

//--------------------------------------
// CUTSCENE AUTOMÁTICA COM LEGENDAS
//--------------------------------------
let scenes = [];
let sceneTexts = [
    "No início, ele vivia sozinho, distante de tudo e todos.",
    "Mas naquele dia... algo inesperado aconteceu.",
    "Uma luz surgiu, mudando o destino daquele jovem.",
    "Ele precisava seguir em frente, sem olhar para trás."
];

let sceneIndex = 0;
let sceneTimer = 0;
let sceneDuration = 4000; // ms por cena

let letraIndex = 0;
let textoAtual = "";
let tempoTexto = 0;
let velocidadeLetra = 30; // ms por letra

function iniciarCutscene() {
    gameState = "cutscene";
    scenes = [];

    for (let i = 1; i <= 4; i++) {
        let img = new Image();
        img.src = `assets/cenas/cena${i}.png`;
        scenes.push(img);
    }

    cutsceneMusic.play();
}

function updateCutscene(dt) {
    if (!cutsceneActive()) return;

    sceneTimer += dt;

    // typewriter
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
        tempoTexto = 0;

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

    // Caixa de legenda
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    ctx.fillStyle = "white";
    ctx.font = "22px Arial";
    ctx.fillText(textoAtual, 20, canvas.height - 40);
}

function cutsceneActive() {
    return sceneIndex < scenes.length;
}

//--------------------------------------
// GAMEPLAY (MAPAS + PLAYER + PORTAS)
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
mapImg.src = maps[currentMap].image;

function iniciarGameplay() {
    gameState = "play";
    mapImg.src = maps[currentMap].image;
    scenes = [];
    textoAtual = "";
    sceneIndex = 0;
    sceneTimer = 0;
    letraIndex = 0;
}

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

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

function interagirPorta() {
    for (let p of maps[currentMap].portas) {
        if (colisao(player.x, player.y, p)) {
            interactSound.play();
            currentMap = p.destino;
            mapImg.src = maps[currentMap].image;

            player.x = 200;
            player.y = 200;
        }
    }
}

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

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
