// js/main.js
import { annulerDernierCoup, gameState, initialiserJeu } from "./game.js";
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

// ===== TIMER =====
let seconds = 0;
let timerId = null;

// Convertir les secondes en format mm:ss
function formatTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

// Affiche le temps sur l'interface
function updateTimerUI() {
  const el = document.getElementById("timer");
  if (el) el.textContent = formatTime(seconds);
}

// Lance le chronomètre
function startTimer() {
  if (timerId) return; // Evite de lancer plusieurs timers en même temps
  timerId = setInterval(() => {
    seconds++;
    updateTimerUI();
  }, 1000);
}

// Arrête le chronomètre
function stopTimer() {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
}

// Réinitialise le chronomètre à 0
function resetTimer() {
  stopTimer();
  seconds = 0;
  updateTimerUI();
}

// ===== PAUSE POPUP =====

// Crée une superposition pour le mode pause, si elle n'existe pas déjà
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

  // Reprendre le jeu en cliquant sur la superposition ou le bouton
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) togglePause();
  });

  const resumeBtn = document.getElementById("resumeBtn");
  if (resumeBtn) resumeBtn.addEventListener("click", togglePause);
}

// Active ou désactive les boutons selon l'état du jeu
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
      // S'active uniquement s'il y a des coups à annuler
      undoBtn.disabled = gameState.history.length === 0;
    }
  }
}

// Alterne entre les états de jeu en pause et en cours
function togglePause() {
  ensurePauseOverlay();

  const overlay = document.getElementById("pauseOverlay");
  const pauseBtn = document.getElementById("pauseBtn");

  const next = !isPaused(); // Inverse l'état actuel
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
      startTimer(); // Relance le chrono seulement si la partie a déjà commencé
    }

    document.body.classList.remove("paused");
    if (overlay) overlay.classList.remove("show");
    if (pauseBtn) pauseBtn.textContent = "Pause";
    setControlsDisabled(false);
    afficherMessage("Reprise du jeu.", "info");
  }
}

// ===== DEMARRAGE DU JEU =====

// Fonction principale pour démarrer ou redémarrer une partie
function demarrer(n) {
  // Vérifie si le mode défi est activé
  const challengeBtn = document.getElementById("challengeBtn");
  const isChallenge = challengeBtn ? challengeBtn.classList.contains("active") : false;

  // Prépare la logique du jeu (game.js) et l'affichage (ui.js)
  initialiserJeu(n, isChallenge);
  resetSelection();
  afficherJeu();
  mettreAJourCompteurCoups();

  // Remet le temps à zéro
  resetTimer();
  stopTimer();

  // Bloque les actions jusqu'au premier clic
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

// ===== EVENEMENTS GLOBAUX =====

document.addEventListener("DOMContentLoaded", () => {
  // Récupération des éléments du DOM
  const selectDisques = document.getElementById("diskCount");
  const btnRecommencer = document.getElementById("restartBtn");
  const undoBtn = document.getElementById("undoBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const challengeBtn = document.getElementById("challengeBtn");

  ensurePauseOverlay();
  lierEvenements(); // Lie les clics sur les tours (dans ui.js)

  // Signaux envoyés par ui.js
  setOnStart(() => {
    startTimer(); // Démarre le chronomètre au premier clic sur une tour
    afficherMessage("Bonne chance", "info");
  });

  setOnWin(() => {
    stopTimer(); // Fige le chronomètre à la victoire
  });

  // --- Actions des boutons ---
  
  // Bouton de mode défi
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
      // On redémarre la partie pour appliquer le nouveau mode
      demarrer(selectDisques.value);
    });
  }

  // Bouton recommencer
  btnRecommencer.addEventListener("click", () => {
    demarrer(selectDisques.value);
  });
  
  // Changement du nombre de disques
  selectDisques.addEventListener("change", () => {
    demarrer(selectDisques.value);
  });

  // Bouton annuler
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

  // Bouton pause
  pauseBtn.addEventListener("click", togglePause);

  // Lancement automatique de la partie au chargement de la page
  demarrer(selectDisques.value);
});
