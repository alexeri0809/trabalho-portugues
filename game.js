//--------------------------------------
// CONFIGURAÇÃO DO CANVAS
//--------------------------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 480;

let gameState = "play";


//--------------------------------------
// ÁUDIO
//--------------------------------------
let bgMusic = new Audio("assets/musica_fundo.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

let interactSound = new Audio("assets/efeito_interagir.wav");
interactSound.volume = 0.6;

bgMusic.play();


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
// MAPAS + PORTAS + COLISÕES
//--------------------------------------
let currentMap = 1;

let mapas = {
    1: {
        image: "assets/mapa1.png",

        // colisões
        colliders: [
            { x: 0, y: 0, w: 640, h: 10 },     
            { x: 0, y: 470, w: 640, h: 10 },   
            { x: 0, y: 0, w: 10, h: 480 },     
            { x: 630, y: 0, w: 10, h: 480 }    
        ],

        // portas
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
// COLISÃO BÁSICA
//--------------------------------------
function colisaoComRetangulo(px, py, obj) {
    return (
        px < obj.x + obj.w &&
        px + player.width > obj.x &&
        py < obj.y + obj.h &&
        py + player.height > obj.y
    );
}

// impede atravessar paredes
function podeMover(novoX, novoY) {
    let col = mapas[currentMap].colliders;

    for (let c of col) {
        if (colisaoComRetangulo(novoX, novoY, c)) {
            return false;
        }
    }
    return true;
}


//--------------------------------------
// PORTAS — TROCAR DE MAPA
//--------------------------------------
function interagirPorta() {
    let portas = mapas[currentMap].portas;

    for (let p of portas) {
        if (colisaoComRetangulo(player.x, player.y, p)) {

            interactSound.play();

            currentMap = p.destino;
            mapaAtualImg.src = mapas[currentMap].image;

            // posição ao entrar no mapa novo
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
// UPDATE
//--------------------------------------
function update() {
    let novoX = player.x;
    let novoY = player.y;

    if (keys["ArrowUp"]) novoY -= player.speed;
    if (keys["ArrowDown"]) novoY += player.speed;
    if (keys["ArrowLeft"]) novoX -= player.speed;
    if (keys["ArrowRight"]) novoX += player.speed;

    if (podeMover(novoX, novoY)) {
        player.x = novoX;
        player.y = novoY;
    }

    if (keys["e"]) interagirPorta();
}


//--------------------------------------
// DRAW
//--------------------------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(mapaAtualImg, 0, 0, canvas.width, canvas.height);

    // portas invisíveis + mostrar "Entrar"
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
// LOOP
//--------------------------------------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
