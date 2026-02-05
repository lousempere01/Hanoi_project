// js/main.js
// Point d'entrée : fait le lien entre la logique (game.js) et l'affichage (ui.js)

import { initialiserJeu } from "./game.js";
import {
  afficherJeu,
  afficherMessage,
  lierEvenements,
  mettreAJourCompteurCoups,
  resetSelection
} from "./ui.js";

// Fonction pour lancer une partie
function demarrer(n) {
  initialiserJeu(n);
  resetSelection();
  afficherJeu();
  mettreAJourCompteurCoups();
  
  afficherMessage("Clique sur une tour pour commencer.", "info");
}


document.addEventListener("DOMContentLoaded", () => {
  
  // Récupération des boutons et menus du HTML
  const selectDisques = document.getElementById("diskCount");
  const btnRecommencer = document.getElementById("restartBtn");

  // --- Connexion des événements utilisateur ---
  
  // Active les clics sur les tours (géré dans ui.js)
  lierEvenements();

  // Bouton "Recommencer" : on relance la partie
  btnRecommencer.addEventListener("click", () => {
    demarrer(selectDisques.value);
  });

  // Changement du nombre de disques : on relance automatiquement
  selectDisques.addEventListener("change", () => {
    demarrer(selectDisques.value);
  });

  // --- Initialisation du jeu au chargement ---
  // On lance la première partie tout de suite avec la valeur par défaut
  demarrer(selectDisques.value);

});
