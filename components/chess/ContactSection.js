'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, AlertCircle, Bug, Lightbulb, Heart, Handshake, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const TOPICS = [
  { icon: Bug,       label: 'Report a bug',    template: 'I found a bug: ' },
  { icon: Lightbulb, label: 'Feature idea',    template: 'I’d love to see: ' },
  { icon: Handshake, label: 'Partnership',     template: 'I’m reaching out about a partnership — ' },
  { icon: Heart,     label: 'Just say hi',     template: 'Hey team, ' },
];

const MAX_MSG = 500;

export default function ContactSection() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');       // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const [touched, setTouched] = useState({ email: false, message: false });
  const [activeTopic, setActiveTopic] = useState(null);
  const cardRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const messageValid = message.trim().length >= 4;
  const overLimit = message.length > MAX_MSG;
  const canSubmit = emailValid && messageValid && !overLimit && status !== 'sending';

  // Cursor-tracked highlight inside the card
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMouse({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  const applyTopic = (t) => {
    setActiveTopic(t.label);
    setMessage((cur) => {
      // Replace previously injected template if any, else prepend
      const cleaned = cur.replace(/^(I found a bug: |I’d love to see: |I’m reaching out about a partnership — |Hey team, )/, '');
      return t.template + cleaned;
    });
    setTouched((t) => ({ ...t, message: true }));
  };

  const clearTopic = () => {
    setActiveTopic(null);
    setMessage((cur) => cur.replace(/^(I found a bug: |I’d love to see: |I’m reaching out about a partnership — |Hey team, )/, ''));
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, message: true });
    if (!emailValid) { setStatus('error'); setErrorMsg('That doesn\’t look like a valid email.'); return; }
    if (!messageValid) { setStatus('error'); setErrorMsg('Please write at least a few words.'); return; }
    if (overLimit) { setStatus('error'); setErrorMsg(`Message must be under ${MAX_MSG} characters.`); return; }
    setStatus('sending'); setErrorMsg('');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });
      const d = await r.json();
      if (d.ok) {
        setStatus('sent');
        setTimeout(() => {
          setEmail(''); setMessage(''); setActiveTopic(null);
          setTouched({ email: false, message: false });
          setStatus('idle');
        }, 3200);
      } else {
        setStatus('error'); setErrorMsg(d.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error'); setErrorMsg('Network error — please try again.');
    }
  };

  const remaining = MAX_MSG - message.length;
  const showEmailFeedback = touched.email && email.length > 0;

  return (
    <section id="contact" className="relative py-16 sm:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.form
          ref={cardRef}
          onSubmit={submit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[28px] p-6 sm:p-10 lg:p-12 border border-white/10 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.7)]"
          style={{
            background:
              'radial-gradient(1200px 400px at 15% 0%, rgba(139,92,246,0.15), transparent 60%), linear-gradient(135deg, #131a3d 0%, #0e1330 40%, #0a0f28 100%)',
          }}
        >
          {/* Cursor-follow spotlight */}
          <div
            className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, rgba(139,92,246,0.15), transparent 45%)`,
            }}
          />

          {/* Parallax knight watermark */}
          <motion.div
            className="pointer-events-none absolute top-1/2 leading-none select-none font-serif text-white/[0.055]"
            aria-hidden="true"
            style={{
              right: `${8 - (mouse.x - 50) * 0.04}%`,
              y: '-50%',
              fontSize: 'clamp(200px, 30vw, 360px)',
            }}
            animate={{
              rotate: (mouse.x - 50) * 0.03,
            }}
            transition={{ type: 'spring', stiffness: 30 }}
          >
            ♞
          </motion.div>

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-grotesk text-center text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight"
            >
              Contact Us
            </motion.h2>
            <p className="text-center text-white/50 text-sm mb-8 sm:mb-10">
              We usually reply within 48 hours. Pick a topic to get started —
            </p>

            {/* Quick topic chips */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {TOPICS.map((t) => {
                const active = activeTopic === t.label;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => (active ? clearTopic() : applyTopic(t))}
                    className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-400 shadow-lg shadow-violet-500/40'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5'}`}
                  >
                    <t.icon className="w-3.5 h-3.5" /> {t.label}
                    {active && <X className="w-3 h-3 ml-0.5 opacity-70" />}
                  </button>
                );
              })}
            </div>

            {/* Email */}
            <div className="mb-5 sm:mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="contact-email" className="block text-white font-bold text-sm">Email</label>
                <AnimatePresence>
                  {showEmailFeedback && (
                    <motion.span
                      key={emailValid ? 'ok' : 'bad'}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-center gap-1 text-[11px] font-semibold ${emailValid ? 'text-emerald-300' : 'text-red-300'}`}
                    >
                      {emailValid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {emailValid ? 'Looks good' : 'Enter a valid email'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative">
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="you@example.com"
                  className={`h-14 rounded-xl bg-slate-950/70 text-white placeholder:text-white/35 text-base px-4 pr-11 focus-visible:ring-2 focus-visible:ring-offset-0 shadow-inner transition-all
                    ${showEmailFeedback && !emailValid ? 'border-red-500/60 focus-visible:ring-red-400' : ''}
                    ${showEmailFeedback && emailValid ? 'border-emerald-500/50 focus-visible:ring-emerald-400' : ''}
                    ${!showEmailFeedback ? 'border-white/5 focus-visible:ring-violet-400' : ''}
                  `}
                />
                {showEmailFeedback && emailValid && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40"
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="contact-message" className="block text-white font-bold text-sm">Message</label>
                <span className={`text-[11px] font-mono font-semibold transition-colors ${
                  overLimit ? 'text-red-300' :
                  remaining < 60 ? 'text-amber-300' :
                  'text-white/40'
                }`}>
                  {message.length} / {MAX_MSG}
                </span>
              </div>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                placeholder="Tell us how we can help you."
                rows={6}
                className={`min-h-[160px] rounded-xl bg-slate-950/70 text-white placeholder:text-white/35 text-base p-4 focus-visible:ring-2 focus-visible:ring-offset-0 shadow-inner resize-y transition-all
                  ${overLimit ? 'border-red-500/60 focus-visible:ring-red-400' : 'border-white/5 focus-visible:ring-violet-400'}
                `}
              />
              {/* Live progress bar */}
              <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className={`h-full ${
                    overLimit ? 'bg-red-500' :
                    remaining < 60 ? 'bg-amber-400' :
                    'bg-gradient-to-r from-violet-400 to-fuchsia-500'
                  }`}
                  animate={{ width: `${Math.min(100, (message.length / MAX_MSG) * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            <AnimatePresence>
              {status === 'error' && errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileTap={{ scale: canSubmit ? 0.98 : 1 }}>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="relative w-full h-14 rounded-xl text-base font-bold overflow-hidden bg-gradient-to-b from-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-slate-900 shadow-xl shadow-black/30 border border-white/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <AnimatePresence mode="wait">
                  {status === 'sending' && (
                    <motion.span
                      key="sending"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
                      />
                      Sending…
                    </motion.span>
                  )}
                  {status === 'sent' && (
                    <motion.span
                      key="sent"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-emerald-700"
                    >
                      <Check className="w-5 h-5" strokeWidth={3} /> Message sent — thanks!
                    </motion.span>
                  )}
                  {(status === 'idle' || status === 'error') && (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-3"
                    >
                      Send Message
                      <motion.span
                        animate={canSubmit ? { x: [0, 4, 0] } : { x: 0 }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                      >
                        <Send className="w-4 h-4 text-sky-500 rotate-12" />
                      </motion.span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Success burst */}
            <AnimatePresence>
              {status === 'sent' && (
                <>
                  {[...Array(14)].map((_, i) => {
                    const angle = (i / 14) * Math.PI * 2;
                    const dist = 90 + Math.random() * 40;
                    return (
                      <motion.span
                        key={i}
                        initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                        animate={{
                          opacity: 0,
                          x: Math.cos(angle) * dist,
                          y: Math.sin(angle) * dist - 20,
                          scale: 1,
                          rotate: (Math.random() - 0.5) * 720,
                        }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="absolute left-1/2 bottom-8 pointer-events-none"
                        style={{ color: ['#a78bfa', '#e879f9', '#38bdf8', '#f59e0b'][i % 4] }}
                      >
                        {['★', '♞', '♛', '◆', '✦'][i % 5]}
                      </motion.span>
                    );
                  })}
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
