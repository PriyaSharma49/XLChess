// Curated tactical puzzles (real famous positions & tactics)
// solution = sequence of SAN moves; player plays odd-indexed (0,2,4...) and engine plays even (1,3...)
export const PUZZLES = [
  {
    id: 'p1',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    turn: 'w',
    theme: 'Mate in 1',
    rating: 800,
    solution: ['Qxf7#'],
    description: 'Scholar\u2019s mate finish. Deliver checkmate in one.',
  },
  {
    id: 'p2',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    turn: 'w',
    theme: 'Mate in 1',
    rating: 900,
    solution: ['Ra8#'],
    description: 'Back rank weakness \u2014 finish the game.',
  },
  {
    id: 'p3',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
    turn: 'w',
    theme: 'Fork',
    rating: 1200,
    solution: ['Nxe5', 'Nxe5', 'd4'],
    description: 'Win a pawn and open the center with a discovered attack.',
  },
  {
    id: 'p4',
    fen: 'r3k2r/pp3ppp/2p5/4n3/8/8/PPP2PPP/R1B2RK1 w kq - 0 12',
    turn: 'w',
    theme: 'Pin',
    rating: 1300,
    solution: ['Bxe5'],
    description: 'Grab material \u2014 the knight cannot be safely defended.',
  },
  {
    id: 'p5',
    fen: 'r4rk1/pp3ppp/2p5/q7/3Q4/2N5/PP3PPP/2KR3R w - - 0 1',
    turn: 'w',
    theme: 'Mate in 2',
    rating: 1500,
    solution: ['Qxa5'],
    description: 'Trade queens into a winning endgame.',
  },
  {
    id: 'p6',
    fen: 'r1b2rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 7',
    turn: 'w',
    theme: 'Development',
    rating: 1100,
    solution: ['a3'],
    description: 'Kick the bishop and gain tempo for development.',
  },
  {
    id: 'p7',
    fen: '2r3k1/5ppp/p7/1p6/8/1P4P1/P4P1P/3R2K1 w - - 0 1',
    turn: 'w',
    theme: 'Rook endgame',
    rating: 1400,
    solution: ['Rd8+', 'Kh7', 'Rxc8'],
    description: 'Skewer along the back rank to win the rook.',
  },
  {
    id: 'p8',
    fen: '6k1/pp4pp/2p5/2b1P3/8/2P5/PP4PP/4R1K1 w - - 0 1',
    turn: 'w',
    theme: 'Mate in 2',
    rating: 1600,
    solution: ['Re8+', 'Bf8', 'Rxf8#'],
    description: 'Sacrifice to break the defender \u2014 mate follows.',
  },
];

export function stripSan(san) {
  return san.replace(/[+#!?]/g, '');
}
