// js/ui.js
import { deplacerDisque, gameState, verifierVictoire } from "./game.js";

// ===== VARIABLES D'ETAT DE L'INTERFACE =====

let selectedTower = null;     // Tour actuellement sélectionnée pour déplacer un disque
let currentPalette = "fire";  // Thème de couleurs par défaut

let startLocked = true;       // Verrouille le chronomètre tant que le joueur n'a pas cliqué
let onStart = null;           // Fonction à appeler au premier clic
let onWin = null;            // Fonction à appeler à la victoire
let paused = false;         // Etat de la pause du jeu

// ===== CONTROLE D'INTERFACE =====

export function setStartLock(value) {
  startLocked = !!value;
  if (startLocked) resetSelection();
}

export function setOnStart(callback) {
  onStart = callback;
}

export function setOnWin(callback) {
  onWin = callback;
}

export function isStartLocked() {
  return startLocked;
}

export function setPaused(value) {
  paused = !!value;
  if (paused) resetSelection();
}

export function isPaused() {
  return paused;
}

// ===== ESTHETIQUE ET COULEURS =====

// Génère des couleurs dynamiques selon la taille du disque et la palette choisie
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

// ===== AFFICHAGE PRINCIPAL =====

// Vide les tours HTML et redessine tous les disques selon l'état du jeu (gameState)
export function afficherJeu() {
  const towers = document.querySelectorAll(".tower");
  const max = gameState.diskCount;

  towers.forEach((towerEl) => {
    const idx = Number(towerEl.dataset.tower);
    const arr = gameState.towers[idx];

    // 1. On vide la tour avant de redessiner
    towerEl.querySelectorAll(".disk").forEach((d) => d.remove());

    // 2. On recrée les disques
    for (let i = arr.length - 1; i >= 0; i--) {
      const size = arr[i];

      const disk = document.createElement("div");
      disk.className = "disk";

      // Calcul de la largeur en pourcentage selon la taille du disque
      const ratio = (size - 1) / (max - 1 || 1);
      const invRatio = 1 - ratio;

      const width = 30 + ratio * 60;
      disk.style.width = `${width}%`;
      
      // Application de la palette de couleurs choisie
      const paletteFn = palettes[currentPalette] || palettes.fire;
      disk.style.background = paletteFn(invRatio);

      // Insertion du disque dans la tour
      towerEl.appendChild(disk);
    }
  });

  // Mise à jour la surbrillance de la tour sélectionnée
  updateSelectionUI();

  // Désactivation du bouton annuler si l'historique est vide
  const undoBtn = document.getElementById("undoBtn");
  if (undoBtn){
    undoBtn.disabled = !gameState.history || gameState.history.length === 0;
  }
}

// Met à jour le texte du compteur
export function mettreAJourCompteurCoups() {
  const el = document.getElementById("movesCount");
  if (el){
    if (gameState.isChallengeMode){
      el.textContent = `${gameState.movesLeft} restant(s)`;
      el.style.color = gameState.movesLeft <= 3 ? "var(--danger)" : "inherit";
    } else {
      el.textContent = String(gameState.moveCount);
    }
  }
}

// Affiche les messages d'information, d'erreur ou de succès à l'utilisateur
export function afficherMessage(message, type = "info") {
  const el = document.getElementById("message");
  if (!el) return;
  el.textContent = message || "";
  el.className = type;
}

// ===== GESTION DES ÉVÉNEMENTS =====

// Lie les événements de clic et de clavier sur les tours, ainsi que le changement de palette
export function lierEvenements() {
  const towers = document.querySelectorAll(".tower");

  towers.forEach((towerEl) => {
    // Gestion du clic à la souris
    towerEl.addEventListener("click", () => {
      handleTowerClick(Number(towerEl.dataset.tower));
    });
    // Gestion de l'accessibilité au clavier
    towerEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleTowerClick(Number(towerEl.dataset.tower));
      }
    });
  });
  // Gestion du changement de palette
  const paletteSelect = document.getElementById("colorPalette");
  if (paletteSelect) {
    currentPalette = paletteSelect.value || "fire";
    paletteSelect.addEventListener("change", () => {
      currentPalette = paletteSelect.value;
      afficherJeu(); // Redessine les disques avec la nouvelle palette de couleurs
    });
  }
}

// Annule la sélection en cours
export function resetSelection() {
  selectedTower = null;
  updateSelectionUI();
}

// Gère la logique quand on clique sur une tour
function handleTowerClick(idx) {
  // Vérification de blocage (Pause, Victoire, Défi perdu)
  // Pause
  if (paused) {
    afficherMessage("Jeu en pause. Reprends pour jouer.", "info");
    return;
  }
  // Victoire
  if (verifierVictoire()) {
    afficherMessage("Partie déjà gagnée !", "info");
    return;
  }
  // Défi perdu
  if (gameState.isChallengeMode && gameState.movesLeft <= 0 && selectedTower === null && !verifierVictoire()) {
    afficherMessage("💥 Défi perdu ! Annule un coup ou recommence.", "error");
    return;
  }

  // Déverrouille le timer au tout premier clic de la partie
  if (startLocked) {
    startLocked = false;
    if (typeof onStart === "function") onStart();
  }
  
  //Si aucune tour n'est sélectionnée, on choisit la source
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

  // Si on clique à nouveau sur la même tour, on annule la sélection
  if (selectedTower === idx) {
    resetSelection();
    afficherMessage("Sélection annulée.", "info");
    return;
  }

  // On tente de déplacer le disque sélectionné vers la tour cliquée
  const from = selectedTower;
  const to = idx;

  const result = deplacerDisque(from, to);

  // Si le coup est invalide
  if (!result.ok) {
    afficherMessage(result.reason, "error");
    resetSelection();
    return;
  } 

  // Coup valide
  afficherJeu();
  mettreAJourCompteurCoups();

  // Vérifie si le coup a fait gagner la partie
  if (verifierVictoire()) {
    afficherMessage(`🎉 Bravo ! Gagné en ${gameState.moveCount} coups !`, "success");
    lancerConfettis();
    resetSelection();
    // Prévient main.js de la victoire pour arrêter le timer
    if(typeof onWin === "function") onWin();
    return;
  }

  // Message de succès pour un déplacement valide
  afficherMessage(`OK: Tour ${from + 1} → Tour ${to + 1}`, "info");
  resetSelection();
}

// ===== EFFETS VISUELS BONUS =====

// Ajoute ou retire la bordure lumineuse sur la tour sélectionnée
function updateSelectionUI() {
  const towers = document.querySelectorAll(".tower");
  towers.forEach((t, i) => t.classList.toggle("selected", i === selectedTower));
}

// Pluie de confettis pour célébrer la victoire
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
