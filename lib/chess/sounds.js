'use client';

let ctx = null;
function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function blip(freq, duration = 0.09, type = 'sine', gain = 0.09) {
  const c = getCtx();
  if (!c) return;
  try {
    if (c.state === 'suspended') c.resume();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, c.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration + 0.02);
  } catch (e) {}
}

export const sounds = {
  move: () => blip(520, 0.07, 'triangle', 0.06),
  capture: () => { blip(260, 0.09, 'square', 0.08); setTimeout(() => blip(180, 0.12, 'sawtooth', 0.06), 40); },
  check: () => { blip(900, 0.08, 'triangle', 0.09); setTimeout(() => blip(1200, 0.10, 'triangle', 0.09), 60); },
  castle: () => { blip(440, 0.06, 'triangle', 0.06); setTimeout(() => blip(660, 0.09, 'triangle', 0.06), 60); },
  end: () => { blip(660, 0.15, 'triangle', 0.09); setTimeout(() => blip(440, 0.2, 'triangle', 0.09), 120); setTimeout(() => blip(880, 0.25, 'triangle', 0.09), 260); },
};
