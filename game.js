/* -----------------------------
   CONFIGURAÇÕES / EDITAR AQUI
   -----------------------------
   - Substitui as frases em `SCENE_TEXTS` por tuas frases reais.
   - Substitui as imagens em assets/cenas/cena1.png ... cena10.png
   - Substitui as imagens de personagens em assets/personagens/personagemX.png
   - Se quiseres mudar o tamanho do canvas, altera canvas.width/height abaixo.
*/

// ---------- canvas ----------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 960;  // podes alterar
canvas.height = 540; // podes alterar

// ---------- menu music (opcional) ----------
let menuMusic = new Audio("assets/musica_menu.mp3");
menuMusic.loop = true;
menuMusic.volume = 0.5;
// não tocamos automaticamente para evitar bloqueios do browser

// ---------- SCENES TEXTS (EDITA AQUI) ----------
/* formato: array de 10 arrays, cada um com 2 strings (frase1, frase2) */
const SCENE_TEXTS = [
  ["(EDITAR) Cena1 — frase 1", "(EDITAR) Cena1 — frase 2"],
  ["(EDITAR) Cena2 — frase 1", "(EDITAR) Cena2 — frase 2"],
  ["(EDITAR) Cena3 — frase 1", "(EDITAR) Cena3 — frase 2"],
  ["(EDITAR) Cena4 — frase 1", "(EDITAR) Cena4 — frase 2"],
  ["(EDITAR) Cena5 — frase 1", "(EDITAR) Cena5 — frase 2"],
  ["(EDITAR) Cena6 — frase 1", "(EDITAR) Cena6 — frase 2"],
  ["(EDITAR) Cena7 — frase 1", "(EDITAR) Cena7 — frase 2"],
  ["(EDITAR) Cena8 — frase 1", "(EDITAR) Cena8 — frase 2"],
  ["(EDITAR) Cena9 — frase 1", "(EDITAR) Cena9 — frase 2"],
  ["(EDITAR) Cena10 — frase 1", "(EDITAR) Cena10 — frase 2"]
];

// ---------- PERSONAGENS (EDITA AQUI) ----------
/* cada item: { name: "Nome", img: "personagemX.png", desc: "texto curto" } 
   as imagens devem existir em: assets/personagens/<img>
*/
const CHARACTERS = [
  { name: "Arion", img: "personagem1.png", desc: "Descrição de Arion." },
  { name: "Selene", img: "personagem2.png", desc: "Descrição de Selene." },
  { name: "Kael", img: "personagem3.png", desc: "Descrição de Kael." },
  { name: "Mira", img: "personagem4.png", desc: "Descrição de Mira." },
  { name: "Rowan", img: "personagem5.png", desc: "Descrição de Rowan." },
  { name: "Lyra", img: "personagem6.png", desc: "Descrição de Lyra." },
  { name: "Tarek", img: "personagem7.png", desc: "Descrição de Tarek." },
  { name: "Elora", img: "personagem8.png", desc: "Descrição de Elora." },
  { name: "Draven", img: "personagem9.png", desc: "Descrição de Draven." },
  { name: "Nyla", img: "personagem10.png", desc: "Descrição de Nyla." },
  { name: "Oren", img: "personagem11.png", desc: "Descrição de Oren." },
  { name: "Faylen", img: "personagem12.png", desc: "Descrição de Faylen." },
  { name: "Sirius", img: "personagem13.png", desc: "Descrição de Sirius." },
  { name: "Nara", img: "personagem14.png", desc: "Descrição de Nara." }
];

// ---------- Variáveis da cutscene ----------
let scenes = [];         // imagens (carregadas)
let currentScene = 0;    // 0..9
let currentPhrase = 0;   // 0 ou 1
let typingIndex = 0;     // index da letra
let typingSpeed = 30;    // ms por letra
let typingTimer = 0;
let displayedText = "";
let isTyping = false;    // se está a fazer typewriter
let awaitingSpace = false; // se terminou a frase e espera espaço

// ---------- carregar imagens das cenas ----------
function preloadScenes() {
  scenes = [];
  for (let i = 1; i <= 10; i++) {
    const img = new Image();
    img.src = `assets/cenas/cena${i}.png`;
    scenes.push(img);
  }
}
preloadScenes();

// ---------- controle do menu ----------
function iniciarJogo() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("tela-personagens").classList.add("hidden");
  document.getElementById("tela-final").classList.add("hidden");
  canvas.style.display = "block";
  menuMusic.pause();

  // start cutscene
  currentScene = 0;
  currentPhrase = 0;
  displayedText = "";
  typingIndex = 0;
  typingTimer = 0;
  isTyping = true;
  awaitingSpace = false;
  // (opcional) tocar musica do menu só depois do clique:
  // menuMusic.play();

  // ensure first scene image exists (no crash if missing)
  requestAnimationFrame(loop);
}

function abrirPersonagens() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("tela-personagens").classList.remove("hidden");
  canvas.style.display = "none";
  populateCharacters();
}

function voltarMenu() {
  document.getElementById("tela-personagens").classList.add("hidden");
  document.getElementById("tela-final").classList.add("hidden");
  document.getElementById("menu").style.display = "flex";
  canvas.style.display = "none";
}

function sair() {
  // tenta fechar a janela (funciona se a janela foi aberta por script). fallback para about:blank
  try { window.open('', '_self').close(); } catch(e) {}
  // fallback
  window.location.href = "about:blank";
}

