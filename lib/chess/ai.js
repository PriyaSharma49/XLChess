import { Chess } from 'chess.js';

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const PST = {
  p: [0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20],
};

function evaluate(chess) {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -100000 : 100000;
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) return 0;
  const board = chess.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f]; if (!sq) continue;
      const val = PIECE_VALUES[sq.type];
      const idx = r * 8 + f;
      const pstIdx = sq.color === 'w' ? idx : (7 - r) * 8 + f;
      const pst = PST[sq.type][pstIdx];
      score += sq.color === 'w' ? (val + pst) : -(val + pst);
    }
  }
  return score;
}

function orderMoves(moves) {
  return [...moves].sort((a, b) => {
    const sA = (a.captured ? PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece] : 0) + (a.promotion ? 900 : 0) + (a.san?.includes('+') ? 50 : 0);
    const sB = (b.captured ? PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece] : 0) + (b.promotion ? 900 : 0) + (b.san?.includes('+') ? 50 : 0);
    return sB - sA;
  });
}

function quiescence(chess, alpha, beta, maximizing, ply = 0) {
  const stand = evaluate(chess);
  if (ply > 8) return stand;
  if (maximizing) { if (stand >= beta) return beta; if (stand > alpha) alpha = stand; }
  else { if (stand <= alpha) return alpha; if (stand < beta) beta = stand; }
  const moves = chess.moves({ verbose: true }).filter((m) => m.captured || m.promotion);
  const ordered = orderMoves(moves);
  for (const m of ordered) {
    chess.move(m);
    const s = quiescence(chess, alpha, beta, !maximizing, ply + 1);
    chess.undo();
    if (maximizing) { if (s >= beta) return beta; if (s > alpha) alpha = s; }
    else { if (s <= alpha) return alpha; if (s < beta) beta = s; }
  }
  return maximizing ? alpha : beta;
}

// Transposition table (fen -> {depth, score, flag})
function minimaxTT(chess, depth, alpha, beta, maximizing, quies, tt) {
  const alphaOrig = alpha;
  const key = chess.fen();
  const cached = tt.get(key);
  if (cached && cached.depth >= depth) {
    if (cached.flag === 'EXACT') return cached.score;
    if (cached.flag === 'LOWER' && cached.score > alpha) alpha = cached.score;
    else if (cached.flag === 'UPPER' && cached.score < beta) beta = cached.score;
    if (alpha >= beta) return cached.score;
  }
  if (chess.isGameOver()) return evaluate(chess);
  if (depth === 0) return quies ? quiescence(chess, alpha, beta, maximizing) : evaluate(chess);
  const moves = orderMoves(chess.moves({ verbose: true }));
  let best = maximizing ? -Infinity : Infinity;
  for (const m of moves) {
    chess.move(m);
    const s = minimaxTT(chess, depth - 1, alpha, beta, !maximizing, quies, tt);
    chess.undo();
    if (maximizing) {
      if (s > best) best = s;
      if (s > alpha) alpha = s;
    } else {
      if (s < best) best = s;
      if (s < beta) beta = s;
    }
    if (beta <= alpha) break;
  }
  let flag = 'EXACT';
  if (best <= alphaOrig) flag = 'UPPER';
  else if (best >= beta) flag = 'LOWER';
  tt.set(key, { depth, score: best, flag });
  return best;
}

const DIFF_CONFIG = {
  beginner:     { depth: 1, randomness: 0.85, blunder: 0.30, quiescence: false, label: 'Beginner' },
  easy:         { depth: 2, randomness: 0.35, blunder: 0.30, quiescence: false, label: 'Easy' },
  intermediate: { depth: 2, randomness: 0.10, blunder: 0.20, quiescence: false, label: 'Intermediate' },
  advanced:     { depth: 3, randomness: 0.00, blunder: 0.10, quiescence: false, label: 'Advanced' },
  expert:       { depth: 3, randomness: 0.00, blunder: 0.00, quiescence: true,  label: 'Expert' },
  master:       { depth: 4, randomness: 0.00, blunder: 0.00, quiescence: true,  label: 'Master' },
  grandmaster:  { depth: 5, randomness: 0.00, blunder: 0.00, quiescence: true,  label: 'Grandmaster', useTT: true, iterativeDeepening: true },
};

export const DIFFICULTIES = Object.keys(DIFF_CONFIG);
export const DIFF_META = DIFF_CONFIG;

export function pickAIMove(fen, difficulty) {
  const cfg = DIFF_CONFIG[difficulty] || DIFF_CONFIG.intermediate;
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  if (Math.random() < cfg.randomness) {
    const caps = moves.filter((m) => m.captured);
    if (caps.length && Math.random() < 0.35) return caps[Math.floor(Math.random() * caps.length)];
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const isMax = chess.turn() === 'w';
  const ordered = orderMoves(moves);
  const tt = new Map();

  const searchAt = (dep) => {
    const results = [];
    for (const m of ordered) {
      chess.move(m);
      const s = cfg.useTT
        ? minimaxTT(chess, dep - 1, -Infinity, Infinity, !isMax, cfg.quiescence, tt)
        : minimaxTT(chess, dep - 1, -Infinity, Infinity, !isMax, cfg.quiescence, new Map());
      chess.undo();
      results.push({ move: m, score: s });
    }
    results.sort((a, b) => (isMax ? b.score - a.score : a.score - b.score));
    return results;
  };

  let scored;
  if (cfg.iterativeDeepening) {
    scored = searchAt(1);
    const start = Date.now();
    const budgetMs = 1400;
    for (let d = 2; d <= cfg.depth; d++) {
      if (Date.now() - start > budgetMs) break;
      scored = searchAt(d);
    }
  } else {
    scored = searchAt(cfg.depth);
  }

  if (cfg.blunder > 0 && Math.random() < cfg.blunder && scored.length > 1) {
    const pool = scored.slice(0, Math.min(3, scored.length));
    return pool[Math.floor(Math.random() * pool.length)].move;
  }
  return scored[0].move;
}
