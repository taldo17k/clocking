// Digital HH:MM clock. Each half (hours, minutes) is a spinbutton that can be
// changed with the ▲▼ buttons (hold to repeat), by swiping up/down on the
// digits, with the arrow keys, or with the mouse wheel while focused.
import { shiftTime, subscribe } from './state.js';
import { pad } from './time.js';

const STEPS = {
  hours: { small: 60, big: 360 },   // in minutes: 1 hour, 6 hours
  minutes: { small: 1, big: 10 },
};
const SWIPE_PX = 22;
const WHEEL_PX = 40;

function setupSpin(spin, strings) {
  const unit = spin.dataset.unit;
  const { small, big } = STEPS[unit];
  const digits = spin.querySelector('.digits');
  const step = (n) => shiftTime(n, 'digital');

  // ▲▼ buttons, with hold-to-repeat
  spin.querySelectorAll('.spin-btn').forEach((btn) => {
    const dir = Number(btn.dataset.dir);
    let delay;
    let repeat;
    const stop = () => { clearTimeout(delay); clearInterval(repeat); };
    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      step(dir * small);
      delay = setTimeout(() => { repeat = setInterval(() => step(dir * small), 80); }, 400);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => btn.addEventListener(t, stop));
  });

  // Keyboard
  digits.addEventListener('keydown', (e) => {
    const keys = {
      ArrowUp: small, ArrowRight: small, ArrowDown: -small, ArrowLeft: -small,
      PageUp: big, PageDown: -big,
    };
    if (e.key in keys) { e.preventDefault(); step(keys[e.key]); }
  });

  // Swipe / drag up and down on the digits
  let startY = null;
  let done = 0;
  digits.addEventListener('pointerdown', (e) => {
    startY = e.clientY;
    done = 0;
    digits.setPointerCapture(e.pointerId);
  });
  digits.addEventListener('pointermove', (e) => {
    if (startY === null) return;
    const steps = Math.trunc((startY - e.clientY) / SWIPE_PX);
    if (steps !== done) { step((steps - done) * small); done = steps; }
  });
  const end = () => { startY = null; };
  digits.addEventListener('pointerup', end);
  digits.addEventListener('pointercancel', end);

  // Mouse wheel, only while focused so it never hijacks page scrolling
  let wheel = 0;
  digits.addEventListener('wheel', (e) => {
    if (document.activeElement !== digits) return;
    e.preventDefault();
    wheel += e.deltaY;
    while (Math.abs(wheel) >= WHEEL_PX) {
      step(wheel > 0 ? -small : small);
      wheel -= Math.sign(wheel) * WHEEL_PX;
    }
  }, { passive: false });

  return (value) => {
    const text = pad(value);
    digits.querySelectorAll('.slot').forEach((slot, i) => { slot.textContent = text[i]; });
    digits.setAttribute('aria-valuenow', String(value));
    digits.setAttribute('aria-valuetext', strings.valueText[unit](text));
  };
}

export function initDigital(root, strings) {
  const renderHours = setupSpin(root.querySelector('.spin[data-unit="hours"]'), strings);
  const renderMinutes = setupSpin(root.querySelector('.spin[data-unit="minutes"]'), strings);
  subscribe(({ h, m }) => { renderHours(h); renderMinutes(m); });
}
