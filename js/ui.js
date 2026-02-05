// js/ui.js
import { gameState, deplacerDisque, verifierVictoire } from "./game.js";

/**
 * Tour sélectionnée comme source.
 * null = aucune sélection
 * 0 / 1 / 2 = index de la tour
 */
let selectedTower = null;

/**
 * Accès simplifié aux éléments du DOM
 */
const towersDOM = () => Array.from(document.querySelectorAll(".tower"));
const movesDOM = () => document.getElementById("movesCount");
const messageDOM = () => document.getElementById("message");

/**
 * afficherJeu()
 * Reconstruit complètement l'affichage à partir de l'état du jeu.
 * - Lecture de gameState.towers
 * - Suppression puis recréation des disques
 */
export function afficherJeu() {
  const max = gameState.diskCount;

  towersDOM().forEach((towerEl) => {
    const idx = Number(towerEl.dataset.tower);

    // Supprime tous les disques existants
    towerEl.querySelectorAll(".disk").forEach((d) => d.remove());

    const arr = gameState.towers[idx];

    // Ajout des disques (ordre inversé pour affichage correct en flex-column)
    for (let i = arr.length - 1; i >= 0; i--) {
      const size = arr[i];

      const disk = document.createElement("div");
      disk.className = "disk";
      disk.dataset.size = String(size);

      // Largeur proportionnelle à la taille du disque
      const minW = 35;
      const maxW = 95;
      const ratio = (size - 1) / (max - 1 || 1);
      disk.style.width = `${minW + ratio * (maxW - minW)}%`;

      // Couleur simple (lisible, sans effet)
      disk.style.background = `hsl(${120 + (1 - ratio) * 180}, 70%, 60%)`;

      towerEl.appendChild(disk);
    }
  });
}

/**
 * Met à jour le compteur de coups
 */
export function mettreAJourCompteurCoups() {
  movesDOM().textContent = String(gameState.moveCount);
}

/**
 * Affiche un message utilisateur
 * type : info | error | success
 */
export function afficherMessage(message, type = "info") {
  const el = messageDOM();
  el.textContent = message || "";
  el.classList.remove("info", "error", "success");
  el.classList.add(type);
}

/**
 * Ajoute les événements de clic / clavier sur les tours
 */
export function lierEvenements() {
  towersDOM().forEach((towerEl) => {
    towerEl.addEventListener("click", () => {
      handleTowerClick(Number(towerEl.dataset.tower));
    });
  });
}

/**
 * Réinitialise la sélection de tour
 */
export function resetSelection() {
  selectedTower = null;
  towersDOM().forEach((t) => t.classList.remove("selected"));
}

/**
 * Gestion des clics sur les tours
 * - 1er clic : sélection de la source
 * - 2e clic : tentative de déplacement
 */
function handleTowerClick(idx) {
  // Sélection de la tour source
  if (selectedTower === null) {
    selectedTower = idx;
    updateSelectionUI();
    afficherMessage(`Source = Tour ${idx + 1}. Clique une destination.`, "info");
    return;
  }

  // Tentative de déplacement
  const from = selectedTower;
  const to = idx;

const res = deplacerDisque(from, to);

if (!res.ok) {
  afficherMessage(res.reason, "error");
  resetSelection(); 
  return;
}


  // Mise à jour après déplacement valide
  afficherJeu();
  mettreAJourCompteurCoups();

  if (verifierVictoire()) {
    afficherMessage(`Victoire en ${gameState.moveCount} coups !`, "success");
    resetSelection();
    return;
  }

  afficherMessage(`OK: Tour ${from + 1} → Tour ${to + 1}`, "info");
  resetSelection();
}

/**
 * Met à jour la surbrillance de la tour source sélectionnée
 */
function updateSelectionUI() {
  towersDOM().forEach((t) => t.classList.remove("selected"));
  const el = towersDOM()[selectedTower];
  if (el) el.classList.add("selected");
}
