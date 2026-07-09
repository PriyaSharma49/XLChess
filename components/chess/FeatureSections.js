'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import { PUZZLES, stripSan } from '@/lib/chess/puzzles';
import { DIFF_META } from '@/lib/chess/ai';
import { sounds } from '@/lib/chess/sounds';
import { readStats, recordPuzzleSolved } from '@/lib/xlchess/stats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bot, Users, Puzzle, Calendar, ChevronRight, Sparkles, Award,
  Baby, GraduationCap, Star, Flame, Skull, Trophy, Zap, Target,
  Crown, Medal, Rocket, Flag, BookOpen, Swords, TrendingUp, Clock,
  Layers, Lightbulb, CheckCircle2, Lock,
} from 'lucide-react';

/* ============================================================
   Local stats helpers imported from /lib/xlchess/stats
   ============================================================ */


/* ============================================================
   AI PERSONALITIES
   ============================================================ */
const PERSONALITIES = [
  { key: 'beginner',     name: 'Rookie Riley',   icon: Baby,          rating: 400,  quote: 'I just learned how the horsey moves!',          color: 'from-emerald-500 to-teal-500',       traits: ['Random', 'Kind'] },
  { key: 'easy',         name: 'Casual Cara',    icon: GraduationCap, rating: 800,  quote: 'Chess is fun. Let\u2019s see what happens.',   color: 'from-lime-500 to-emerald-500',       traits: ['Playful', 'Forgiving'] },
  { key: 'intermediate', name: 'Steady Sam',     icon: Star,          rating: 1200, quote: 'Every move has a reason. Every plan has hope.', color: 'from-sky-500 to-blue-500',           traits: ['Positional', 'Patient'] },
  { key: 'advanced',     name: 'Tactical Tara',  icon: Award,         rating: 1600, quote: 'Blunder once and I\u2019ll build a palace of it.',color: 'from-violet-500 to-purple-500',      traits: ['Tactical', 'Sharp'] },
  { key: 'expert',       name: 'Cunning Cai',    icon: Flame,         rating: 1900, quote: 'I see three moves you don\u2019t.',              color: 'from-orange-500 to-red-500',         traits: ['Calculating', 'Precise'] },
  { key: 'master',       name: 'Ruthless Rey',   icon: Skull,         rating: 2100, quote: 'Prepare thoroughly. Or don\u2019t.',              color: 'from-rose-600 to-red-700',           traits: ['Aggressive', 'Deep'] },
  { key: 'grandmaster',  name: 'Legend Lex',     icon: Trophy,        rating: 2300, quote: 'The board is a novel. I\u2019ve read it before.',color: 'from-amber-400 via-yellow-500 to-orange-500', traits: ['Iterative', 'Cold'] },
];

