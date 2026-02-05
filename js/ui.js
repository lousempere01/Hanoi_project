// js/ui.js -  gestion de l’interface

import { deplacerDisque, gameState, verifierVictoire } from "./game.js";

// Variable pour mémoriser la tour source
let selectedTower = null;

// Met à jour l'affichage des tours et des disques dans la page
export function afficherJeu() {
  const towers = document.querySelectorAll(".tower");
  const max = gameState.diskCount;

  towers.forEach((towerEl) => {
    // On récupère l'index de la tour (0, 1 ou 2)
    const idx = Number(towerEl.dataset.tower);
    const arr = gameState.towers[idx];

    // On supprime les anciens disques pour redessiner proprement
    towerEl.querySelectorAll(".disk").forEach((d) => d.remove());

    // On recrée les disques.
    // On boucle à l'envers (du haut du tableau vers le bas)
    for (let i = arr.length - 1; i >= 0; i--) {
      const size = arr[i];
      const disk = document.createElement("div");
      
      disk.className = "disk";
      
      // Calcul de la largeur (entre 30% et 90%)
      // Si max est 1 (évite division par zéro), on met 1
      const ratio = (size - 1) / (max - 1 || 1);
      const width = 30 + ratio * 60; 
      disk.style.width = `${width}%`;

      // Couleur dynamique (hsl) pour faire joli
      disk.style.background = `hsl(${200 + (ratio * 100)}, 70%, 60%)`;

      towerEl.appendChild(disk);
    }
  });

  // Met à jour le visuel de la sélection
  updateSelectionUI();
}

// Met à jour l’affichage du nombre de coups joués.
export function mettreAJourCompteurCoups() {
  const el = document.getElementById("movesCount");
  if (el) el.textContent = gameState.moveCount;
}

// Affiche un message d’information, d’erreur ou de victoire à l’utilisateur.
export function afficherMessage(message, type = "info") {
  const el = document.getElementById("message");
  if (el) {
    el.textContent = message;
    // On nettoie les anciennes classes et on met la nouvelle
    el.className = `message ${type}`;
  }
}

// Associe les événements utilisateur (clics, interactions) aux actions du jeu.
export function lierEvenements() {
  const towers = document.querySelectorAll(".tower");

  towers.forEach((towerEl) => {
    // Gestion du clic souris
    towerEl.addEventListener("click", () => {
      const idx = Number(towerEl.dataset.tower);
      handleTowerClick(idx);
    });

    // Gestion du clavier
    towerEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // Empêche le scroll de la page avec Espace
        const idx = Number(towerEl.dataset.tower);
        handleTowerClick(idx);
      }
    });
  });
}

// Fonction utilitaire pour réinitialiser la sélection (exportée pour main.js)
export function resetSelection() {
  selectedTower = null;
  updateSelectionUI();
}

// --- Fonctions internes (logique d'interaction) ---

function handleTowerClick(idx) {
  // Cas 1 : Aucune sélection -> On choisit la source
  if (selectedTower === null) {
    // On ne peut pas sélectionner une tour vide
    if (gameState.towers[idx].length === 0) {
      afficherMessage("Cette tour est vide.", "error");
      return;
    }
    
    selectedTower = idx;
    updateSelectionUI();
    return;
  }

  // Cas 2 : On clique sur la même tour -> Annulation
  if (selectedTower === idx) {
    resetSelection();
    afficherMessage("Sélection annulée.", "info");
    return;
  }

  // Cas 3 : Tentative de déplacement
  // On définit 'from' et 'to' pour les utiliser dans le message plus bas
  const from = selectedTower;
  const to = idx;

  const result = deplacerDisque(from, to);

  if (result.ok) {
    // Mouvement réussi
    afficherJeu();
    mettreAJourCompteurCoups();
    
    // On vérifie la victoire d'abord
    if (verifierVictoire()) {
      afficherMessage(`Bravo ! Gagné en ${gameState.moveCount} coups !`, "success");
      resetSelection();
    } else {
      // Si pas de victoire, on affiche le message de déplacement
      afficherMessage(`OK: Tour ${from + 1} → Tour ${to + 1}`, "info");
      resetSelection();
    }

  } else {
    // Erreur (règle non respectée)
    afficherMessage(result.reason, "error");
    resetSelection(); // On force la désélection
  }
}

// Ajoute la classe CSS .selected à la tour active
function updateSelectionUI() {
  const towers = document.querySelectorAll(".tower");
  towers.forEach((t, i) => {
    if (i === selectedTower) {
      t.classList.add("selected");
    } else {
      t.classList.remove("selected");
    }
  });
}
