// js/game.js - logique du jeu

// État du jeu
export const gameState = {
  towers: [[], [], []],
  diskCount: 4,
  moveCount: 0,
  history : []
};

// initialise l’état du jeu et crée les disques sur la première tour.
export function initialiserJeu(nombreDeDisques) {
  // On convertit en nombre entier
  let n = parseInt(nombreDeDisques);
  if (isNaN(n)) n = 4; // Sécurité

  gameState.diskCount = n;
  gameState.moveCount = 0;
  gameState.towers = [[], [], []];
  gameState.history = [];

  // On remplit la première tour (index 0)
  // Boucle de n jusqu'à 1 pour avoir le plus petit (1) en haut de la pile
  for (let i = n; i >= 1; i--) {
    gameState.towers[0].push(i);
  }
}

// vérifie si le déplacement respecte les règles du jeu
export function deplacementValide(tourSource, tourDestination) {
  const source = gameState.towers[tourSource];
  const dest = gameState.towers[tourDestination];

  // La tour de départ ne doit pas être vide
  if (source.length === 0) {
    return false;
  }

  // On ne déplace pas sur la même tour
  if (tourSource === tourDestination) {
    return false;
  }

  // On récupère les disques du sommet (fin du tableau)
  const disqueADeplacer = source[source.length - 1];
  const disqueSommetDest = dest[dest.length - 1];

  // Si la destination est vide, c'est autorisé
  if (disqueSommetDest === undefined) {
    return true;
  }

  // Le disque déplacé doit être plus petit que celui de destination
  if (disqueADeplacer < disqueSommetDest) {
    return true;
  } else {
    return false;
  }
}

// déplace un disque d’une tour vers une autre si le déplacement est autorisé
export function deplacerDisque(tourSource, tourDestination) {
  if (deplacementValide(tourSource, tourDestination)) {
    
    const source = gameState.towers[tourSource];
    const dest = gameState.towers[tourDestination];

    // On retire le disque de la source
    const disque = source.pop();
    
    // On l'ajoute à la destination
    dest.push(disque);

    // On augmente le compteur
    gameState.moveCount++;

    gameState.history.push({ from: tourSource, to: tourDestination });

    return { ok: true };
  } else {
    // Si le déplacement n'est pas valide
    return { ok: false, reason: "Déplacement non autorisé" };
  }
}

// Fonction pour annuler le dernier déplacement
export function annulerDernierCoup() {
  // si pas d'historique, rien à annuler
  if (gameState.history.length === 0) {
    return { ok: false, reason: "Aucun déplacement à annuler" };
  }
  // On récupère le dernier déplacement
  const lastMove = gameState.history.pop();

  // On fait : on prend la destination pour remettre le disque dans la source
  const tourActuelle = gameState.towers[lastMove.to];
  const tourPrecedente = gameState.towers[lastMove.from];

  const disque = tourActuelle.pop();
  tourPrecedente.push(disque);

  // on réduit le compteur de coups
  gameState.moveCount--;

  return { ok: true };
}

// vérifie si la condition de victoire est atteinte
export function verifierVictoire() {
  return gameState.towers[2].length === gameState.diskCount;
}