export function AIPersonalitiesSection() {
  return (
    <section id="ai-roster" className="relative py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <Badge className="mb-4 bg-violet-500/10 text-violet-200 border-violet-500/30 backdrop-blur">
            <Bot className="w-3 h-3 mr-1" /> AI roster
          </Badge>
          <h2 className="font-grotesk text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Seven <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">personalities.</span> Pick your rival.
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-lg">
            Each level plays with a different style, temperament and search depth.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {PERSONALITIES.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-violet-500/40 transition-all"
            >
              <div className={`absolute -top-24 -right-16 w-56 h-56 rounded-full bg-gradient-to-br ${p.color} opacity-20 group-hover:opacity-40 blur-3xl transition-opacity duration-500`} />
              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg`}>
                    <p.icon className="w-7 h-7 text-white drop-shadow" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-base leading-tight">{p.name}</div>
                    <div className="text-xs text-violet-200 font-semibold uppercase tracking-wider">{DIFF_META[p.key].label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wider text-white/40">ELO</div>
                    <div className="text-white font-mono font-bold text-sm">~{p.rating}</div>
                  </div>
                </div>
                <p className="text-white/70 text-sm italic leading-relaxed min-h-[42px]">&ldquo;{p.quote}&rdquo;</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.traits.map((t) => (
                    <span key={t} className="text-[10px] font-semibold text-white/70 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                <a
                href={`/?difficulty=${p.key}#play`}
                className="mt-4 flex items-center justify-between text-sm font-semibold text-white group-hover:text-violet-200 transition"
                >
                  <span>Challenge {p.name.split(' ')[0]}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   GAME MODES
   ============================================================ */
const MODES = [
  {
    icon: Bot,
    title: 'Play vs AI',
    subtitle: '7 skill levels',
    desc: 'From Beginner to Grandmaster. Adaptive difficulty, real chess personalities, instant games.',
    stats: ['7 Levels', 'Depth 5', 'Adaptive'],
    href: '#play',
    accent: 'from-violet-500 to-purple-600',
    cta: 'Challenge the AI',
  },
  {
    icon: Users,
    title: 'Two Player',
    subtitle: 'Pass & play',
    desc: 'Play a friend on the same device. Full rules, undo, resign, share the PGN when you finish.',
    stats: ['Local', 'Zero Setup', 'Share PGN'],
    href: '#play',
    accent: 'from-blue-500 to-indigo-600',
    cta: 'Start a match',
  },
  /*
  {
    icon: Puzzle,
    title: 'Tactics Trainer',
    subtitle: 'Curated puzzles',
    desc: 'Sharpen mate-in-1, forks, pins and endgames. Get hints, track solved, level up.',
    stats: ['8 Puzzles', 'Hints', '800–1600'],
    href: '#puzzles',
    accent: 'from-fuchsia-500 to-pink-600',
    cta: 'Solve tactics',
  },
  {
    icon: Calendar,
    title: 'Daily Challenge',
    subtitle: 'Fresh every day',
    desc: 'A new tactical puzzle every day. Solve it to earn your daily streak.',
    stats: ['New daily', 'Streak', 'All levels'],
    href: '#daily',
    accent: 'from-amber-500 to-orange-600',
    cta: 'Today\u2019s puzzle',
  },
  */
];

export function GameModesSection() {
  return (
    <section id="modes" className="relative py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <Badge className="mb-4 bg-violet-500/10 text-violet-200 border-violet-500/30 backdrop-blur">
            <Layers className="w-3 h-3 mr-1" /> Game modes
          </Badge>
          <h2 className="font-grotesk text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Choose your <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">battlefield.</span>
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {MODES.map((m, i) => (
            <motion.a
              href={m.href}
              key={m.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 p-6 hover:border-violet-500/40 transition-all overflow-hidden"
            >
              <div className={`absolute -top-20 -right-20 w-52 h-52 rounded-full bg-gradient-to-br ${m.accent} opacity-0 group-hover:opacity-25 blur-3xl transition-opacity duration-500`} />
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.accent} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition`}>
                  <m.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-white text-xl font-bold">{m.title}</div>
                <div className="text-violet-200 text-xs uppercase tracking-wider font-semibold mb-3">{m.subtitle}</div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{m.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {m.stats.map((s) => (
                    <span key={s} className="text-[10px] font-semibold text-white/70 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-white font-semibold text-sm group-hover:text-violet-300 transition">
                  {m.cta} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}



/* ============================================================
   DAILY CHALLENGE (deterministic per-day puzzle)
   ============================================================ */
function todaySeed() {
  const d = new Date();
  return d.getFullYear() * 400 + (d.getMonth() + 1) * 31 + d.getDate();
}

export function DailyChallengeSection() {
  const seed = todaySeed();
  const puzzle = PUZZLES[seed % PUZZLES.length];
  const [chess, setChess] = useState(() => new Chess(puzzle.fen));
  const [, setTick] = useState(0);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | wrong | solved
  const [lastMove, setLastMove] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('xlchess:daily') || '{}');
      if (s.date === seed) { setStreak(s.streak || 0); if (s.solved) setStatus('solved'); }
      else if (s.date && s.date === seed - 1) setStreak(s.streak || 0);
    } catch {}
    // eslint-disable-next-line
  }, [seed]);

  const onMove = (mv) => {
    const expected = puzzle.solution[step];
    if (!expected) return;
    if (stripSan(mv.san) === stripSan(expected)) {
      sounds.move();
      setLastMove({ from: mv.from, to: mv.to });
      const nxt = step + 1;
      if (nxt >= puzzle.solution.length) {
        setStatus('solved');
        sounds.end();
        try { recordPuzzleSolved('daily:' + seed); } catch {}
        const newStreak = streak + 1;
        setStreak(newStreak);
        try { localStorage.setItem('xlchess:daily', JSON.stringify({ date: seed, streak: newStreak, solved: true })); } catch {}
        setStep(nxt); setTick((t) => t + 1);
        return;
      }
      setTimeout(() => {
        const res = chess.move(puzzle.solution[nxt]);
        if (res) { setLastMove({ from: res.from, to: res.to }); sounds.move(); }
        setStep(nxt + 1); setTick((t) => t + 1);
      }, 500);
      setStep(nxt); setTick((t) => t + 1);
    } else {
      chess.undo();
      setStatus('wrong'); sounds.capture();
      setTick((t) => t + 1);
      setTimeout(() => setStatus('idle'), 1000);
    }
  };

  const reset = () => {
    const c = new Chess(puzzle.fen); setChess(c); setStep(0); setStatus('idle'); setLastMove(null);
  };

  return (
    <section id="daily" className="relative py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <Badge className="mb-4 bg-amber-500/10 text-amber-200 border-amber-500/30 backdrop-blur">
            <Calendar className="w-3 h-3 mr-1" /> Daily challenge
          </Badge>
          <h2 className="font-grotesk text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Solve today&rsquo;s <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">puzzle.</span>
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-lg">
            A new position every day. Keep the streak alive.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
          <div className="relative">
            <Chessboard
              chess={chess}
              onMove={onMove}
              orientation={puzzle.turn === 'w' ? 'white' : 'black'}
              interactive={status !== 'solved'}
              lastMove={lastMove}
              themeId="wood"
            />
            {status === 'solved' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500/95 text-white text-xs font-semibold px-3 py-1.5 shadow-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solved! Come back tomorrow.
              </div>
            )}
            {status === 'wrong' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-red-500/95 text-white text-xs font-semibold px-3 py-1.5 shadow-lg">Not quite &mdash; try again</div>
            )}
          </div>
          <aside className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 h-fit space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Theme</div>
              <div className="text-white text-lg font-bold">{puzzle.theme}</div>
              <div className="text-white/60 text-sm mt-1">Rating {puzzle.rating} &middot; {puzzle.turn === 'w' ? 'White' : 'Black'} to move</div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{puzzle.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-3 text-center">
                <div className="text-2xl font-black text-amber-200">{streak}</div>
                <div className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold mt-1">Day streak</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                <div className="text-2xl font-black text-white">{status === 'solved' ? '✓' : '—'}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mt-1">Today</div>
              </div>
            </div>
            <Button onClick={reset} variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
              Reset attempt
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ACHIEVEMENTS
   ============================================================ */
const ACHIEVEMENTS = [
  { id: 'first_win',      title: 'First Blood',       desc: 'Win your first game',              icon: Medal,     req: (s) => s.wins >= 1 },
  { id: 'streak5',        title: 'Winning Streak',    desc: 'Win 5 games in total',             icon: Flame,     req: (s) => s.wins >= 5 },
  { id: 'checkmate10',    title: 'Checkmate Master',  desc: 'Deliver 10 checkmates',            icon: Crown,     req: (s) => s.checkmates >= 10 },
  { id: 'puzzle3',        title: 'Tactician',         desc: 'Solve 3 tactical puzzles',         icon: Puzzle,    req: (s) => s.puzzlesSolved >= 3 },
  { id: 'puzzle_all',     title: 'Puzzle Prodigy',    desc: 'Solve every curated puzzle',       icon: Trophy,    req: (s) => s.puzzlesSolved >= 8 },
  { id: 'blitz',          title: 'Speed Demon',       desc: 'Win a Blitz-time-control game',    icon: Zap,       req: (s) => s.blitzWins >= 1 },
  { id: 'openings5',      title: 'Opening Scholar',   desc: 'Play 5 different named openings',  icon: BookOpen,  req: (s) => (s.openingsPlayed?.length || 0) >= 5 },
  { id: 'fast_win',       title: 'Miniature',         desc: 'Win a game in under 20 moves',     icon: Rocket,    req: (s) => s.fastestWin != null && s.fastestWin < 20 },
  { id: 'beat_expert',    title: 'Slayer of Cai',     desc: 'Defeat the Expert AI',             icon: Skull,     req: (s) => s.bestDifficulty === 'expert' || s.bestDifficulty === 'master' || s.bestDifficulty === 'grandmaster' },
  { id: 'beat_gm',        title: 'Legend Toppled',    desc: 'Defeat the Grandmaster AI',        icon: Award,     req: (s) => s.bestDifficulty === 'grandmaster' },
];

export function AchievementsSection() {
  const [stats, setStats] = useState(null);
  useEffect(() => { setStats(readStats() || { games: 0, wins: 0, losses: 0, draws: 0, puzzlesSolved: 0, checkmates: 0, blitzWins: 0, fastestWin: null, openingsPlayed: [], bestDifficulty: null }); }, []);

  const unlocked = useMemo(() => {
    if (!stats) return new Set();
    return new Set(ACHIEVEMENTS.filter((a) => { try { return a.req(stats); } catch { return false; } }).map((a) => a.id));
  }, [stats]);

  const progress = stats ? Math.round((unlocked.size / ACHIEVEMENTS.length) * 100) : 0;

  return (
    <section id="achievements" className="relative py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <Badge className="mb-4 bg-violet-500/10 text-violet-200 border-violet-500/30 backdrop-blur">
            <Award className="w-3 h-3 mr-1" /> Achievements
          </Badge>
          <h2 className="font-grotesk text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Chase the <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">badges.</span>
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-lg">
            {unlocked.size} of {ACHIEVEMENTS.length} unlocked. Play more to earn more.
          </p>
          <div className="mt-5 max-w-md mx-auto">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1.5 text-xs text-white/50">{progress}% complete</div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ACHIEVEMENTS.map((a, i) => {
            const ok = unlocked.has(a.id);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className={`relative rounded-2xl border p-4 text-center transition-all ${ok
                  ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border-violet-400/40 shadow-lg shadow-violet-500/20'
                  : 'bg-white/[0.03] border-white/10 opacity-60 grayscale'}`}
              >
                <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${ok ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg' : 'bg-white/5 border border-white/10'}`}>
                  {ok ? <a.icon className="w-6 h-6 text-white" /> : <Lock className="w-5 h-5 text-white/50" />}
                </div>
                <div className="mt-3 text-white text-sm font-bold">{a.title}</div>
                <div className="text-white/50 text-xs mt-1 leading-snug">{a.desc}</div>
                {ok && (
                  <div className="absolute top-2 right-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] px-1.5 py-0.5 font-bold">✓</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   YOUR STATS (real, from localStorage)
   ============================================================ */
function AnimatedCounter({ to, duration = 1.2 }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.floor(v));
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(mv, to, { duration, ease: 'easeOut' });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
    // eslint-disable-next-line
  }, [to]);
  return <span>{display}</span>;
}

export function YourStatsSection() {
  const [stats, setStats] = useState(null);
  useEffect(() => { setStats(readStats() || { games: 0, wins: 0, losses: 0, draws: 0, puzzlesSolved: 0 }); }, []);
  if (!stats) return null;
  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
  const items = [
    { label: 'Games played',   value: stats.games,            icon: Swords,       accent: 'from-violet-500 to-purple-600' },
    { label: 'Wins',           value: stats.wins,             icon: Trophy,       accent: 'from-emerald-500 to-teal-500' },
    { label: 'Win rate',       value: winRate,                icon: TrendingUp,   accent: 'from-sky-500 to-blue-500', suffix: '%' },
    { label: 'Puzzles solved', value: stats.puzzlesSolved,    icon: Puzzle,       accent: 'from-fuchsia-500 to-pink-600' },
    { label: 'Checkmates',     value: stats.checkmates,       icon: Crown,        accent: 'from-amber-500 to-orange-500' },
    { label: 'Openings played',value: (stats.openingsPlayed?.length || 0), icon: BookOpen, accent: 'from-rose-500 to-red-600' },
  ];
  return (
    <section id="stats" className="relative py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-violet-500/10 text-violet-200 border-violet-500/30 backdrop-blur">
            <TrendingUp className="w-3 h-3 mr-1" /> Your stats
          </Badge>
          <h2 className="font-grotesk text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            You&rsquo;re <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">levelling up.</span>
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            Stats update automatically as you play &mdash; nothing fake, nothing tracked off-device.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="relative rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-5 overflow-hidden"
            >
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${s.accent} opacity-20 blur-2xl`} />
              <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center shadow-lg mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-black text-white tracking-tight font-mono">
                <AnimatedCounter to={s.value} />{s.suffix || ''}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
