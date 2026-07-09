'use client';
import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChessPiece from './ChessPiece';
import { pieceKey } from '@/lib/chess/pieces';
import { BOARD_THEMES } from '@/lib/chess/themes';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const DRAG_THRESHOLD = 6; // px of movement before a mousedown counts as a drag instead of a click

function squareName(row, col, orientation) {
  const f = orientation === 'white' ? col : 7 - col;
  const r = orientation === 'white' ? 7 - row : row;
  return FILES[f] + (r + 1);
}

export default function Chessboard({
  chess,
  onMove,
  orientation = 'white',
  interactive = true,
  lastMove = null,
  highlightCheck = true,
  size,
  themeId = 'wood',
}) {
  const theme = BOARD_THEMES[themeId] || BOARD_THEMES.wood;
  const containerRef = useRef(null);
  const [boardSize, setBoardSize] = useState(0);
  const [selected, setSelected] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [hoverSquare, setHoverSquare] = useState(null);

  useEffect(() => {
  const update = () => {
    if (!containerRef.current) return;

    const parentWidth = containerRef.current.parentElement.clientWidth;

    let width = parentWidth;

    if (window.innerWidth < 640) {
      width = Math.min(parentWidth, window.innerWidth - 24);
    } else if (window.innerWidth < 1024) {
      width = Math.min(parentWidth, 500);
    } else {
      width = Math.min(parentWidth, 550);
    }

    setBoardSize(width);
  };

  update();

  window.addEventListener("resize", update);

  return () => window.removeEventListener("resize", update);
}, []);

  const squareSize = boardSize / 8;
  console.log("Board:", boardSize, "Square:", squareSize);
  const board = chess.board();
  const turn = chess.turn();
  const inCheck = highlightCheck && chess.inCheck();

  const kingSquare = useMemo(() => {
    if (!inCheck) return null;
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = board[r][f];
        if (sq && sq.type === 'k' && sq.color === turn) {
          return FILES[f] + (8 - r);
        }
      }
    }
    return null;
  }, [board, inCheck, turn]);

  const trySelect = (square) => {
    const piece = chess.get(square);
    if (!piece || piece.color !== chess.turn()) {
      setSelected(null);
      setLegalTargets([]);
      return;
    }
    const moves = chess.moves({ square, verbose: true });
    setSelected(square);
    setLegalTargets(moves.map((m) => m.to));
  };

  const attemptMove = (from, to) => {
    const moves = chess.moves({ square: from, verbose: true });
    const found = moves.find((m) => m.to === to);
    if (!found) return false;
    const move = found.promotion ? { from, to, promotion: 'q' } : { from, to };
    const result = chess.move(move);
    if (result) {
      onMove && onMove(result);
      setSelected(null);
      setLegalTargets([]);
      return true;
    }
    return false;
  };

  // Single entry point for both click-to-move and drag-to-move.
  // We no longer use the native onClick event at all, because it fires
  // *after* mouseup and was racing against the manual selection state,
  // causing a click to select-then-immediately-deselect a piece.
  const handlePointerDown = (e, square) => {
    if (!interactive) return;
    const point = e.touches ? e.touches[0] : e;
    const rect = containerRef.current.getBoundingClientRect();
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;

    // Clicking a legal destination while something is already selected:
    // resolve immediately, whether it's a plain move or a capture.
    if (selected && legalTargets.includes(square)) {
      attemptMove(selected, square);
      setDragging(null);
      return;
    }

    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      const wasSelected = selected === square;
      trySelect(square);
      setDragging({
        from: square,
        x,
        y,
        startX: x,
        startY: y,
        moved: false,
        wasSelected,
      });
    } else {
      // Clicked an empty/opponent square that isn't a legal target -> clear selection
      setSelected(null);
      setLegalTargets([]);
    }
  };

  useEffect(() => {
    if (!dragging) return;
    const onMoveEv = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      setDragging((d) => {
        if (!d) return d;
        const dist = Math.hypot(x - d.startX, y - d.startY);
        return { ...d, x, y, moved: d.moved || dist > DRAG_THRESHOLD };
      });
      const col = Math.floor(x / squareSize);
      const row = Math.floor(y / squareSize);
      if (col >= 0 && col < 8 && row >= 0 && row < 8) {
        setHoverSquare(squareName(row, col, orientation));
      } else {
        setHoverSquare(null);
      }
    };
    const onUp = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const point = e.changedTouches ? e.changedTouches[0] : e;
      const x = point.clientX - rect.left;
      const y = point.clientY - rect.top;
      const col = Math.floor(x / squareSize);
      const row = Math.floor(y / squareSize);
      const to = col >= 0 && col < 8 && row >= 0 && row < 8
        ? squareName(row, col, orientation)
        : null;

      setDragging((d) => {
        if (!d) return null;
        if (d.moved) {
          // Real drag: attempt the move if dropped on a different square
          if (to && d.from !== to) attemptMove(d.from, to);
        } else if (d.wasSelected) {
          // A genuine click (no movement) on the already-selected piece: toggle it off
          setSelected(null);
          setLegalTargets([]);
        }
        // else: this was the initial click that just selected the piece
        // (trySelect already ran in handlePointerDown) — leave selection as-is
        return null;
      });
      setHoverSquare(null);
    };
    window.addEventListener('mousemove', onMoveEv);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMoveEv, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMoveEv);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMoveEv);
      window.removeEventListener('touchend', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, orientation, squareSize]);

  return (
  <div
    ref={containerRef}
    className="relative aspect-square rounded-2xl overflow-hidden select-none mx-auto"
    style={{
      width: boardSize,
      height: boardSize,
      boxShadow:
        '0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 40px rgba(0,0,0,0.35)',
      background: theme.outerBg,
      padding: 8,
    }}
  >
      <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ background: theme.innerBg }}>
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
          {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const square = squareName(row, col, orientation);
            const isLight = (row + col) % 2 === 0;
            const isSelected = selected === square;
            const isLegal = legalTargets.includes(square);
            const isLastFrom = lastMove && lastMove.from === square;
            const isLastTo = lastMove && lastMove.to === square;
            const isHover = hoverSquare === square && dragging;
            const isCheck = kingSquare === square;
            const piece = (() => {
              const f = orientation === 'white' ? col : 7 - col;
              const r = orientation === 'white' ? row : 7 - row;
              return board[r][f];
            })();
            const pk = pieceKey(piece);
            const isDraggingThis = dragging && dragging.from === square && dragging.moved;
            return (
              <div
                key={square}
                onMouseDown={(e) => handlePointerDown(e, square)}
                onTouchStart={(e) => handlePointerDown(e, square)}
                className="relative flex items-center justify-center"
                style={{ background: isLight ? theme.light : theme.dark }}
              >
                {col === 0 && (
                  <span
                    className="absolute top-0.5 left-1 text-[10px] font-semibold opacity-70"
                    style={{ color: isLight ? theme.lightText : theme.darkText }}
                  >
                    {orientation === 'white' ? 8 - row : row + 1}
                  </span>
                )}
                {row === 7 && (
                  <span
                    className="absolute bottom-0.5 right-1 text-[10px] font-semibold opacity-70"
                    style={{ color: isLight ? theme.lightText : theme.darkText }}
                  >
                    {orientation === 'white' ? FILES[col] : FILES[7 - col]}
                  </span>
                )}
                {(isLastFrom || isLastTo) && (
                  <div className="absolute inset-0 bg-yellow-300/30 mix-blend-overlay" />
                )}
                {isSelected && (
                  <div className="absolute inset-0 ring-4 ring-emerald-400/70 ring-inset" />
                )}
                {isCheck && (
                  <div className="absolute inset-0 bg-red-500/45 animate-pulse" />
                )}
                {isHover && (
                  <div className="absolute inset-0 ring-4 ring-sky-400/80 ring-inset" />
                )}
                {isLegal && !piece && (
                  <div className="absolute w-1/3 h-1/3 rounded-full bg-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                )}
                {isLegal && piece && (
                  <div className="absolute inset-1 rounded-full ring-4 ring-emerald-500/60" />
                )}
                {pk && !isDraggingThis && (
                  <ChessPiece pieceKey={pk} size={squareSize} whiteColor={theme.whitePiece} blackColor={theme.blackPiece} />
                )}
              </div>
            );
          })}
        </div>
        {dragging && dragging.moved && (() => {
          const piece = chess.get(dragging.from);
          const pk = pieceKey(piece);
          if (!pk) return null;
          return (
            <div
              className="absolute pointer-events-none z-50"
              style={{
                left: dragging.x - squareSize / 2,
                top: dragging.y - squareSize / 2,
                width: squareSize,
                height: squareSize,
              }}
            >
              <ChessPiece pieceKey={pk} size={squareSize} dragging whiteColor={theme.whitePiece} blackColor={theme.blackPiece} />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
