'use client';

const KEY = 'xlchess:stats:v1';
const DIFF_ORDER = ['beginner', 'easy', 'intermediate', 'advanced', 'expert', 'master', 'grandmaster'];

const DEFAULT_STATS = {
  games: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  checkmates: 0,
  blitzWins: 0,
  fastestWin: null,
  puzzlesSolved: 0,
  puzzleIds: [],
  openingsPlayed: [],
  bestDifficulty: null,
};

export function readStats() {
  if (typeof window === 'undefined') return { ...DEFAULT_STATS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch { return { ...DEFAULT_STATS }; }
}

export function writeStats(next) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
}

export function bumpStats(mutator) {
  const cur = readStats();
  const next = { ...cur };
  mutator(next);
  writeStats(next);
  return next;
}

export function betterDifficulty(a, b) {
  const ia = DIFF_ORDER.indexOf(a || '');
  const ib = DIFF_ORDER.indexOf(b || '');
  return ia >= ib ? a : b;
}

export function recordPuzzleSolved(id) {
  return bumpStats((s) => {
    if (id && s.puzzleIds.includes(id)) return;
    if (id) s.puzzleIds = [...s.puzzleIds, id];
    s.puzzlesSolved = (s.puzzlesSolved || 0) + 1;
  });
}

export function recordOpening(name) {
  if (!name) return;
  bumpStats((s) => {
    if (!s.openingsPlayed.includes(name)) s.openingsPlayed = [...s.openingsPlayed, name];
  });
}

export function recordGameResult({ playerColor, mode, difficulty, tcKey, ended, moves, openingName }) {
  bumpStats((s) => {
    s.games = (s.games || 0) + 1;
    if (openingName && !s.openingsPlayed.includes(openingName)) s.openingsPlayed = [...s.openingsPlayed, openingName];
    if (!ended) return;
    const isDraw = ended.type !== 'checkmate';
    if (isDraw) { s.draws = (s.draws || 0) + 1; return; }
    const playerIsWhite = mode === '2p' ? true : playerColor === 'w';
    // In 2p mode the winner is determined by ended.winner; count wins as +1 (either side)
    const won = mode === '2p' ? true : (ended.winner === (playerIsWhite ? 'White' : 'Black'));
    if (won) {
      s.wins = (s.wins || 0) + 1;
      if (ended.reason !== 'resign' && ended.reason !== 'timeout') {
        s.checkmates = (s.checkmates || 0) + 1;
      }
      if (tcKey === 'blitz' || tcKey === 'bullet') s.blitzWins = (s.blitzWins || 0) + 1;
      if (moves != null && (s.fastestWin == null || moves < s.fastestWin)) s.fastestWin = moves;
      if (mode === 'ai') s.bestDifficulty = betterDifficulty(s.bestDifficulty, difficulty);
    } else {
      s.losses = (s.losses || 0) + 1;
    }
  });
}
