// Simple opening detector: matches move history prefix against a curated list of well-known openings.
// Returns the most specific match found.

const OPENINGS = [
  // e4 openings
  { name: 'Ruy L\u00f3pez', eco: 'C60', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
  { name: 'Italian Game', eco: 'C50', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'] },
  { name: 'Scotch Game', eco: 'C44', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'] },
  { name: 'Petrov Defense', eco: 'C42', moves: ['e4', 'e5', 'Nf3', 'Nf6'] },
  { name: 'Philidor Defense', eco: 'C41', moves: ['e4', 'e5', 'Nf3', 'd6'] },
  { name: "King's Gambit", eco: 'C30', moves: ['e4', 'e5', 'f4'] },
  { name: 'Vienna Game', eco: 'C25', moves: ['e4', 'e5', 'Nc3'] },
  { name: 'Sicilian: Najdorf', eco: 'B90', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'] },
  { name: 'Sicilian: Dragon', eco: 'B70', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'] },
  { name: 'Sicilian Defense', eco: 'B20', moves: ['e4', 'c5'] },
  { name: 'French Defense', eco: 'C00', moves: ['e4', 'e6'] },
  { name: 'Caro-Kann Defense', eco: 'B10', moves: ['e4', 'c6'] },
  { name: 'Pirc Defense', eco: 'B07', moves: ['e4', 'd6'] },
  { name: 'Alekhine Defense', eco: 'B02', moves: ['e4', 'Nf6'] },
  { name: 'Scandinavian Defense', eco: 'B01', moves: ['e4', 'd5'] },
  { name: 'Modern Defense', eco: 'B06', moves: ['e4', 'g6'] },
  // d4 openings
  { name: "Queen's Gambit Declined", eco: 'D30', moves: ['d4', 'd5', 'c4', 'e6'] },
  { name: "Queen's Gambit Accepted", eco: 'D20', moves: ['d4', 'd5', 'c4', 'dxc4'] },
  { name: 'Slav Defense', eco: 'D10', moves: ['d4', 'd5', 'c4', 'c6'] },
  { name: "Queen's Gambit", eco: 'D06', moves: ['d4', 'd5', 'c4'] },
  { name: "King's Indian Defense", eco: 'E60', moves: ['d4', 'Nf6', 'c4', 'g6'] },
  { name: 'Nimzo-Indian Defense', eco: 'E20', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'] },
  { name: "Queen's Indian Defense", eco: 'E12', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6'] },
  { name: 'Grunfeld Defense', eco: 'D80', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5'] },
  { name: 'Dutch Defense', eco: 'A80', moves: ['d4', 'f5'] },
  { name: 'Benoni Defense', eco: 'A60', moves: ['d4', 'Nf6', 'c4', 'c5'] },
  { name: 'London System', eco: 'D02', moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'] },
  { name: 'Trompowsky Attack', eco: 'A45', moves: ['d4', 'Nf6', 'Bg5'] },
  { name: 'Colle System', eco: 'D04', moves: ['d4', 'd5', 'Nf3', 'Nf6', 'e3'] },
  // Flank
  { name: 'English Opening', eco: 'A10', moves: ['c4'] },
  { name: 'R\u00e9ti Opening', eco: 'A04', moves: ['Nf3', 'd5', 'c4'] },
  { name: 'King\u2019s Indian Attack', eco: 'A07', moves: ['Nf3', 'd5', 'g3'] },
  { name: 'Bird\u2019s Opening', eco: 'A02', moves: ['f4'] },
  { name: 'Larsen Opening', eco: 'A01', moves: ['b3'] },
];

function stripSan(san) {
  return san.replace(/[+#!?]/g, '');
}

export function detectOpening(historyVerbose) {
  const sans = historyVerbose.map((m) => stripSan(m.san));
  let best = null;
  for (const op of OPENINGS) {
    if (op.moves.length > sans.length) continue;
    let ok = true;
    for (let i = 0; i < op.moves.length; i++) {
      if (op.moves[i] !== sans[i]) { ok = false; break; }
    }
    if (ok && (!best || op.moves.length > best.moves.length)) {
      best = op;
    }
  }
  return best;
}