/* ---------------------------
   Personagens: carrossel A
   --------------------------- */
let currentChar = 0;
function populateCharacters() {
  const nameEl = document.getElementById("charName");
  const imgEl = document.getElementById("charImg");
  const descEl = document.getElementById("charDesc");
  const thumbs = document.getElementById("charThumbs");

  if (!nameEl) return;

  // set current
  currentChar = 0;
  imgEl.src = `assets/personagens/${CHARACTERS[currentChar].img}`;
  nameEl.textContent = CHARACTERS[currentChar].name;
  descEl.textContent = CHARACTERS[currentChar].desc;

  // thumbs
  thumbs.innerHTML = "";
  CHARACTERS.forEach((c, idx) => {
    const t = document.createElement("img");
    t.src = `assets/personagens/${c.img}`;
    t.className = "thumb";
    t.title = c.name;
    t.onclick = () => {
      currentChar = idx;
      imgEl.src = `assets/personagens/${CHARACTERS[currentChar].img}`;
      nameEl.textContent = CHARACTERS[currentChar].name;
      descEl.textContent = CHARACTERS[currentChar].desc;
    };
    thumbs.appendChild(t);
  });
}

function changeChar(delta) {
  currentChar += delta;
  if (currentChar < 0) currentChar = CHARACTERS.length - 1;
  if (currentChar >= CHARACTERS.length) currentChar = 0;
  const imgEl = document.getElementById("charImg");
  const nameEl = document.getElementById("charName");
  const descEl = document.getElementById("charDesc");
  imgEl.src = `assets/personagens/${CHARACTERS[currentChar].img}`;
  nameEl.textContent = CHARACTERS[currentChar].name;
  descEl.textContent = CHARACTERS[currentChar].desc;
}

/* ---------------------------
   Cutscene: teclas e tipo
   --------------------------- */
document.addEventListener("keydown", (e) => {
  if (gameStateIsCutscene() === false) return;
  if (e.code === "Space") {
    e.preventDefault();
    // se estiver a 'typear', completa a frase
    if (isTyping) {
      const full = SCENE_TEXTS[currentScene][currentPhrase];
      displayedText = full;
      isTyping = false;
      awaitingSpace = true;
    } else if (awaitingSpace) {
      // espaço quando já terminou a frase -> avança para a próxima frase/scene
      advancePhraseOrScene();
    }
  }
});

function gameStateIsCutscene() {
  // canvas visible e estamos em cutscene (currentScene < scenes.length)
  return canvas.style.display !== "none";
}

function advancePhraseOrScene() {
  if (currentPhrase === 0) {
    currentPhrase = 1;
    displayedText = "";
    typingIndex = 0;
    isTyping = true;
    awaitingSpace = false;
  } else {
    // ir para próxima cena
    currentScene++;
    currentPhrase = 0;
    displayedText = "";
    typingIndex = 0;
    isTyping = true;
    awaitingSpace = false;
    if (currentScene >= scenes.length) {
      endCutscene();
    }
  }
}

function endCutscene() {
  // hide canvas and show final screen
  canvas.style.display = "none";
  document.getElementById("tela-final").classList.remove("hidden");
}

/* ---------------------------
   Draw / Loop
   --------------------------- */
let last = performance.now();
function loop(now) {
  const dt = now - last;
  last = now;

  // update typing
  if (canvas.style.display !== "none" && currentScene < scenes.length) {
    const sceneImg = scenes[currentScene];
    // typing logic
    if (isTyping) {
      typingTimer += dt;
      if (typingTimer >= typingSpeed) {
        const full = SCENE_TEXTS[currentScene][currentPhrase];
        typingTimer = 0;
        if (typingIndex < full.length) {
          displayedText += full[typingIndex];
          typingIndex++;
        } else {
          // finished typing
          isTyping = false;
          awaitingSpace = true;
        }
      }
    }

    // draw
    drawScene();
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

function drawScene() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // background (fallback)
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw scene image if loaded
  const img = scenes[currentScene];
  if (img && img.complete && img.naturalWidth !== 0) {
    // maintain cover by drawing to full canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } else {
    // placeholder text
    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText("Imagem da cena não encontrada: assets/cenas/cena" + (currentScene+1) + ".png", 20, 40);
  }

  // draw black translucent box
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, canvas.height - 140, canvas.width, 140);

  // draw displayedText (multi-line wrap)
  ctx.fillStyle = "#fff";
  ctx.font = "22px Arial";
  drawWrappedText(displayedText, 28, canvas.height - 90, canvas.width - 56, 26);
  // hint
  if (!isTyping && awaitingSpace) {
    ctx.font = "18px Arial";
    ctx.fillStyle = "#cfcfcf";
    ctx.fillText("Pressiona ESPAÇO para continuar", canvas.width - 320, canvas.height - 22);
  }
}

// helper: wrap text
function drawWrappedText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

/* ---------------------------
   Final helpers: voltar ao menu
   --------------------------- */
function voltarAoMenu() {
  document.getElementById("tela-final").classList.add("hidden");
  document.getElementById("menu").style.display = "flex";
}

/* ---------------------------
   Onde editar:
   - SCENE_TEXTS: linhas no topo do ficheiro (array de arrays)
   - CHARACTERS: array com 14 personagens (nome / imagem / desc)
   - imagens: colocar em assets/cenas/cena1.png ... cena10.png
             e assets/personagens/personagem1.png ... personagem14.png
*/
