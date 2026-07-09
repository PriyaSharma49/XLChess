// Unicode-like premium SVG chess pieces. Rendered inline via <img> using data URLs is overkill;
// we'll use character-based glyphs with the classic set for crisp rendering + gradients.
export const PIECE_GLYPH = {
  wK: '\u2654',
  wQ: '\u2655',
  wR: '\u2656',
  wB: '\u2657',
  wN: '\u2658',
  wP: '\u2659',
  bK: '\u265A',
  bQ: '\u265B',
  bR: '\u265C',
  bB: '\u265D',
  bN: '\u265E',
  bP: '\u265F',
};

export function pieceKey(piece) {
  if (!piece) return null;
  return (piece.color === 'w' ? 'w' : 'b') + piece.type.toUpperCase();
}
