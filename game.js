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
cutsceneMusic.volume = 0.6;

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

function abrirPersonagens() { alert("Menu de personagens ainda não implementado."); }
function abrirConfig() { alert("Configurações ainda não implementadas."); }
function sair() { alert("Obrigado por jogar!"); }

//--------------------------------------
// CUTSCENE COM DIÁLOGO
//--------------------------------------
const cutsceneData = [
    { img: "assets/cenas/cena1.png", nome: "Narrador", texto: "No início, ele vivia sozinho, distante de tudo e todos." },
    { img: "assets/cenas/cena2.png", nome: "Narrador", texto: "Mas naquele dia... algo inesperado aconteceu." },
    { img: "assets/cenas/cena3.png", nome: "Narrador", texto: "Uma luz surgiu, mudando o destino daquele jovem." },
    { img: "assets/cenas/cena4.png", nome: "Narrador", texto: "Ele precisava seguir em frente, sem olhar para trás." }
];

let cutsceneIndex = 0;
let cutsceneTimer = 0;
let letraIndex = 0;
let mostrandoTexto = "";
let cutsceneDuration = 4500;
let velocidadeTexto = 35;
let cutsceneImg = new Image();
let cutsceneActive = true;

// Carregar primeira imagem
cutsceneImg.src = cutsceneData[0].img;

function updateCutscene(delta) {
    cutsceneTimer += delta;

    if (letraIndex < cutsceneData[cutsceneIndex].texto.length) {
        if (cutsceneTimer > velocidadeTexto) {
            mostrandoTexto += cutsceneData[cutsceneIndex].texto[letraIndex];
            letraIndex++;
            cutsceneTimer = 0;
        }
    }

    if (cutsceneTimer >= cutsceneDuration) {
        cutsceneIndex++;
        cutsceneTimer = 0;
        letraIndex = 0;
        mostrandoTexto = "";

        if (cutsceneIndex >= cutsceneData.length) {
            cutsceneActive = false;
            gameState = "gameplay";
            cutsceneMusic.pause();
            bgMusic.play();
            return;
        }

        cutsceneImg.src = cutsceneData[cutsceneIndex].img;
    }
}

function drawCutscene() {
    ctx.drawImage(cutsceneImg, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, canvas.height - 170, canvas.width, 170);

    ctx.fillStyle = "white";
    ctx.font = "28px serif";
    ctx.fillText(cutsceneData[cutsceneIndex].nome, 40, canvas.height - 135);

    ctx.font = "22px serif";
    ctx.fillText(mostrandoTexto, 40, canvas.height - 90);
}

//--------------------------------------
// GAMEPLAY (MAPAS + PLAYER + PORTAS)
//--------------------------------------
let player = { x: 200, y: 200, width: 64, height: 64, speed: 2, sprite: new Image() };
player.sprite.src = "assets/player.png";

let maps = {
    1: { image: "assets/mapa1.png", colliders: [ { x:0,y:0,w:640,h:10 },{x:0,y:470,w:640,h:10},{x:0,y:0,w:10,h:480},{x:630,y:0,w:10,h:480} ], portas: [ { x:500,y:200,w:60,h:80,destino:2 } ] },
    2: { image: "assets/mapa2.png", colliders: [ { x:0,y:0,w:640,h:10 },{x:0,y:470,w:640,h:10},{x:0,y:0,w:10,h:480},{x:630,y:0,w:10,h:480} ], portas: [ { x:50,y:200,w:60,h:80,destino:1 } ] }
};

let currentMap = 1;
let mapImg = new Image();
mapImg.src = maps[currentMap].image;

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function colisao(px, py, obj) {
    return px < obj.x + obj.w && px + player.width > obj.x && py < obj.y + obj.h && py + player.height > obj.y;
}

function podeMover(nx, ny) {
    for (let c of maps[currentMap].colliders) if (colisao(nx, ny, c)) return false;
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

function updatePlayer() {
    let nx = player.x;
    let ny = player.y;

    if (keys["ArrowUp"]) ny -= player.speed;
    if (keys["ArrowDown"]) ny += player.speed;
    if (keys["ArrowLeft"]) nx -= player.speed;
    if (keys["ArrowRight"]) nx += player.speed;

    if (podeMover(nx, ny)) { player.x = nx; player.y = ny; }

    if (keys["e"]) interagirPorta();
}

function drawGame() {
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

function gameLoop(timestamp) {
    let delta = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (cutsceneActive) { updateCutscene(delta); drawCutscene(); }
    else if (gameState === "gameplay") { updatePlayer(); drawGame(); }

    requestAnimationFrame(gameLoop);
}

gameLoop();
