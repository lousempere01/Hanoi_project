// js/game.js

export const gameState = {
  towers: [[], [], []], // chaque tour: tableau de nombres, du bas vers le haut (ex: [4,3,1])
  moveCount: 0,
  diskCount: 4,
  lastMove: null, // { from, to, disk }
};

export function initialiserJeu(nombreDeDisques) {
  const n = clampInt(nombreDeDisques, 1, 10);
  gameState.diskCount = n;
  gameState.moveCount = 0;
  gameState.lastMove = null;

  // Représentation: plus grand nombre = disque plus grand
  gameState.towers = [
    Array.from({ length: n }, (_, i) => n - i), // [n, n-1, ..., 1]
    [],
    [],
  ];
}

export function deplacementValide(tourSource, tourDestination) {
  if (!isTowerIndex(tourSource) || !isTowerIndex(tourDestination)) return false;
  if (tourSource === tourDestination) return false;

  const src = gameState.towers[tourSource];
  const dst = gameState.towers[tourDestination];

  if (src.length === 0) return false;

  const disk = src[src.length - 1];
  const topDst = dst[dst.length - 1];

  // Si destination vide => ok. Sinon, disque doit être plus petit.
  if (typeof topDst === "undefined") return true;
  return disk < topDst;
}

export function deplacerDisque(tourSource, tourDestination) {
  if (!deplacementValide(tourSource, tourDestination)) {
    return { ok: false, reason: "Déplacement interdit (règle: jamais sur plus petit)." };
  }

  const src = gameState.towers[tourSource];
  const dst = gameState.towers[tourDestination];

  const disk = src.pop();
  dst.push(disk);

  gameState.moveCount += 1;
  gameState.lastMove = { from: tourSource, to: tourDestination, disk };

  return { ok: true };
}

export function verifierVictoire() {
  // victoire: tous les disques sur la tour 3 (index 2), dans le bon ordre
  return gameState.towers[2].length === gameState.diskCount;
}

/* Utils */
function isTowerIndex(i) {
  return Number.isInteger(i) && i >= 0 && i <= 2;
}

function clampInt(v, min, max) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}
