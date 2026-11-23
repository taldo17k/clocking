// Little quiz sounds, made with the Web Audio API (no audio files to load).
// correct: a bright rising chime · wrong: a soft low "bonk" · streak: a sparkle.
// Muting is remembered per browser; storage failures are ignored.

const STORAGE_KEY = 'clocking.sound';
let ctx = null;
let muted = false;
try { muted = localStorage.getItem(STORAGE_KEY) === 'off'; } catch { /* default: on */ }

function audio() {
  // Browsers only allow sound after the visitor has tapped or clicked the page.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(c, { freq, at, dur, type = 'sine', gain = 0.16, slideTo }) {
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(amp).connect(c.destination);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

const SOUNDS = {
  correct(c, t) {
    // E5 → A5 → E6, with a soft octave shimmer
    [[659.25, 0], [880, 0.09], [1318.5, 0.18]].forEach(([f, d]) => {
      tone(c, { freq: f, at: t + d, dur: 0.38, gain: 0.15 });
      tone(c, { freq: f * 2, at: t + d, dur: 0.18, gain: 0.025 });
    });
  },
  wrong(c, t) {
    tone(c, { freq: 311, at: t, dur: 0.2, type: 'triangle', gain: 0.2, slideTo: 262 });
    tone(c, { freq: 233, at: t + 0.15, dur: 0.38, type: 'triangle', gain: 0.2, slideTo: 175 });
  },
  streak(c, t) {
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(c, { freq: f, at: t + 0.32 + i * 0.06, dur: 0.25, gain: 0.07 }));
  },
};

/** Play 'correct' | 'wrong' | 'streak' (does nothing when muted). */
export function play(name) {
  document.dispatchEvent(new CustomEvent('sound:play', { detail: { name, muted } }));
  if (muted) return;
  const c = audio();
  if (c) SOUNDS[name](c, c.currentTime + 0.01);
}

export const isMuted = () => muted;

export function setMuted(value) {
  muted = value;
  try { localStorage.setItem(STORAGE_KEY, value ? 'off' : 'on'); } catch { /* not kept */ }
}
