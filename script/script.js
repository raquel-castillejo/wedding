// ─── Estado ───────────────────────────────────────────────────────────────────
const state = {
  opened: false,
  scrollHintVisible: false,
};

// ─── Referencias DOM ──────────────────────────────────────────────────────────
const envelopeContainer = document.querySelector(".envelope-container");
const envelopeTopFront = document.querySelector(".envelope-top-front");
const envelopeTopBack = document.querySelector(".envelope-top-back");
const letter = document.querySelector(".letter");
const hintToAction = document.getElementById("hint-to-action");
const hintTap = document.getElementById("hint-to-action__tap");
const hintScroll = document.getElementById("hint-to-action__scroll");
const invitationInfo = document.getElementById("invitation-info");
const letterBanner = document.getElementById("letter-banner");

// ─── 1. Centrar el sobre horizontalmente ──────────────────────────────────────
function centerEnvelope() {
  envelopeContainer.style.left = "50%";
  envelopeContainer.style.right = "unset";
  envelopeContainer.style.transform = "translateX(-50%)";
}
centerEnvelope();

// ─── 2. Pulso tap: opacidad 1 ↔ 0 cada 900 ms ────────────────────────────────
let tapPulseInterval = null;
let tapVisible = true;

function startTapPulse() {
  hintTap.style.opacity = "1";
  tapPulseInterval = setInterval(() => {
    tapVisible = !tapVisible;
    hintTap.style.opacity = tapVisible ? "1" : "0";
  }, 900);
}
startTapPulse();

// ─── 3. Click / Tap → animación de apertura del sobre ────────────────────────
function openEnvelope() {
  if (state.opened) return;
  state.opened = true;

  // Detener el pulso del hint-tap y ocultarlo
  clearInterval(tapPulseInterval);
  hintTap.style.transition = "opacity 300ms ease";
  hintTap.style.opacity = "0";
  setTimeout(() => {
    hintTap.style.display = "none";
  }, 300);

  const TOTAL = 2400;
  const SWAP_AT = TOTAL / 2; // 1200ms — justo cuando la solapa está de canto

  // La solapa frontal (cerrada) rota desde 0 hasta -90deg (mitad del recorrido)
  // transform-origin: bottom center → la punta del triángulo es el pivote
  envelopeTopFront.style.transition = `transform ${SWAP_AT}ms linear`;
  void envelopeTopFront.offsetWidth;
  envelopeTopFront.style.transform = "rotateX(-100deg)";

  setTimeout(() => {
    // Ocultamos la solapa cerrada instantáneamente (está de canto, invisible)
    envelopeTopFront.style.opacity = "0";
    envelopeTopFront.style.transition = "none";

    // La solapa abierta aparece ya en rotateX(90deg) (también de canto)
    // y completa el recorrido hasta 0deg
    envelopeTopBack.style.transition = "none";
    envelopeTopBack.style.transform = "rotateX(90deg)";
    envelopeTopBack.style.opacity = "1";

    // Forzamos reflow para que la transición de entrada funcione
    void envelopeTopBack.offsetWidth;

    envelopeTopBack.style.transition = `transform ${SWAP_AT}ms linear`;
    envelopeTopBack.style.transform = "rotateX(0deg)";
  }, SWAP_AT);

  setTimeout(afterOpen, TOTAL);
}

// ─── 4. Mover sobre + fade-in de la carta ────────────────────────────────────
function afterOpen() {
  const WAIT = 800; // ms de pausa antes de mover
  const MOVE_FADE = 600; // ms del movimiento + fade

  setTimeout(() => {
    // Transición del sobre a su posición final (definida en CSS con la clase)
    envelopeContainer.style.transition = `left ${MOVE_FADE}ms ease, right ${MOVE_FADE}ms ease, top ${MOVE_FADE}ms ease, transform ${MOVE_FADE}ms ease`;
    envelopeContainer.classList.add("envelope-container--final-position");

    // Fade-in de la carta
    letter.style.transition = `opacity ${MOVE_FADE}ms ease`;
    letter.style.opacity = "1";

    // ─── 5. Mostrar hint-scroll + invitation-info ─────────────────────────
    setTimeout(afterLetterAppeared, MOVE_FADE);
  }, WAIT);
}

// ─── 5. Hint scroll + invitation-info ────────────────────────────────────────
let scrollPulseInterval = null;
let scrollVisible = true;

function afterLetterAppeared() {
  // Mostrar invitation-info
  invitationInfo.classList.remove("not-displayed");

  // Pulso del hint-scroll: opacidad 1 ↔ 0 cada 600 ms
  hintScroll.style.opacity = "1";
  scrollPulseInterval = setInterval(() => {
    scrollVisible = !scrollVisible;
    hintScroll.style.opacity = scrollVisible ? "1" : "0";
  }, 600);

  state.scrollHintVisible = true;
}

// ─── 6. Al hacer scroll, ocultar hint-to-action ───────────────────────────────
function onScroll() {
  if (!state.scrollHintVisible) return;
  clearInterval(scrollPulseInterval);
  hintToAction.style.transition = "opacity 400ms ease";
  hintToAction.style.opacity = "0";
  setTimeout(() => {
    hintToAction.style.display = "none";
  }, 400);
  window.removeEventListener("scroll", onScroll);
  state.scrollHintVisible = false;
}
window.addEventListener("scroll", onScroll, { passive: true });

// ─── Eventos de apertura (click desktop + tap móvil) ─────────────────────────
letterBanner.addEventListener("click", openEnvelope);
letterBanner.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault(); // evita el click sintético posterior en móvil
    openEnvelope();
  },
  { passive: false },
);
