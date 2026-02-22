// js/game.js - logique du jeu

// État du jeu
export const gameState = {
  towers: [[], [], []],
  diskCount: 4,
  moveCount: 0,
  history : [],
  isChallengeMode: false,
  movesLeft: 0
};

// ===== INITIALISATION =====

// Initialise l’état du jeu et crée les disques sur la première tour
export function initialiserJeu(nombreDeDisques, isChallengeMode = false ) {
  // On convertit en nombre entier
  let n = parseInt(nombreDeDisques);
  if (isNaN(n)) n = 4; // Valeur par défaut

  // Remise à zéro de l'état du jeu
  gameState.diskCount = n;
  gameState.moveCount = 0;
  gameState.towers = [[], [], []];
  gameState.history = [];

  // Configuration du mode défi
  gameState.isChallengeMode = isChallengeMode;
  if (isChallengeMode) {
    //Formule mathématique du score parfait : 2^n - 1
    gameState.movesLeft = Math.pow(2, n) - 1;
  } else {
    gameState.movesLeft = 0;
  }

  // On remplit la première tour (index 0)
  // Boucle de n jusqu'à 1 pour avoir le plus petit (1) en haut de la pile
  for (let i = n; i >= 1; i--) {
    gameState.towers[0].push(i);
  }
}

// ===== VERIFICATION DES REGLES =====

// Vérifie si le déplacement demandé respecte les règles du jeu
export function deplacementValide(tourSource, tourDestination) {
  const source = gameState.towers[tourSource];
  const dest = gameState.towers[tourDestination];

  // Règle 1 : La tour de départ ne doit pas être vide
  if (source.length === 0) {
    return false;
  }

  // Règle 2 : On ne déplace pas sur la même tour
  if (tourSource === tourDestination) {
    return false;
  }

  // On regarde la taille des disques au sommet des deux tours
  // Le disque à déplacer est celui au sommet de la tour source
  const disqueADeplacer = source[source.length - 1];
  const disqueSommetDest = dest[dest.length - 1];

  // Règle 3 : Si la tour destination est vide, c'est autorisé
  if (disqueSommetDest === undefined) {
    return true;
  }

  // Règle 4 : Le disque déplacé doit strictement être plus petit que celui au sommet de la tour destination
  if (disqueADeplacer < disqueSommetDest) {
    return true;
  } else {
    return false;
  }
}

// ===== ACTIONS DE JEU =====

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

    // Si on est en mode défi, on réduit les coups restants
    if (gameState.isChallengeMode) {
      gameState.movesLeft--;
    }

    // On ajoute ce déplacement à l'historique pour pouvoir l'annuler plus tard
    gameState.history.push({ from: tourSource, to: tourDestination });

    return { ok: true };
  } else {
    // Si le déplacement n'est pas valide
    return { ok: false, reason: "Déplacement non autorisé" };
  }
}

// ===== ANNULATION ET VICTOIRE =====

// Fonction pour annuler le dernier déplacement joué
export function annulerDernierCoup() {
  // si pas d'historique, rien à annuler
  if (gameState.history.length === 0) {
    return { ok: false, reason: "Aucun déplacement à annuler" };
  }
  // On récupère et retire le dernier coup joué
  const lastMove = gameState.history.pop();

  const tourActuelle = gameState.towers[lastMove.to];
  const tourPrecedente = gameState.towers[lastMove.from];
  
  // On fait le chemin inverse :  on prend la destination pour remettre le disque dans la source
  const disque = tourActuelle.pop();
  tourPrecedente.push(disque);

  // on réduit le compteur de coups
  gameState.moveCount--;

  // Si on est en mode défi, on doit aussi réaugmenter les coups restants
  if (gameState.isChallengeMode) {
    gameState.movesLeft++;
  }

  return { ok: true };
}

// vérifie si la condition de victoire est atteinte
export function verifierVictoire() {
  return gameState.towers[2].length === gameState.diskCount;
}
