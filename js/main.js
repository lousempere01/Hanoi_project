// js/main.js
import { initialiserJeu } from "./game.js";
import {
  afficherJeu,
  mettreAJourCompteurCoups,
  afficherMessage,
  lierEvenements,
  resetSelection
} from "./ui.js";

function demarrer(n) {
  initialiserJeu(n);
  resetSelection();
  afficherJeu();
  mettreAJourCompteurCoups();
  afficherMessage("Clique une tour source, puis une tour destination.", "info");
}

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("diskCount");
  const restartBtn = document.getElementById("restartBtn");

  lierEvenements();

  // init
  demarrer(select.value);

  // restart
  restartBtn.addEventListener("click", () => demarrer(select.value));

  // changement du nombre de disques = restart
  select.addEventListener("change", () => demarrer(select.value));
});
