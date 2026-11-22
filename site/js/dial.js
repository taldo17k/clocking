// Two-ring analog clock (SVG). Inner ring: 00–11 (left column of the pairs
// table). Outer ring: 12–23 (right column). Both hours of a pair sit at the
// same spot, so the hour hand points at both; the active ring is highlighted
// and the hour hand reaches into it.
import { getTime, setTime, shiftTime, subscribe } from './state.js';
import { format, handAngles, pad, pair, partOfDay, spoken } from './time.js';
import { createScene } from './scene.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const C = 160;            // center
const R_FACE = 154;
const R_OUTER = 125;      // outer ring numbers (12–23)
const R_INNER = 82;       // inner ring numbers (00–11)
const HOUR_LEN = { inner: 54, outer: 98 };
const MINUTE_LEN = 138;

const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};
const fix = (n) => Math.round(n * 100) / 100;

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  if (parent) parent.append(node);
  return node;
}

function build(strings) {
  const svg = el('svg', {
    viewBox: '0 0 320 320', class: 'dial-svg', role: 'slider', tabindex: 0,
    'aria-label': strings.dialLabel, 'aria-valuemin': 0, 'aria-valuemax': 1439,
  });
  el('circle', { class: 'face', cx: C, cy: C, r: R_FACE }, svg);
  el('circle', { class: 'rim', cx: C, cy: C, r: 148.5 }, svg);
  el('circle', { class: 'band band-outer', cx: C, cy: C, r: R_OUTER }, svg);
  el('circle', { class: 'band band-inner', cx: C, cy: C, r: R_INNER }, svg);
  [R_INNER - 21, R_INNER + 21, R_OUTER + 19].forEach((r) => el('circle', { class: 'ring-line', cx: C, cy: C, r }, svg));
  // Golden edges that light up around the ring in use.
  [[R_INNER - 21, 'inner'], [R_INNER + 21, 'inner'], [R_OUTER - 19, 'outer'], [R_OUTER + 19, 'outer']]
    .forEach(([r, ring]) => el('circle', { class: `ring-edge ring-edge-${ring}`, cx: C, cy: C, r }, svg));

  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const [x1, y1] = polar(major ? 143 : 146, i * 6);
    const [x2, y2] = polar(151, i * 6);
    el('line', { class: major ? 'tick major' : 'tick', x1: fix(x1), y1: fix(y1), x2: fix(x2), y2: fix(y2) }, svg);
  }

  const numbers = [];
  for (let k = 0; k < 12; k++) {
    [[k, R_INNER, 'inner', 13], [k + 12, R_OUTER, 'outer', 15]].forEach(([hour, r, ring, size]) => {
      const [x, y] = polar(r, k * 30);
      const g = el('g', { class: `num num-${ring}`, 'data-hour': hour, transform: `translate(${fix(x)} ${fix(y)})` }, svg);
      el('circle', { class: 'num-bg', r: size }, g);
      const text = el('text', {}, g);
      text.textContent = pad(hour);
      numbers.push(g);
    });
  }

  const hand = (name, len) => {
    const g = el('g', { class: `hand hand-${name}`, 'data-hand': name }, svg);
    // A light outline under each hand keeps it visible over dark night skies.
    const outline = el('line', { class: 'hand-outline', x1: C, y1: C + 10, x2: C, y2: C - len }, g);
    const line = el('line', { class: 'hand-line', x1: C, y1: C + 10, x2: C, y2: C - len }, g);
    const hit = el('line', { class: 'hand-hit', x1: C, y1: C, x2: C, y2: C - len }, g);
    return { g, line, outline, hit };
  };
  const minute = hand('minute', MINUTE_LEN);
  const hour = hand('hour', HOUR_LEN.inner);
  el('circle', { class: 'hub', cx: C, cy: C, r: 7 }, svg);

  return { svg, numbers, hour, minute };
}

// Shortest signed difference, so dragging across the top keeps going forward.
const signedDiff = (target, from, period) => {
  const d = (((target - from) % period) + period) % period;
  return d >= period / 2 ? d - period : d;
};

