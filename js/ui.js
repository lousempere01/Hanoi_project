// js/ui.js
import { deplacerDisque, gameState, verifierVictoire } from "./game.js";

let selectedTower = null;
let currentPalette = "fire";

// Verrou de démarrage : tant que true, le premier clic lance la partie + timer
let startLocked = true;

// Fonction appelée au moment où on débloque (définie dans main.js)
let onStart = null;

export function setStartLock(value) {
  startLocked = !!value;
  if (startLocked) resetSelection();
}

export function setOnStart(callback) {
  onStart = callback;
}


// Etat de pause (géré depuis main.js)
let paused = false;

export function setPaused(value) {
  paused = !!value;
  // En pause, on annule la sélection en cours pour éviter les états chelous
  if (paused) resetSelection();
}

export function isPaused() {
  return paused;
}

const palettes = {
  fire: (ratio) => {
    const hue = ratio * 55;
    const light = 45 + ratio * 30;
    return `hsl(${hue}, 85%, ${light}%)`;
  },
  jade: (ratio) => {
    const hue = 165;
    const light = 35 + ratio * 40;
    return `hsl(${hue}, 55%, ${light}%)`;
  },
  ice: (ratio) => {
    const hue = 210;
    const sat = 60 - ratio * 40;
    const light = 50 + ratio * 35;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  },
  gold: (ratio) => {
    const hue = 45;
    const light = 40 + ratio * 35;
    return `hsl(${hue}, 80%, ${light}%)`;
  },
};

export function afficherJeu() {
  const towers = document.querySelectorAll(".tower");
  const max = gameState.diskCount;

  towers.forEach((towerEl) => {
    const idx = Number(towerEl.dataset.tower);
    const arr = gameState.towers[idx];

    towerEl.querySelectorAll(".disk").forEach((d) => d.remove());

    for (let i = arr.length - 1; i >= 0; i--) {
      const size = arr[i];

      const disk = document.createElement("div");
      disk.className = "disk";

      const ratio = (size - 1) / (max - 1 || 1);
      const invRatio = 1 - ratio;

      const width = 30 + ratio * 60;
      disk.style.width = `${width}%`;

      const paletteFn = palettes[currentPalette] || palettes.fire;
      disk.style.background = paletteFn(invRatio);

      towerEl.appendChild(disk);
    }
  });

  updateSelectionUI();

  // désactive "annuler" si pas d'historique
  const undoBtn = document.getElementById("undoBtn");
  if (undoBtn) undoBtn.disabled = !gameState.history || gameState.history.length === 0;
}

export function mettreAJourCompteurCoups() {
  const el = document.getElementById("movesCount");
  if (el) el.textContent = String(gameState.moveCount);
}

export function afficherMessage(message, type = "info") {
  const el = document.getElementById("message");
  if (!el) return;
  el.textContent = message || "";
  el.className = type;
}

export function lierEvenements() {
  const towers = document.querySelectorAll(".tower");

  towers.forEach((towerEl) => {
    towerEl.addEventListener("click", () => {
      handleTowerClick(Number(towerEl.dataset.tower));
    });

    towerEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleTowerClick(Number(towerEl.dataset.tower));
      }
    });
  });

  const paletteSelect = document.getElementById("colorPalette");
  if (paletteSelect) {
    currentPalette = paletteSelect.value || "fire";
    paletteSelect.addEventListener("change", () => {
      currentPalette = paletteSelect.value;
      afficherJeu();
    });
  }
}

export function resetSelection() {
  selectedTower = null;
  updateSelectionUI();
}

function handleTowerClick(idx) {
  // ✅ Bloque toute action si pause
  if (paused) {
    afficherMessage("Jeu en pause. Reprends pour jouer.", "info");
    return;
  }

    // Si la partie n'a pas encore commencé :
  // premier clic => on débloque + on lance le timer (via main.js),
  // puis on CONTINUE normalement (ce clic devient la sélection source)
  if (startLocked) {
    startLocked = false;
    if (typeof onStart === "function") onStart();
    // pas de return : on continue pour traiter ce clic normalement
  }


  if (selectedTower === null) {
    if (gameState.towers[idx].length === 0) {
      afficherMessage("Cette tour est vide.", "error");
      return;
    }
    selectedTower = idx;
    updateSelectionUI();
    afficherMessage(`Source = Tour ${idx + 1}. Choisis une destination.`, "info");
    return;
  }

  if (selectedTower === idx) {
    resetSelection();
    afficherMessage("Sélection annulée.", "info");
    return;
  }

  const from = selectedTower;
  const to = idx;

  const result = deplacerDisque(from, to);

  if (!result.ok) {
    afficherMessage(result.reason, "error");
    resetSelection();
    return;
  }

  afficherJeu();
  mettreAJourCompteurCoups();

  if (verifierVictoire()) {
    afficherMessage(`🎉 Bravo ! Gagné en ${gameState.moveCount} coups !`, "success");
    lancerConfettis();
    resetSelection();
    return;
  }

  afficherMessage(`OK: Tour ${from + 1} → Tour ${to + 1}`, "info");
  resetSelection();
}

function updateSelectionUI() {
  const towers = document.querySelectorAll(".tower");
  towers.forEach((t, i) => t.classList.toggle("selected", i === selectedTower));
}

function lancerConfettis() {
  const colors = ["#e63946", "#f1fa3c", "#ffd166", "#06d6a0", "#118ab2"];
  for (let i = 0; i < 80; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 6;
    c.style.width = size + "px";
    c.style.height = size + "px";
    c.style.animationDuration = 2 + Math.random() * 2 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}
