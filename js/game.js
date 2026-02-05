// js/game.js
// Ce fichier contient uniquement la logique (règles + état).
// AUCUN accès au DOM ici (pas de querySelector, pas de HTML).
// L'interface (affichage + clics) est gérée ailleurs (ui.js).

/**
 * Etat global du jeu.
 * towers = 3 "piles" (stack) représentées par des tableaux JS.
 *
 * Convention de stockage :
 * - Chaque disque est un nombre (1 = plus petit, n = plus grand).
 * - Dans une tour, le dernier élément du tableau = le disque tout en haut.
 *
 * Exemple avec 4 disques au départ :
 * towers[0] = [4, 3, 2, 1]   -> 1 est au sommet (dernier élément)
 * towers[1] = []
 * towers[2] = []
 */
export const gameState = {
  towers: [[], [], []],  // Les 3 tours (piles)
  diskCount: 4,          // Nombre total de disques dans la partie
  moveCount: 0,          // Nombre de déplacements effectués
  lastMove: null,        // Infos sur le dernier déplacement (utile pour l'animation UI)
};

/**
 * Initialise une nouvelle partie.
 * - Remet le compteur à 0
 * - Place tous les disques sur la tour 0 (de grand -> petit)
 *
 * @param {number|string} nombreDeDisques - nombre de disques demandé (ex: "4" depuis un <select>)
 */
export function initialiserJeu(nombreDeDisques) {
  // Sécurise le paramètre : transforme en entier et limite entre 1 et 10
  const n = clampInt(nombreDeDisques, 1, 10);

  // Reset des variables de jeu
  gameState.diskCount = n;
  gameState.moveCount = 0;
  gameState.lastMove = null;

  // Construction de la tour de départ :
  // Array.from(...) crée un tableau de longueur n
  // (_, i) => n - i crée la suite [n, n-1, ..., 1]
  //
  // Exemple n = 4 => [4, 3, 2, 1]
  // (1 est en haut car il est en dernier dans le tableau)
  gameState.towers = [
    Array.from({ length: n }, (_, i) => n - i),
    [],
    [],
  ];
}

/**
 * Vérifie si un déplacement est autorisé selon les règles du Tour de Hanoï.
 * Rappels règles :
 * - On déplace 1 seul disque (celui du sommet)
 * - On ne pose jamais un disque sur un disque plus petit
 *
 * @param {number} tourSource - index 0..2
 * @param {number} tourDestination - index 0..2
 * @returns {boolean} true si le move est autorisé, sinon false
 */
export function deplacementValide(tourSource, tourDestination) {
  // Index invalide => déplacement impossible
  if (!isTowerIndex(tourSource) || !isTowerIndex(tourDestination)) return false;

  // Source = destination => ça ne sert à rien => interdit
  if (tourSource === tourDestination) return false;

  // Récupère les tableaux correspondant aux deux tours
  const src = gameState.towers[tourSource];
  const dst = gameState.towers[tourDestination];

  // Si la tour source est vide => aucun disque à déplacer
  if (src.length === 0) return false;

  // Disque à déplacer = disque au sommet de la source (dernier élément)
  const disk = src[src.length - 1];

  // Disque au sommet de la destination (dernier élément)
  // Si la destination est vide, topDst vaudra undefined
  const topDst = dst[dst.length - 1];

  // Si destination vide => toujours autorisé
  if (topDst === undefined) return true;

  // Sinon, autorisé uniquement si le disque déplacé est plus petit
  // (ex: 2 peut aller sur 3, mais pas sur 1)
  return disk < topDst;
}

/**
 * Effectue réellement le déplacement d'un disque si c'est valide.
 * Cette fonction modifie gameState (c'est sa responsabilité).
 *
 * @param {number} tourSource - index 0..2
 * @param {number} tourDestination - index 0..2
 * @returns {{ok: boolean, reason?: string}}
 * - ok=true si déplacement fait
 * - ok=false + reason si déplacement interdit
 */
export function deplacerDisque(tourSource, tourDestination) {
  // On vérifie d'abord les règles, sinon on refuse
  if (!deplacementValide(tourSource, tourDestination)) {
    return { ok: false, reason: "Déplacement interdit (pas sur un disque plus petit)." };
  }

  const src = gameState.towers[tourSource];
  const dst = gameState.towers[tourDestination];

  // pop() enlève et retourne le dernier élément (le sommet)
  const disk = src.pop();

  // push() ajoute à la fin => devient le nouveau sommet de la destination
  dst.push(disk);

  // Mise à jour du compteur et mémorisation du dernier move
  gameState.moveCount++;
  gameState.lastMove = { from: tourSource, to: tourDestination, disk };

  return { ok: true };
}

/**
 * Vérifie si la partie est gagnée.
 * Condition choisie : tous les disques sur la tour 2.
 * (Comme on impose toujours les règles, l'ordre est forcément correct.)
 *
 * @returns {boolean}
 */
export function verifierVictoire() {
  return gameState.towers[2].length === gameState.diskCount;
}

/* ======================
   Fonctions utilitaires
   ====================== */

/**
 * Vérifie qu'un index de tour est valide (0,1,2).
 * @param {any} i
 * @returns {boolean}
 */
function isTowerIndex(i) {
  return Number.isInteger(i) && i >= 0 && i <= 2;
}

/**
 * Transforme une valeur en entier et la "borne" entre min et max.
 * Utile car un <select> HTML renvoie souvent un string ("4").
 *
 * @param {any} v
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clampInt(v, min, max) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}
