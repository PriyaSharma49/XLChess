'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import Chessboard from './Chessboard';
import { pickAIMove, DIFFICULTIES, DIFF_META } from '@/lib/chess/ai';
import { recordGameResult, recordOpening } from '@/lib/xlchess/stats';
import { PIECE_GLYPH } from '@/lib/chess/pieces';
import { detectOpening } from '@/lib/chess/openings';
import { sounds } from '@/lib/chess/sounds';
import { THEME_LIST } from '@/lib/chess/themes';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  RotateCcw, Undo2, Crown, Swords, Bot, Users, ChevronRight,
  Volume2, VolumeX, Palette, BookOpen, Flag, Sparkles, Lightbulb,
  Baby, GraduationCap, Star, Award, Flame, Skull, Trophy,
  Save, Upload, Download, Timer, Check, CheckCircle2,
} from 'lucide-react';

const DIFF_ICONS = { beginner: Baby, easy: GraduationCap, intermediate: Star, advanced: Award, expert: Flame, master: Skull, grandmaster: Trophy };
const DIFF_COLORS = {
  beginner: 'from-emerald-500 to-teal-500',
  easy: 'from-lime-500 to-emerald-500',
  intermediate: 'from-sky-500 to-blue-500',
  advanced: 'from-violet-500 to-purple-500',
  expert: 'from-orange-500 to-red-500',
  master: 'from-rose-600 to-red-700',
  grandmaster: 'from-amber-400 via-yellow-500 to-orange-500',
};
const DIFF_DESCRIPTIONS = {
  beginner: 'Mostly random — great for first-timers',
  easy: 'Some tactics, lots of forgiveness',
  intermediate: 'Solid club-player behavior',
  advanced: 'Punishes blunders, plans ahead',
  expert: 'Deep search + quiescence',
  master: 'Maximum depth. Bring your A-game.',
  grandmaster: 'Iterative deepening + transposition table',
};

const TIME_CONTROLS = {
  unlimited: { label: 'Unlimited', short: '∞', ms: null, inc: 0 },
  bullet:    { label: 'Bullet 1+0', short: '1+0', ms: 60_000, inc: 0 },
  blitz:     { label: 'Blitz 3+2', short: '3+2', ms: 180_000, inc: 2000 },
  rapid:     { label: 'Rapid 10+0', short: '10+0', ms: 600_000, inc: 0 },
  classical: { label: 'Classical 30+0', short: '30+0', ms: 1_800_000, inc: 0 },
};

function fmtTime(ms) {
  if (ms == null) return '∞';
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  const t = `${m}:${String(r).padStart(2, '0')}`;
  return ms < 10000 ? `${t}.${String(Math.floor((ms % 1000) / 100)).padStart(1, '0')}` : t;
}

function capturedFromHistory(history) {
  const white = [], black = [];
  for (const m of history) {
    if (m.captured) {
      if (m.color === 'w') white.push('b' + m.captured.toUpperCase());
      else black.push('w' + m.captured.toUpperCase());
    }
  }
  return { white, black };
}

function materialAdvantage(history) {
  const values = { P: 1, N: 3, B: 3, R: 5, Q: 9 };
  let score = 0;
  for (const m of history) {
    if (m.captured) {
      const v = values[m.captured.toUpperCase()] || 0;
      score += m.color === 'w' ? v : -v;
    }
  }
  return score;
}

function playMoveSound(move, soundOn) {
  if (!soundOn) return;
  if (move.san?.includes('#')) return sounds.end();
  if (move.san?.includes('+')) return sounds.check();
  if (move.flags?.includes('k') || move.flags?.includes('q')) return sounds.castle();
  if (move.captured) return sounds.capture();
  sounds.move();
}

// Small 2x2 checkerboard swatch that actually previews the board theme,
// rather than a plain diagonal split.
function ThemeSwatch({ dark, light }) {
  return (
    <span className="grid grid-cols-2 grid-rows-2 w-6 h-6 rounded-md overflow-hidden ring-1 ring-white/15 shrink-0">
      <span style={{ background: light }} />
      <span style={{ background: dark }} />
      <span style={{ background: dark }} />
      <span style={{ background: light }} />
    </span>
  );
}

