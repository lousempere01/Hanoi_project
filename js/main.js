// js/main.js
// Point d’entrée de l’application.
// Ce fichier fait le lien entre :
// - la logique du jeu (game.js)
// - l’interface utilisateur (ui.js)
// Il ne contient AUCUNE règle du jeu, seulement l’orchestration.

// Import de la fonction qui initialise l'état du jeu
import { initialiserJeu } from "./game.js";

// Import des fonctions liées à l’interface utilisateur
import {
  afficherJeu,
  mettreAJourCompteurCoups,
  afficherMessage,
  lierEvenements,
  resetSelection
} from "./ui.js";

/**
 * Démarre (ou redémarre) une partie.
 * Cette fonction est appelée :
 * - au chargement de la page
 * - quand l'utilisateur clique sur "Recommencer"
 * - quand l'utilisateur change le nombre de disques
 *
 * @param {number|string} n - nombre de disques à utiliser
 */
function demarrer(n) {
  // Initialise l'état interne du jeu (tours, compteur, etc.)
  initialiserJeu(n);

  // Réinitialise la sélection de tour côté interface
  resetSelection();

  // Affiche les tours et les disques à l’écran
  afficherJeu();

  // Met à jour le compteur de coups (revient à 0)
  mettreAJourCompteurCoups();

  // Message d’instruction pour l’utilisateur
  afficherMessage(
    "Clique une tour source puis une tour destination.",
    "info"
  );
}

/**
 * Code exécuté lorsque la page HTML est entièrement chargée.
 * On attend DOMContentLoaded pour être sûr que
 * tous les éléments HTML existent avant de les manipuler.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Récupération des éléments HTML nécessaires
  const select = document.getElementById("diskCount");   // select du nombre de disques
  const restartBtn = document.getElementById("restartBtn"); // bouton recommencer

  // Liaison des événements utilisateur sur les tours (clics / clavier)
  lierEvenements();

  // Lancement initial du jeu avec la valeur sélectionnée par défaut
  demarrer(select.value);

  // Quand l'utilisateur clique sur "Recommencer"
  restartBtn.addEventListener("click", () => {
    demarrer(select.value);
  });

  // Quand l'utilisateur change le nombre de disques
  // On redémarre une nouvelle partie automatiquement
  select.addEventListener("change", () => {
    demarrer(select.value);
  });
});
