// js/ui.js
import { gameState, deplacerDisque, verifierVictoire } from "./game.js";

let selectedTower = null;

const towerEls = () => Array.from(document.querySelectorAll(".tower"));
const movesEl = () => document.getElementById("movesCount");
const messageEl = () => document.getElementById("message");

export function afficherJeu() {
  const towers = gameState.towers;
  const max = gameState.diskCount;

  towerEls().forEach((towerEl) => {
    const idx = Number(towerEl.dataset.tower);

    // Nettoyage: on garde pole/base, on vire les disques précédents
    towerEl.querySelectorAll(".disk").forEach((d) => d.remove());

    const arr = towers[idx];

    // IMPORTANT:
    // En flex-direction: column, le dernier élément DOM se retrouve en bas.
    // Donc on injecte les disques du haut vers le bas (ordre inversé),
    // pour que le plus gros finisse bien en bas.
    for (let i = arr.length - 1; i >= 0; i--) {
      const diskSize = arr[i];

      const disk = document.createElement("div");
      disk.className = "disk";
      disk.dataset.size = String(diskSize);

      // largeur en % (visible)
      const minW = 30; // %
      const maxW = 92; // %
      const ratio = (diskSize - 1) / (max - 1 || 1);
      const w = minW + ratio * (maxW - minW);
      disk.style.width = `${w}%`;

      // couleur = gradient simple basé sur la taille
      const hue = 210 + (1 - ratio) * 120; // bleu -> vert
      disk.style.background = `linear-gradient(180deg, hsla(${hue}, 85%, 65%, 0.95), hsla(${hue}, 85%, 50%, 0.95))`;

      // Le disque "top" (celui déplaçable) = dernier élément du tableau (arr[arr.length - 1])
      if (i === arr.length - 1) disk.classList.add("top");

      towerEl.appendChild(disk);
    }
  });

  // Petite animation sur le disque déplacé
  animateLastMove();
}

export function mettreAJourCompteurCoups() {
  movesEl().textContent = String(gameState.moveCount);
}

export function afficherMessage(message, type = "info") {
  const el = messageEl();
  el.textContent = message || "";
  el.classList.remove("info", "error", "success");
  el.classList.add(type);
}

export function lierEvenements() {
  towerEls().forEach((towerEl) => {
    towerEl.addEventListener("click", () => {
      const idx = Number(towerEl.dataset.tower);
      handleTowerClick(idx);
    });

    // clavier (accessibilité)
    towerEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const idx = Number(towerEl.dataset.tower);
        handleTowerClick(idx);
      }
    });
  });
}

export function resetSelection() {
  selectedTower = null;
  towerEls().forEach((t) => t.classList.remove("selected"));
}

function handleTowerClick(idx) {
  // 1er clic: selection source
  if (selectedTower === null) {
    selectedTower = idx;
    highlightSelection();
    afficherMessage(`Source: Tour ${idx + 1}. Choisis une destination.`, "info");
    return;
  }

  // 2e clic: tentative de déplacement
  const from = selectedTower;
  const to = idx;

  const res = deplacerDisque(from, to);
  if (!res.ok) {
    afficherMessage(res.reason, "error");
    // On garde la sélection pour éviter de recliquer la source
    return;
  }

  // Succès
  afficherJeu();
  mettreAJourCompteurCoups();

  if (verifierVictoire()) {
    afficherMessage(`Victoire en ${gameState.moveCount} coups.`, "success");
    resetSelection();
    return;
  }

  afficherMessage(`Déplacé: Tour ${from + 1} → Tour ${to + 1}`, "info");
  resetSelection();
}

function highlightSelection() {
  towerEls().forEach((t) => t.classList.remove("selected"));
  const el = towerEls()[selectedTower];
  if (el) el.classList.add("selected");
}

function animateLastMove() {
  const last = gameState.lastMove;
  if (!last) return;

  const toTower = towerEls()[last.to];
  if (!toTower) return;

  // Attention: dans le DOM, le disque en bas est le dernier élément,
  // mais celui qu'on vient de poser est le TOP de la tour destination.
  // Avec notre rendu inversé, le TOP visuel correspond au PREMIER .disk.
  const disks = toTower.querySelectorAll(".disk");
  const topVisual = disks[0];
  if (!topVisual) return;

  topVisual.classList.add("moving");
  window.setTimeout(() => topVisual.classList.remove("moving"), 200);
}