function SectionCard({ icon: Icon, label, children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-5 ${className}`}>
      {label && (
        <div className="flex items-center gap-1.5 text-white/60 text-xs uppercase tracking-wider mb-3 font-semibold">
          {Icon && <Icon className="w-3.5 h-3.5" />} {label}
        </div>
      )}
      {children}
    </div>
  );
}

export default function PlaySection() {
  const [chess] = useState(() => new Chess());
  const [, setTick] = useState(0);
  const [mode, setMode] = useState('ai');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [playerColor, setPlayerColor] = useState('w');
  const [history, setHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [gameEnded, setGameEnded] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [themeId, setThemeId] = useState('wood');
  const [hint, setHint] = useState(null); // {from,to}
  const [tcKey, setTcKey] = useState('unlimited');
  const [timeW, setTimeW] = useState(null);
  const [timeB, setTimeB] = useState(null);
  const [pgnDialogOpen, setPgnDialogOpen] = useState(false);
  const [pgnText, setPgnText] = useState('');
  const [savedCode, setSavedCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loadCode, setLoadCode] = useState('');
  const [loadError, setLoadError] = useState('');
  const aiTimer = useRef(null);
  const clockRef = useRef(null);

  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const diff = params.get("difficulty");

  if (diff && DIFFICULTIES.includes(diff)) {
    setMode("ai");
    setDifficulty(diff);
    newGame();
  }
}, []);

  // Initialize clocks when time control changes
  useEffect(() => {
    const tc = TIME_CONTROLS[tcKey];
    setTimeW(tc.ms);
    setTimeB(tc.ms);
  }, [tcKey]);

  // Countdown
  useEffect(() => {
    if (gameEnded || tcKey === 'unlimited' || history.length === 0) {
      clearInterval(clockRef.current);
      return;
    }
    const turn = chess.turn();
    clockRef.current = setInterval(() => {
      if (turn === 'w') {
        setTimeW((t) => {
          if (t == null) return t;
          const nt = t - 100;
          if (nt <= 0) { setGameEnded({ type: 'checkmate', winner: 'Black', reason: 'timeout' }); return 0; }
          return nt;
        });
      } else {
        setTimeB((t) => {
          if (t == null) return t;
          const nt = t - 100;
          if (nt <= 0) { setGameEnded({ type: 'checkmate', winner: 'White', reason: 'timeout' }); return 0; }
          return nt;
        });
      }
    }, 100);
    return () => clearInterval(clockRef.current);
  }, [history.length, gameEnded, tcKey, chess]);

  const checkEnd = () => {
    let ended = null;
    if (chess.isCheckmate()) ended = { type: 'checkmate', winner: chess.turn() === 'w' ? 'Black' : 'White' };
    else if (chess.isStalemate()) ended = { type: 'stalemate' };
    else if (chess.isThreefoldRepetition()) ended = { type: 'repetition' };
    else if (chess.isInsufficientMaterial()) ended = { type: 'insufficient' };
    else if (chess.isDraw()) ended = { type: 'draw' };
    if (ended) {
      setGameEnded(ended);
      if (soundOn) sounds.end();
      try {
        recordGameResult({
          playerColor, mode, difficulty, tcKey, ended,
          moves: Math.ceil(chess.history().length / 2),
          openingName: opening?.name || null,
        });
      } catch {}
    }
  };

  const applyIncrement = (colorMoved) => {
    const inc = TIME_CONTROLS[tcKey].inc;
    if (!inc) return;
    if (colorMoved === 'w') setTimeW((t) => (t == null ? t : t + inc));
    else setTimeB((t) => (t == null ? t : t + inc));
  };

  const onMove = (move) => {
    setHint(null);
    setHistory(chess.history({ verbose: true }));
    setLastMove({ from: move.from, to: move.to });
    playMoveSound(move, soundOn);
    applyIncrement(move.color);
    refresh();
    checkEnd();
  };

  useEffect(() => {
    if (mode !== 'ai' || gameEnded) return;
    if (chess.turn() === playerColor || chess.isGameOver()) return;
    setThinking(true);
    const baseDelay = { beginner: 300, easy: 400, intermediate: 500, advanced: 650, expert: 800, master: 950, grandmaster: 1100 };
    aiTimer.current = setTimeout(() => {
      const t0 = performance.now();
      const move = pickAIMove(chess.fen(), difficulty);
      const elapsed = performance.now() - t0;
      const finish = () => {
        if (move) {
          const res = chess.move({ from: move.from, to: move.to, promotion: move.promotion });
          if (res) {
            setLastMove({ from: res.from, to: res.to });
            setHistory(chess.history({ verbose: true }));
            playMoveSound(res, soundOn);
            applyIncrement(res.color);
            checkEnd();
          }
        }
        setThinking(false);
        refresh();
      };
      setTimeout(finish, Math.max(0, 250 - elapsed));
    }, baseDelay[difficulty] || 500);
    return () => clearTimeout(aiTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.length, mode, difficulty, playerColor, gameEnded]);

  const newGame = (opts = {}) => {
    clearTimeout(aiTimer.current);
    chess.reset();
    setHistory([]);
    setLastMove(null);
    setGameEnded(null);
    setThinking(false);
    setHint(null);
    setSavedCode(null);
    const tc = TIME_CONTROLS[tcKey];
    setTimeW(tc.ms); setTimeB(tc.ms);
    if (opts.color) setPlayerColor(opts.color);
    refresh();
  };

  const undo = () => {
    if (mode === 'ai') { chess.undo(); chess.undo(); } else chess.undo();
    setHistory(chess.history({ verbose: true }));
    const h = chess.history({ verbose: true });
    setLastMove(h.length ? { from: h[h.length - 1].from, to: h[h.length - 1].to } : null);
    setGameEnded(null);
    setHint(null);
    refresh();
  };

  const resign = () => {
    const winner = mode === '2p' ? (chess.turn() === 'w' ? 'Black' : 'White') : (playerColor === 'w' ? 'Black' : 'White');
    setGameEnded({ type: 'checkmate', winner, reason: 'resign' });
    if (soundOn) sounds.end();
  };

  const showHint = () => {
    if (gameEnded || thinking) return;
    if (mode === 'ai' && chess.turn() !== playerColor) return;
    const move = pickAIMove(chess.fen(), 'expert');
    if (move) setHint({ from: move.from, to: move.to });
  };

  const exportPgn = async () => {
    const pgn = chess.pgn();
    try { await navigator.clipboard.writeText(pgn); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const importPgn = () => {
    try {
      const c = new Chess();
      c.loadPgn(pgnText);
      chess.load(c.fen());
      // Replay moves so history is intact
      chess.reset();
      const moves = c.history();
      for (const san of moves) chess.move(san);
      setHistory(chess.history({ verbose: true }));
      const h = chess.history({ verbose: true });
      setLastMove(h.length ? { from: h[h.length - 1].from, to: h[h.length - 1].to } : null);
      setGameEnded(null);
      setPgnDialogOpen(false);
      setPgnText('');
      refresh();
      checkEnd();
    } catch (e) {
      setLoadError('Invalid PGN');
      setTimeout(() => setLoadError(''), 2000);
    }
  };

  const saveGame = async () => {
    try {
      const r = await fetch('/api/games', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pgn: chess.pgn(), fen: chess.fen(), mode, difficulty }),
      });
      const d = await r.json();
      if (d.ok) setSavedCode(d.code);
    } catch {}
  };

  const loadGame = async () => {
    setLoadError('');
    try {
      const r = await fetch(`/api/games/${loadCode.trim().toUpperCase()}`);
      const d = await r.json();
      if (!d.ok) { setLoadError('Game not found'); return; }
      chess.reset();
      if (d.game.pgn) {
        const c = new Chess();
        c.loadPgn(d.game.pgn);
        for (const san of c.history()) chess.move(san);
      }
      setHistory(chess.history({ verbose: true }));
      const h = chess.history({ verbose: true });
      setLastMove(h.length ? { from: h[h.length - 1].from, to: h[h.length - 1].to } : null);
      setGameEnded(null);
      setLoadCode('');
      refresh();
      checkEnd();
    } catch (e) { setLoadError('Load failed'); }
  };

  const { white: capW, black: capB } = useMemo(() => capturedFromHistory(history), [history]);
  const advantage = useMemo(() => materialAdvantage(history), [history]);
  const opening = useMemo(() => detectOpening(history), [history]);
  const turnLabel = chess.turn() === 'w' ? 'White' : 'Black';
  const inCheck = chess.inCheck();
  const pairedMoves = useMemo(() => {
    const p = [];
    for (let i = 0; i < history.length; i += 2) p.push({ n: i/2+1, w: history[i]?.san, b: history[i+1]?.san });
    return p;
  }, [history]);
  const stats = useMemo(() => {
    let captures=0, checks=0, castles=0;
    for (const m of history) {
      if (m.captured) captures++;
      if (m.san?.includes('+') || m.san?.includes('#')) checks++;
      if (m.flags?.includes('k') || m.flags?.includes('q')) castles++;
    }
    return { captures, checks, castles, moves: history.length };
  }, [history]);

  const orientation = mode === 'ai' ? (playerColor === 'w' ? 'white' : 'black') : 'white';
  const canHint = !gameEnded && !thinking && (mode === '2p' || chess.turn() === playerColor);

  return (
    <section id="play" className="relative py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <Badge className="mb-4 bg-sky-500/10 text-sky-300 border-sky-500/30 backdrop-blur">
            <Swords className="w-3 h-3 mr-1" /> Play Now
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Step onto the <span className="bg-gradient-to-r from-violet-300 to-purple-400 bg-clip-text text-transparent">Board</span>
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-lg">
            Seven AI levels, clocks, hints, PGN import/export and cloud save.
          </p>
        </motion.div>

        {/* Main layout: LEFT (board & board-context) | RIGHT (all controls) */}
        <div className="grid grid-cols-1 lg:grid-cols-[62%_38%] gap-6 lg:gap-8 items-start">
          {/* ================= LEFT COLUMN ================= */}
          <div className="space-y-5 min-w-0 order-2 lg:order-1">
            {/* Board Themes */}
            <SectionCard icon={Palette} label="Board Theme">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {THEME_LIST.map((t) => {
                  const active = themeId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setThemeId(t.id)}
                      title={t.label}
                      className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${active ? 'border-sky-400 ring-2 ring-sky-400/40 bg-white/10 text-white' : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/30'}`}
                    >
                      <ThemeSwatch dark={t.dark} light={t.light} />
                      <span className="truncate">{t.label}</span>
                      {active && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Board */}
            <div className="relative">
              <Chessboard
                chess={chess}
                onMove={onMove}
                orientation={orientation}
                interactive={!gameEnded && (mode === '2p' || chess.turn() === playerColor) && !thinking}
                lastMove={hint || lastMove}
                themeId={themeId}
              />
              {hint && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-sky-500/95 text-black text-xs font-semibold px-3 py-1.5 shadow-lg flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Try {hint.from} → {hint.to}
                </div>
              )}
              <AnimatePresence>
                {gameEnded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center rounded-2xl backdrop-blur-sm bg-black/50">
                    <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-neutral-900/95 to-neutral-950/95 border border-sky-500/30 p-6 sm:p-8 text-center shadow-2xl max-w-xs">
                      <Crown className="w-10 h-10 text-sky-400 mx-auto mb-2" />
                      <div className="text-white text-xl font-bold">{gameEnded.type === 'checkmate' ? `${gameEnded.winner} wins` : 'Draw'}</div>
                      <div className="text-white/60 text-sm mt-1">{gameEnded.type === 'checkmate' ? (gameEnded.reason === 'timeout' ? 'On time' : gameEnded.reason === 'resign' ? 'By resignation' : 'Checkmate') : gameEnded.type === 'stalemate' ? 'Stalemate' : gameEnded.type === 'repetition' ? 'By repetition' : gameEnded.type === 'insufficient' ? 'Insufficient material' : 'Fifty-move rule'}</div>
                      <Button onClick={() => newGame()} className="mt-4 bg-gradient-to-r from-violet-500 to-purple-600 text-black">Play again <ChevronRight className="w-4 h-4 ml-1" /></Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Captured pieces */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 min-h-[64px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Black captured</span>
                  {advantage < 0 && <span className="text-xs text-emerald-300 font-semibold">+{-advantage}</span>}
                </div>
                <div className="flex flex-wrap gap-1 text-2xl leading-none min-h-[28px]">
                  {capB.length === 0 && <span className="text-white/20 text-xs self-center">—</span>}
                  {capB.map((p, i) => (<span key={i} className="text-white/90" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{PIECE_GLYPH[p]}</span>))}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 min-h-[64px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">White captured</span>
                  {advantage > 0 && <span className="text-xs text-emerald-300 font-semibold">+{advantage}</span>}
                </div>
                <div className="flex flex-wrap gap-1 text-2xl leading-none min-h-[28px]">
                  {capW.length === 0 && <span className="text-white/20 text-xs self-center">—</span>}
                  {capW.map((p, i) => (<span key={i} className="text-neutral-900" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.25)' }}>{PIECE_GLYPH[p]}</span>))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[{ l: 'Moves', v: stats.moves }, { l: 'Captures', v: stats.captures }, { l: 'Checks', v: stats.checks }, { l: 'Castles', v: stats.castles }].map((s) => (
                <div key={s.l} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                  <div className="text-2xl font-bold text-white font-mono">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="space-y-5 min-w-0 order-1 lg:order-2">
            {/* Mode + Difficulty + Color + Time Control */}
            <SectionCard>
              <Tabs value={mode} onValueChange={(v) => { setMode(v); newGame(); }} className="w-full">
                <TabsList className="grid grid-cols-2 w-full bg-black/40 border border-white/10">
                  <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                    <Bot className="w-4 h-4 mr-2" /> Play vs AI
                  </TabsTrigger>
                  <TabsTrigger value="2p" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                    <Users className="w-4 h-4 mr-2" /> Two Player
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="mt-5 space-y-5">
                  {/* Difficulty */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">Difficulty</span>
                    </div>
                    <p className="text-xs text-white/50 mb-2.5">{DIFF_DESCRIPTIONS[difficulty]}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {DIFFICULTIES.map((d) => {
                        const Icon = DIFF_ICONS[d];
                        const active = difficulty === d;
                        return (
                          <button key={d} onClick={() => { setDifficulty(d); newGame(); }}
                            className={`group relative overflow-hidden px-2 py-3 rounded-xl text-[11px] font-semibold transition-all border ${active ? `bg-gradient-to-br ${DIFF_COLORS[d]} text-white border-white/20 shadow-lg` : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                            <div className="flex flex-col items-center gap-1">
                              <Icon className="w-4 h-4" />
                              <span className="leading-tight">{DIFF_META[d].label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Color */}
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">Play as</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => newGame({ color: 'w' })} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition ${playerColor === 'w' ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}>
                        <span className="text-base leading-none">♔</span> White
                      </button>
                      <button onClick={() => newGame({ color: 'b' })} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition ${playerColor === 'b' ? 'bg-neutral-900 text-white border-white/50 shadow-lg' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}>
                        <span className="text-base leading-none">♚</span> Black
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Time control */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                      <Timer className="w-3.5 h-3.5" /> Time Control
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {Object.entries(TIME_CONTROLS).map(([k, v]) => (
                        <button key={k} onClick={() => { setTcKey(k); newGame(); }} title={v.label}
                          className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-[10px] font-medium border transition ${tcKey === k ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}>
                          <span className="font-mono text-xs">{v.short}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="2p" className="mt-5 space-y-5">
                  <p className="text-white/60 text-sm">Pass and play on the same device. White moves first.</p>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                      <Timer className="w-3.5 h-3.5" /> Time Control
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {Object.entries(TIME_CONTROLS).map(([k, v]) => (
                        <button key={k} onClick={() => { setTcKey(k); newGame(); }} title={v.label}
                          className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-[10px] font-medium border transition ${tcKey === k ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}>
                          <span className="font-mono text-xs">{v.short}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </SectionCard>

            {/* Clocks */}
            {tcKey !== 'unlimited' && (
              <div className="grid grid-cols-2 gap-3">
                {['b','w'].map((c) => {
                  const t = c === 'w' ? timeW : timeB;
                  const active = !gameEnded && chess.turn() === c && history.length > 0;
                  const label = c === 'w' ? 'White' : 'Black';
                  return (
                    <div key={c} className={`rounded-xl border p-3 transition ${active ? 'bg-sky-500/10 border-sky-500/40 shadow-lg shadow-sky-500/10' : 'bg-white/5 border-white/10'}`}>
                      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
                      <div className={`text-2xl font-mono font-bold ${t != null && t < 10000 ? 'text-red-400' : 'text-white'}`}>{fmtTime(t)}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Status */}
            <SectionCard label="Status">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <div className={`w-3 h-3 rounded-full ${chess.turn() === 'w' ? 'bg-white' : 'bg-neutral-900 border border-white/40'}`} />
                <span className="text-white font-medium">
                  {gameEnded
                    ? gameEnded.type === 'checkmate' ? `${gameEnded.reason === 'timeout' ? 'Time out — ' : gameEnded.reason === 'resign' ? 'Resigned — ' : 'Checkmate — '}${gameEnded.winner} wins`
                    : gameEnded.type === 'stalemate' ? 'Stalemate — Draw'
                    : gameEnded.type === 'repetition' ? 'Draw by repetition'
                    : gameEnded.type === 'insufficient' ? 'Draw — insufficient material'
                    : 'Draw'
                    : `${turnLabel} to move`}
                </span>
              </div>
              {(inCheck || thinking || opening) && !gameEnded && (
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {inCheck && <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">Check!</Badge>}
                  {thinking && <Badge className="bg-sky-500/10 text-sky-300 border border-sky-500/30 animate-pulse"><Sparkles className="w-3 h-3 mr-1" /> AI thinking…</Badge>}
                  {opening && <Badge className="bg-violet-500/10 text-violet-300 border border-violet-500/30"><BookOpen className="w-3 h-3 mr-1" /> {opening.name}</Badge>}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setSoundOn((s) => !s)} className="border-white/15 bg-white/5 text-white hover:bg-white/10 px-3 w-full">
                {soundOn ? <><Volume2 className="w-4 h-4 mr-1" /> Sound on</> : <><VolumeX className="w-4 h-4 mr-1" /> Sound off</>}
              </Button>
            </SectionCard>

            {/* Hint / Undo / Resign / New Game */}
            <SectionCard label="Game Actions">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <Button variant="outline" size="sm" onClick={showHint} disabled={!canHint} className="flex-col h-16 gap-1 border-sky-500/30 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20">
                  <Lightbulb className="w-4 h-4" /> <span className="text-[11px]">Hint</span>
                </Button>
                <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0 || !!gameEnded} className="flex-col h-16 gap-1 border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <Undo2 className="w-4 h-4" /> <span className="text-[11px]">Undo</span>
                </Button>
                <Button variant="outline" size="sm" onClick={resign} disabled={history.length === 0 || !!gameEnded} className="flex-col h-16 gap-1 border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20">
                  <Flag className="w-4 h-4" /> <span className="text-[11px]">Resign</span>
                </Button>
              </div>
              <Button size="sm" onClick={() => newGame()} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-400 hover:to-purple-500">
                <RotateCcw className="w-4 h-4 mr-1" /> New Game
              </Button>
            </SectionCard>
          </div>
        </div>

        {/* ================= MOVE HISTORY (full width, centered) ================= */}
        <SectionCard className="mt-6 lg:mt-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h3 className="text-white font-semibold">Move History</h3>
            <Badge variant="secondary" className="bg-white/10 text-white/70 border-0">{history.length} plies</Badge>
          </div>
          {opening && (
            <div className="mb-3 rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-2 max-w-md mx-auto text-center">
              <div className="text-[10px] uppercase tracking-wider text-violet-300/70 font-semibold">Opening detected</div>
              <div className="text-white text-sm font-medium">{opening.name} <span className="text-white/40 text-xs">({opening.eco})</span></div>
            </div>
          )}
          <div className="max-h-[420px] overflow-y-auto pr-2 custom-scroll max-w-xl mx-auto">
            {pairedMoves.length === 0 ? (
              <p className="text-white/40 text-sm py-8 text-center">No moves yet — make your first move!</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {pairedMoves.map((p) => (
                    <tr key={p.n} className={`border-b border-white/5 last:border-0 ${p.n % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="py-1.5 text-white/40 w-8 text-center">{p.n}.</td>
                      <td className="py-1.5 text-white font-medium font-mono text-center">{p.w}</td>
                      <td className="py-1.5 text-white/80 font-mono text-center">{p.b || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
