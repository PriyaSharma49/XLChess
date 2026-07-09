'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, Play, GraduationCap, Bot, Users, Sparkles, Shield, Zap,
  Trophy, Brain, Target, ChevronDown, BookOpen, Puzzle,
  MousePointerClick, MonitorSmartphone, ArrowUpRight, Star,
} from 'lucide-react';
import HeroAutoBoard from '@/components/chess/HeroAutoBoard';
import PlaySection from '@/components/chess/PlaySection';
import ContactSection from '@/components/chess/ContactSection';
import KnightLogo from '@/components/chess/KnightLogo';
import AnimatedHeadline from '@/components/chess/AnimatedHeadline';
import {
  GameModesSection, AIPersonalitiesSection, DailyChallengeSection,
  AchievementsSection, YourStatsSection,
} from '@/components/chess/FeatureSections';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
  { icon: Bot, title: 'Smart AI Opponent', desc: 'A minimax engine with piece-square evaluation, quiescence search, transposition tables and 7 real difficulty tiers.' },
  { icon: Users, title: 'Two-Player Mode', desc: 'Pass and play on the same device. Perfect for coffee-shop rivalries.' },
  { icon: Sparkles, title: 'Premium Board', desc: 'Hand-crafted board with legal move dots, last-move glow, and buttery piece animations.' },
  { icon: MousePointerClick, title: 'Drag or Click', desc: 'Move pieces however you like — drag with the mouse or tap to select and move.' },
  { icon: Shield, title: 'Full Chess Rules', desc: 'Check, checkmate, stalemate, castling, en passant, promotion — all handled correctly.' },
  { icon: MonitorSmartphone, title: 'Fully Responsive', desc: 'Looks and feels premium on phones, tablets, laptops, and ultrawide displays.' },
];

const OPENINGS = [
  { name: 'Ruy López', moves: '1.e4 e5 2.Nf3 Nc6 3.Bb5', tag: 'Classical', desc: 'One of the oldest and most respected openings. White pressures the knight defending e5.' },
  { name: 'Italian Game', moves: '1.e4 e5 2.Nf3 Nc6 3.Bc4', tag: 'Beginner-friendly', desc: 'Rapid development and central control. A great first opening to learn.' },
  { name: 'Sicilian Defense', moves: '1.e4 c5', tag: 'Aggressive', desc: 'Black fights for the center asymmetrically. The most popular reply to 1.e4.' },
  { name: "Queen's Gambit", moves: '1.d4 d5 2.c4', tag: 'Strategic', desc: 'White offers a pawn to seize the center. Rich in positional ideas.' },
  { name: 'King’s Indian Defense', moves: '1.d4 Nf6 2.c4 g6', tag: 'Hypermodern', desc: 'Black concedes the center, planning a counter-attack from the flank.' },
  { name: 'Caro-Kann', moves: '1.e4 c6', tag: 'Solid', desc: 'A rock-solid defense that avoids the sharper lines of the Sicilian.' },
];

const TIPS = [
  { icon: Target, title: 'Control the center', text: 'Pieces on d4/e4/d5/e5 attack more squares. Fight for those.' },
  { icon: Brain, title: 'Develop before attacking', text: 'Get every minor piece off the back rank before launching an assault.' },
  { icon: Shield, title: 'Castle early', text: 'A safe king lets you commit to a plan without fear of tactics.' },
  { icon: Zap, title: 'Look for checks & captures', text: 'Before every move, scan forcing moves — yours and your opponent’s.' },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [
    { label: 'Modes', href: '#modes' },
    { label: 'Contact', href: '#contact' },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 md:h-18 flex items-center gap-2 sm:gap-4">
        <a href="#top" className="flex items-center gap-2 group shrink-0">
          <KnightLogo size={36} className="group-hover:scale-110 transition" />
          <div className="leading-tight hidden xs:block sm:block">
            <div className="font-grotesk text-base sm:text-lg font-black text-white tracking-tight">XLCHESS</div>
            <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-violet-300/80">Excel at Chess</div>
          </div>
        </a>
        <nav className="flex items-center gap-3 sm:gap-5 md:gap-7 ml-auto overflow-x-auto no-scrollbar">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[11px] sm:text-sm text-white/70 hover:text-white transition relative group whitespace-nowrap py-1">
              {l.label}
              <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-px bg-violet-400 transition-all" />
            </a>
          ))}
        </nav>
        <a href="#play" className="shrink-0">
          <Button size="sm" className="h-8 sm:h-9 px-2.5 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-400 hover:to-purple-500 shadow-lg shadow-violet-500/40">
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Play Now</span>
          </Button>
        </a>
      </div>
    </header>
  );
}

