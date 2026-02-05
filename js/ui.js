// js/ui.js
// Ce fichier gère l'interface utilisateur :
// - Affichage des tours + disques (rendu HTML)
// - Gestion des clics / clavier
// - Messages (info / erreur / victoire)
// Il n'implémente PAS les règles : il appelle game.js pour ça.

import { gameState, deplacerDisque, verifierVictoire } from "./game.js";

/**
 * selectedTower = mémorise la tour "source" choisie par l'utilisateur.
 * - null : aucune tour source sélectionnée
 * - 0/1/2 : index de la tour source sélectionnée
 */
let selectedTower = null;

/**
 * Petites fonctions utilitaires pour accéder au DOM.
 * On les met en fonctions pour éviter de répéter du code partout.
 */
const towersDOM = () => Array.from(document.querySelectorAll(".tower"));
const movesDOM = () => document.getElementById("movesCount");
const messageDOM = () => document.getElementById("message");

/**
 * Affiche l'état actuel du jeu.
 * On relit gameState.towers et on reconstruit les disques dans chaque tour.
 *
 * Important :
 * - On ne "déplace" pas les div une par une, on reconstruit l'affichage à partir de l'état.
 * - Ça évite plein de bugs (l'état = source de vérité).
 */
export function afficherJeu() {
  const max = gameState.diskCount; // taille max (pour calculer les largeurs)

  // Pour chaque tour HTML (.tower)
  towersDOM().forEach((towerEl) => {
    const idx = Number(towerEl.dataset.tower); // 0, 1 ou 2 depuis data-tower

    // 1) Nettoyage : on supprime seulement les disques, pas le "pole" ni la "base"
    towerEl.querySelectorAll(".disk").forEach((d) => d.remove());

    // 2) Données de la tour dans l'état du jeu (tableau de nombres)
    const arr = gameState.towers[idx];

    /**
     * IMPORTANT (flex-direction: column)
     * Dans notre CSS, les disques sont empilés verticalement.
     * En flex-column, le dernier élément ajouté finit en bas.
     *
     * Or dans le state, le sommet est le dernier élément du tableau.
     * Donc pour que visuellement le sommet soit en haut, on ajoute les disques à l'envers :
     * du sommet (dernier) vers la base (premier).
     */
    for (let i = arr.length - 1; i >= 0; i--) {
      const size = arr[i]; // taille logique du disque (1 = petit, max = grand)

      // Création de l'élément HTML disque
      const disk = document.createElement("div");
      disk.className = "disk";
      disk.dataset.size = String(size);

      // Largeur du disque : plus le disque est grand, plus il est large
      // ratio = 0 (plus petit) -> 1 (plus grand)
      const minW = 35;
      const maxW = 95;
      const ratio = (size - 1) / (max - 1 || 1);
      disk.style.width = `${minW + ratio * (maxW - minW)}%`;

      // Couleur simple basée sur la taille (juste pour différencier visuellement)
      disk.style.background = `hsl(${120 + (1 - ratio) * 180}, 70%, 60%)`;

      // Le disque déplaçable = sommet logique = dernier du tableau arr
      // Donc i === arr.length - 1
      if (i === arr.length - 1) disk.classList.add("top");

      // Ajoute le disque dans la tour
      towerEl.appendChild(disk);
    }
  });

  // Après avoir affiché, on peut animer le disque du dernier move (si existant)
  animateLastMove();
}

/**
 * Met à jour le compteur de coups dans l'interface.
 * L'info vient de gameState.moveCount (logique), on l'affiche dans le HTML.
 */
export function mettreAJourCompteurCoups() {
  movesDOM().textContent = String(gameState.moveCount);
}

/**
 * Affiche un message à l'utilisateur (aide, erreur, victoire).
 * type = "info" | "error" | "success"
 */
export function afficherMessage(message, type = "info") {
  const el = messageDOM();

  // Si message vide, on met une chaîne vide pour éviter "undefined"
  el.textContent = message || "";

  // On enlève les anciennes classes pour éviter un mélange de styles
  el.classList.remove("info", "error", "success");

  // Puis on applique le style du type demandé
  el.classList.add(type);
}

/**
 * Branche les événements utilisateur sur les tours.
 * Ici on associe :
 * - clic souris
 * - Enter/Espace au clavier
 * => les deux déclenchent le même traitement (handleTowerClick)
 */
export function lierEvenements() {
  towersDOM().forEach((towerEl) => {
    // Clic souris
    towerEl.addEventListener("click", () => {
      handleTowerClick(Number(towerEl.dataset.tower));
    });

    // Clavier (accessibilité)
    towerEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // évite scroll avec espace
        handleTowerClick(Number(towerEl.dataset.tower));
      }
    });
  });
}

/**
 * Réinitialise la sélection (aucune tour source).
 * Et enlève la surbrillance visuelle.
 */
export function resetSelection() {
  selectedTower = null;
  towersDOM().forEach((t) => t.classList.remove("selected"));
}

/**
 * Fonction centrale appelée quand on clique une tour.
 * Scénario :
 * 1er clic => on choisit la source
 * 2e clic => on choisit la destination et on tente le déplacement
 */
function handleTowerClick(idx) {
  // 1) Aucune source sélectionnée : on choisit la tour source
  if (selectedTower === null) {
    selectedTower = idx;
    updateSelectionUI();
    afficherMessage(`Source = Tour ${idx + 1}. Clique une destination.`, "info");
    return;
  }

  // 2) Source déjà choisie : on tente un déplacement vers idx
  const from = selectedTower;
  const to = idx;

  // On demande à game.js d'appliquer le move (et de vérifier les règles)
  const res = deplacerDisque(from, to);

  // Si déplacement interdit, on affiche l'erreur et on garde la source sélectionnée
  if (!res.ok) {
    afficherMessage(res.reason, "error");
    return;
  }

  // 3) Déplacement réussi : on met à jour l'écran + compteur
  afficherJeu();
  mettreAJourCompteurCoups();

  // 4) Test de victoire après le move
  if (verifierVictoire()) {
    afficherMessage(`Victoire en ${gameState.moveCount} coups !`, "success");
    resetSelection();
    return;
  }

  // Sinon on affiche un message simple et on reset la sélection pour le prochain coup
  afficherMessage(`OK: Tour ${from + 1} → Tour ${to + 1}`, "info");
  resetSelection();
}

/**
 * Met à jour la surbrillance visuelle de la tour source sélectionnée.
 * On enlève tout, puis on ajoute "selected" à la tour choisie.
 */
function updateSelectionUI() {
  towersDOM().forEach((t) => t.classList.remove("selected"));
  const el = towersDOM()[selectedTower];
  if (el) el.classList.add("selected");
}

/**
 * Petite animation après un move :
 * On ajoute la classe CSS "moving" au disque du sommet de la tour destination,
 * puis on l'enlève rapidement.
 *
 * Note :
 * - gameState.lastMove est écrit dans game.js au moment du déplacement.
 */
function animateLastMove() {
  const last = gameState.lastMove;
  if (!last) return;

  // Tour destination dans le DOM
  const toTower = towersDOM()[last.to];
  if (!toTower) return;

  /**
   * Avec notre rendu inversé :
   * - Le sommet visuel correspond au premier .disk dans le DOM
   * (car on a ajouté les disques à l'envers)
   */
  const disks = toTower.querySelectorAll(".disk");
  const topDisk = disks[0];
  if (!topDisk) return;

  // Animation simple (CSS)
  topDisk.classList.add("moving");
  setTimeout(() => topDisk.classList.remove("moving"), 150);
}
