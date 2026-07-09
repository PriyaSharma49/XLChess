'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const WORDS = ['Online Chess', 'Every Match', 'Your Legacy', 'The Endgame'];

export default function AnimatedHeadline() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-flex overflow-hidden align-baseline min-h-[1em]" style={{ minWidth: '9ch' }}>
      <motion.span
        key={idx}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 20 }}
        className="bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
      >
        {WORDS[idx]}
      </motion.span>
    </span>
  );
}