function FloatingPiece({ glyph, top, left, delay, size = 60, tilt = 0 }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 0.14, y: 0 }}
      transition={{ delay, duration: 1.2 }}
      className="absolute select-none pointer-events-none text-white font-serif"
      style={{
        top, left, fontSize: size, transform: `rotate(${tilt}deg)`,
        textShadow: '0 4px 20px rgba(139,92,246,0.5)',
        animation: `float ${5 + delay}s ease-in-out infinite`,
      }}
    >
      {glyph}
    </motion.span>
  );
}

function Hero() {
  return (
    <section id="top" className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
      </div>
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <FloatingPiece glyph="♞" top="10%" left="5%" delay={0.2} size={80} tilt={-15} />
        <FloatingPiece glyph="♛" top="70%" left="8%" delay={0.6} size={70} tilt={10} />
        <FloatingPiece glyph="♜" top="15%" left="90%" delay={0.4} size={65} tilt={20} />
        <FloatingPiece glyph="♝" top="75%" left="92%" delay={0.8} size={70} tilt={-10} />
        <FloatingPiece glyph="♟" top="45%" left="3%" delay={1.0} size={40} tilt={0} />
        <FloatingPiece glyph="♚" top="40%" left="95%" delay={1.2} size={55} tilt={15} />
      </div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-14 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 text-center lg:text-left">
          <div className="flex flex-col items-center lg:items-start mb-8">
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 15 }} className="relative">
              <div className="absolute inset-0 bg-violet-500/40 blur-3xl rounded-full" />
              <KnightLogo size={96} className="relative shadow-2xl" />
            </motion.div>
            <div className="mt-5 flex flex-col items-center lg:items-start">
              <h2 className="font-grotesk text-3xl sm:text-4xl font-black tracking-tight text-white">XLCHESS</h2>
              <div className="mt-1 flex items-center gap-3">
                <span className="hidden sm:block h-px w-6 bg-white/30" />
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-violet-200/90 font-semibold">Excel at Chess</span>
                <span className="hidden sm:block h-px w-6 bg-white/30" />
              </div>
            </div>
          </div>
          <Badge className="mb-5 bg-violet-500/10 text-violet-200 border border-violet-500/30 backdrop-blur">
            <Sparkles className="w-3 h-3 mr-1 text-violet-300" /> The premium chess platform
          </Badge>
          <h1 className="font-grotesk text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight text-white">
            <span className="block">Build the Future of</span>
            <AnimatedHeadline />
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed italic font-serif">
            &ldquo;Making the Best Move on the Way to the Top.&rdquo;
          </p>
          <p className="mt-3 text-sm sm:text-base text-white/55 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            A complete chess platform to play, learn, compete, and grow — built to become your favorite destination for chess.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
            <a href="#play">
              <Button size="lg" className="group h-13 py-6 px-7 text-base font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-400 hover:to-purple-500 shadow-2xl shadow-violet-500/40 border border-white/10">
                <Trophy className="w-5 h-5 mr-2 text-amber-300" /> Play
                <ArrowUpRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
              </Button>
            </a>
            <a href="#learn">
              <Button size="lg" variant="outline" className="h-13 py-6 px-6 text-base font-semibold bg-white/5 border-white/15 text-white hover:bg-white/10 backdrop-blur">
                <GraduationCap className="w-5 h-5 mr-2" /> Learn Chess
              </Button>
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0">
            {[
              { icon: Bot, label: '7 AI Levels', sub: 'Beginner → GM' },
              { icon: Puzzle, label: 'Tactics', sub: 'Solve puzzles' },
              { icon: Trophy, label: 'Cloud Save', sub: '6-char codes' },
              { icon: Shield, label: 'Full Rules', sub: 'Zero sign-up' },
            ].map((f, i) => (
              <motion.div key={f.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }} className="rounded-xl bg-white/5 border border-white/10 backdrop-blur px-3 py-2.5 text-left">
                <f.icon className="w-4 h-4 text-violet-300 mb-1" />
                <div className="text-white text-xs sm:text-sm font-semibold leading-tight">{f.label}</div>
                <div className="text-white/45 text-[10px] sm:text-xs leading-tight">{f.sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.85, rotateY: 25, rotateX: -8 }} animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }} transition={{ duration: 1.1, delay: 0.15 }} className="relative" style={{ perspective: 1400 }}>
          <div className="absolute -inset-8 bg-gradient-to-br from-violet-500/30 via-transparent to-fuchsia-500/20 blur-3xl rounded-[3rem]" />
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="absolute -top-3 -left-3 z-20">
            <Badge className="bg-black/70 backdrop-blur border border-violet-500/50 text-violet-200 py-1.5 px-3 shadow-xl">
              <span className="relative flex w-2 h-2 mr-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
              </span>
              Live demonstration
            </Badge>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20, rotate: 4 }} animate={{ opacity: 1, y: 0, rotate: 4 }} transition={{ delay: 1.0 }} className="absolute -bottom-6 -right-4 sm:-right-8 z-20 hidden sm:block">
            <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/15 px-4 py-3 shadow-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">Engine</span>
              </div>
              <div className="text-white font-bold text-sm">Grandmaster</div>
              <div className="text-white/50 text-xs">Depth 5 · TT + Quiescence</div>
            </div>
          </motion.div>
          <div className="relative max-w-[520px] mx-auto float-slow">
          <HeroAutoBoard />
          </div>
          <div className="mt-4 text-center text-white/40 text-xs">Auto-play showcase — scroll down to play yourself.</div>
        </motion.div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-2 text-white/40">
        <span className="text-[10px] uppercase tracking-[0.3em]"></span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <Badge className="mb-4 bg-violet-500/10 text-violet-200 border-violet-500/30 backdrop-blur">Why XLCHESS</Badge>
          <h2 className="font-grotesk text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Built for players who <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">care about details.</span>
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.05 }} className="group relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/[0.07] hover:border-violet-500/30 transition-all overflow-hidden">
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-violet-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400/20 to-purple-500/10 border border-violet-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <f.icon className="w-6 h-6 text-violet-300" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-1">{f.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Learn() {
  return (
    <section id="learn" className="relative py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 bg-violet-500/10 text-violet-200 border-violet-500/30 backdrop-blur">
              <BookOpen className="w-3 h-3 mr-1" /> Learn Chess
            </Badge>
            <h2 className="font-grotesk text-4xl sm:text-5xl font-black text-white tracking-tight">
              Four principles that
              <br />
              <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">outlast every opening.</span>
            </h2>
            <p className="mt-5 text-white/60 max-w-lg">Openings change. Trends fade. These fundamentals will still make you a better player a decade from now.</p>
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 p-5">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-violet-300" />
                <p className="text-sm text-white/80"><span className="font-semibold text-white">Pro tip:</span> Play slower games. Speed hides the lessons.</p>
              </div>
            </div>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TIPS.map((t, i) => (
              <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:border-white/20 transition">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <t.icon className="w-5 h-5 text-violet-300" />
                </div>
                <h4 className="text-white font-semibold">{t.title}</h4>
                <p className="text-white/60 text-sm mt-1">{t.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Openings() {
  return (
    <section id="openings" className="relative py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <Badge className="mb-4 bg-violet-500/10 text-violet-200 border-violet-500/30 backdrop-blur">
            <Puzzle className="w-3 h-3 mr-1" /> Popular Openings
          </Badge>
          <h2 className="font-grotesk text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Six openings, <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">endless games.</span>
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {OPENINGS.map((o, i) => (
            <motion.div key={o.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="group relative rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 p-6 hover:border-violet-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif text-2xl text-white font-bold">{o.name}</h3>
                <Badge className="bg-violet-500/10 text-violet-200 border-violet-500/30">{o.tag}</Badge>
              </div>
              <code className="block text-sm text-violet-200/80 font-mono bg-black/40 rounded-lg px-3 py-2 border border-white/5">{o.moves}</code>
              <p className="mt-3 text-white/60 text-sm leading-relaxed">{o.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30 backdrop-blur-md">
      <div className="relative max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-3">
          <KnightLogo size={36} />
          <span className="font-grotesk text-xl font-black text-white">
            XLCHESS
          </span>
        </div>

        {/* Center */}
        <div className="absolute left-1/2 -translate-x-1/2 text-sm text-white/50">
          © 2026 XLChess.
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 text-sm">
          <a
            href="#play"
            className="text-white/70 hover:text-violet-300 transition"
          >
            Play
          </a>

          <span className="text-white/30">|</span>

          <a
            href="#puzzles"
            className="text-white/70 hover:text-violet-300 transition"
          >
            Puzzles
          </a>
        </div>

      </div>
    </footer>
  );
}

function App() {
  return (
    <main className="relative min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <GameModesSection />
      <AIPersonalitiesSection />
      <PlaySection />
      <Learn />
      <Openings />
      <ContactSection />
      <Footer />
    </main>
  );
}

export default App;