export function initDial(root, strings) {
  const { svg, numbers, hour, minute } = build(strings);
  // The sky of the current part of the day shows through the clock face.
  const scene = createScene('morning', { className: 'dial-scene' });
  const wrap = document.createElement('div');
  wrap.className = 'dial-wrap';
  wrap.append(scene, svg);
  root.prepend(wrap);

  const angleAt = (e) => {
    const r = svg.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    return ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
  };

  const moveHand = (which, angle) => {
    const { h, m } = getTime();
    if (which === 'minute') {
      const target = Math.round(angle / 6) % 60;
      shiftTime(signedDiff(target, m, 60), 'dial');
    } else {
      // Hour hand: position within 12 hours, snapped to 5 minutes. Crossing
      // the top moves to the other ring (11 → 12, 23 → 00).
      const target = (Math.round((angle * 2) / 5) * 5) % 720;
      const now = (h % 12) * 60 + m;
      shiftTime(signedDiff(target, now, 720), 'dial');
    }
  };

  // Whichever hand points closest to where the finger is.
  const closestHand = (angle) => {
    const { h, m } = getTime();
    const angles = handAngles(h, m);
    const dist = (x) => Math.abs(signedDiff(angle, x, 360));
    return dist(angles.hour) <= dist(angles.minute) ? 'hour' : 'minute';
  };

  // A press that moves becomes a drag (of the hand under the finger, or the
  // closest one); a press that stays put is a tap. Tapping a number jumps to
  // that hour, even when a hand lies over it; tapping the face moves the
  // closest hand there.
  const DRAG_PX = 6;
  let press = null;
  svg.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    svg.setPointerCapture(e.pointerId);
    press = {
      x: e.clientX,
      y: e.clientY,
      hand: e.target.closest('[data-hand]')?.dataset.hand ?? null,
      dragging: null,
    };
  });
  svg.addEventListener('pointermove', (e) => {
    if (!press) return;
    if (!press.dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) > DRAG_PX) {
      press.dragging = press.hand ?? closestHand(angleAt(e));
      root.classList.add('is-dragging');
    }
    if (press.dragging) moveHand(press.dragging, angleAt(e));
  });
  svg.addEventListener('pointerup', (e) => {
    if (press && !press.dragging) {
      const num = document.elementsFromPoint(e.clientX, e.clientY)
        .map((node) => node.closest?.('.num'))
        .find(Boolean);
      if (num) setTime(Number(num.dataset.hour), getTime().m, 'dial');
      else {
        const a = angleAt(e);
        moveHand(closestHand(a), a);
      }
    }
    press = null;
    root.classList.remove('is-dragging');
  });
  svg.addEventListener('pointercancel', () => {
    press = null;
    root.classList.remove('is-dragging');
  });

  svg.addEventListener('keydown', (e) => {
    const keys = { ArrowUp: 60, ArrowDown: -60, ArrowRight: 5, ArrowLeft: -5, PageUp: 60, PageDown: -60 };
    if (e.key in keys) { e.preventDefault(); shiftTime(keys[e.key], 'dial'); }
  });

  // Keep rotation continuous (e.g. 354° → 366°, not back to 6°) so the
  // animation never spins the long way round.
  const shown = { hour: null, minute: null };
  const unwrap = (prev, next) => (prev === null ? next : prev + signedDiff(next, prev, 360));

  subscribe(({ h, m }) => {
    const a = handAngles(h, m);
    shown.hour = unwrap(shown.hour, a.hour);
    shown.minute = unwrap(shown.minute, a.minute);
    hour.g.style.transform = `rotate(${shown.hour}deg)`;
    minute.g.style.transform = `rotate(${shown.minute}deg)`;
    const tip = C - HOUR_LEN[a.ring];
    hour.line.setAttribute('y2', tip);
    hour.outline.setAttribute('y2', tip);
    hour.hit.setAttribute('y2', tip);

    root.dataset.ring = a.ring;
    root.dataset.phase = partOfDay(h);
    scene.dataset.phase = partOfDay(h);
    const partner = pair(h);
    numbers.forEach((g) => {
      const n = Number(g.dataset.hour);
      g.classList.toggle('is-active', n === h);
      g.classList.toggle('is-pair', n === partner);
    });
    svg.setAttribute('aria-valuenow', String(h * 60 + m));
    svg.setAttribute('aria-valuetext', `${format(h, m)}, ${spoken(h, m)}`);
  });
}
