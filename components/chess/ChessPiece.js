'use client';
import { motion } from 'framer-motion';
import { PIECE_GLYPH } from '@/lib/chess/pieces';

export default function ChessPiece({ pieceKey: pk, size = 56, dragging = false, whiteColor = '#f8fafc', blackColor = '#0b0f19' }) {
  if (!pk) return null;
  const isWhite = pk[0] === 'w';
  const color = isWhite ? whiteColor : blackColor;
  return (
    <motion.div
      layout
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="select-none pointer-events-none flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span
        className="leading-none"
        style={{
          fontSize: size * 0.85,
          color,
          textShadow: isWhite
            ? '0 2px 4px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.8)'
            : '0 2px 4px rgba(0,0,0,0.35), 0 0 1px rgba(255,255,255,0.25)',
          filter: dragging ? 'drop-shadow(0 10px 14px rgba(0,0,0,0.55))' : 'none',
          WebkitTextStroke: isWhite ? '0.6px rgba(0,0,0,0.55)' : '0.6px rgba(255,255,255,0.15)',
        }}
      >
        {PIECE_GLYPH[pk]}
      </span>
    </motion.div>
  );
}
