'use client';
import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import { pickAIMove } from '@/lib/chess/ai';

export default function HeroAutoBoard() {
  const [chess] = useState(() => new Chess());
  const [, setTick] = useState(0);
  const [lastMove, setLastMove] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const play = () => {
      if (chess.isGameOver() || chess.history().length > 80) {
        // Restart after brief pause
        timerRef.current = setTimeout(() => {
          chess.reset();
          setLastMove(null);
          setTick((t) => t + 1);
          play();
        }, 2200);
        return;
      }
      const diff = Math.random() < 0.5 ? 'medium' : 'hard';
      const move = pickAIMove(chess.fen(), diff);
      if (!move) return;
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      setLastMove({ from: move.from, to: move.to });
      setTick((t) => t + 1);
      timerRef.current = setTimeout(play, 900 + Math.random() * 700);
    };
    timerRef.current = setTimeout(play, 800);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Chessboard
      chess={chess}
      interactive={false}
      lastMove={lastMove}
    />
  );
}
