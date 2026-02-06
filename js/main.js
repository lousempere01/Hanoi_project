// js/main.js
import { annulerDernierCoup, initialiserJeu } from "./game.js";
import {
  afficherJeu,
  afficherMessage,
  lierEvenements,
  mettreAJourCompteurCoups,
  resetSelection,
  setPaused,
  isPaused,
  setStartLock,   
  setOnStart 
} from "./ui.js";

// ===== TIMER (simple) =====
let seconds = 0;
let timerId = null;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function updateTimerUI() {
  const el = document.getElementById("timer");
  if (el) el.textContent = formatTime(seconds);
}

function startTimer() {
  if (timerId) return;
  timerId = setInterval(() => {
    seconds++;
    updateTimerUI();
  }, 1000);
}

function stopTimer() {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
}

function resetTimer() {
  stopTimer();
  seconds = 0;
  updateTimerUI();
}

// ===== PAUSE POPUP =====
function ensurePauseOverlay() {
  if (document.getElementById("pauseOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "pauseOverlay";
  overlay.innerHTML = `
    <div class="pauseModal" role="dialog" aria-modal="true" aria-label="Pause">
      <h2>Pause</h2>
      <p>Le jeu est en pause. Les déplacements sont bloqués.</p>
      <button id="resumeBtn" type="button">Reprendre</button>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    // clic hors de la boîte = reprendre (optionnel)
    if (e.target === overlay) togglePause();
  });

  const resumeBtn = document.getElementById("resumeBtn");
  if (resumeBtn) resumeBtn.addEventListener("click", togglePause);
}

function setControlsDisabled(disabled) {
  const ids = ["diskCount", "colorPalette", "undoBtn", "restartBtn"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  });
}

// Fonction pour lancer une partie
function demarrer(n) {
  initialiserJeu(n);
  resetSelection();
  afficherJeu();
  mettreAJourCompteurCoups();

  // Reset timer MAIS ne démarre pas tout de suite
  resetTimer();
  stopTimer();

  // Jeu pas en pause, mais verrouillé jusqu’au 1er clic
  setPaused(false);
  setStartLock(true);

  afficherMessage("Clique sur une tour pour démarrer (timer inclus).", "info");

  // Si tu as un overlay pause, on le ferme au restart
  document.body.classList.remove("paused");
  const overlay = document.getElementById("pauseOverlay");
  if (overlay) overlay.classList.remove("show");

  // Les contrôles restent utilisables avant de commencer (à toi de voir)
  setControlsDisabled(false);
}


function togglePause() {
  ensurePauseOverlay();

  const overlay = document.getElementById("pauseOverlay");
  const pauseBtn = document.getElementById("pauseBtn");

  const next = !isPaused();
  setPaused(next);

  if (next) {
    // PAUSE
    stopTimer();
    document.body.classList.add("paused");
    if (overlay) overlay.classList.add("show");
    if (pauseBtn) pauseBtn.textContent = "Reprendre";
    setControlsDisabled(true);
    afficherMessage("Jeu en pause.", "info");
  } else {
    // REPRENDRE
    startTimer();
    document.body.classList.remove("paused");
    if (overlay) overlay.classList.remove("show");
    if (pauseBtn) pauseBtn.textContent = "Pause";
    setControlsDisabled(false);
    afficherMessage("Reprise du jeu.", "info");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const selectDisques = document.getElementById("diskCount");
  const btnRecommencer = document.getElementById("restartBtn");
  const undoBtn = document.getElementById("undoBtn");
  const pauseBtn = document.getElementById("pauseBtn");

  ensurePauseOverlay();

  // branche les tours + palette
  lierEvenements();

  // Quand ui.js débloque au 1er clic, on lance le timer ici (main.js)
  setOnStart(() => {
    startTimer();
    afficherMessage("Bonne chance", "info");
  });


  // Recommencer
  btnRecommencer.addEventListener("click", () => {
    demarrer(selectDisques.value);
  });

  // Changer nb disques
  selectDisques.addEventListener("change", () => {
    demarrer(selectDisques.value);
  });

  // Annuler
  undoBtn.addEventListener("click", () => {
    // si pause, on ne fait rien
    if (isPaused()) return;

    const resultat = annulerDernierCoup();
    if (resultat.ok) {
      afficherJeu();
      mettreAJourCompteurCoups();
      resetSelection();
      afficherMessage("Dernier coup annulé", "info");
    } else {
      afficherMessage(resultat.message, "error");
    }
  });

  // Pause
  pauseBtn.addEventListener("click", togglePause);

  // Démarrage
  demarrer(selectDisques.value);
});
