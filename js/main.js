// js/main.js
import { annulerDernierCoup, initialiserJeu } from "./game.js";
import {
  afficherJeu,
  afficherMessage,
  isPaused,
  isStartLocked,
  lierEvenements,
  mettreAJourCompteurCoups,
  resetSelection,
  setOnStart,
  setOnWin,
  setPaused,
  setStartLock
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
    if (e.target === overlay) togglePause();
  });

  const resumeBtn = document.getElementById("resumeBtn");
  if (resumeBtn) resumeBtn.addEventListener("click", togglePause);
}

function setControlsDisabled(disabled) {
  const ids = ["diskCount", "colorPalette", "restartBtn"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  });

  //Gestion intelligente du bouton annuler
  const undoBtn = document.getElementById("undoBtn");
  if (undoBtn) {
    if (disabled) {
      // Si le jeu est en pause, on désactive le bouton annuler
      undoBtn.disabled = true;
    } else {
      // Si le jeu tourne (ou démarre), il n'est actif que s'il y a un historique
      undoBtn.disabled - gameState.history.length === 0;
    }
  }
}

// Fonction pour lancer une partie
function demarrer(n) {

  const challengeBtn = document.getElementById("challengeBtn");
  const isChallenge = challengeBtn ? challengeBtn.classList.contains("active") : false;

  initialiserJeu(n, isChallenge);
  resetSelection();
  afficherJeu();
  mettreAJourCompteurCoups();

  resetTimer();
  stopTimer();

  setPaused(false);
  setStartLock(true);

  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.textContent = "Pause";

  afficherMessage("Clique sur une tour pour démarrer (timer inclus).", "info");

  document.body.classList.remove("paused");
  const overlay = document.getElementById("pauseOverlay");
  if (overlay) overlay.classList.remove("show");

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
    if (!isStartLocked()) {
      startTimer();
    }

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
  const challengeBtn = document.getElementById("challengeBtn");

  ensurePauseOverlay();
  lierEvenements();

  setOnStart(() => {
    startTimer();
    afficherMessage("Bonne chance", "info");
  });

  setOnWin(() => {
    stopTimer();
  });

  if (challengeBtn) {
    challengeBtn.addEventListener("click", () => {
      // On bascule l'état du mode défi
      challengeBtn.classList.toggle("active");
      // On change le texte du bouton en fonction de l'état
      if (challengeBtn.classList.contains("active")) {
        challengeBtn.textContent = "Mode défi : ON";
      } else {
        challengeBtn.textContent = "Mode défi : OFF";
      }
      // On redémarre la partie pour appliquer le changement
      demarrer(selectDisques.value);
    });
  }

  btnRecommencer.addEventListener("click", () => {
    demarrer(selectDisques.value);
  });

  selectDisques.addEventListener("change", () => {
    demarrer(selectDisques.value);
  });

  undoBtn.addEventListener("click", () => {
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

  pauseBtn.addEventListener("click", togglePause);

  demarrer(selectDisques.value);
});
