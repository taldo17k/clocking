// The dial clock (SVG): a regular clock face, 1–12 with 12 at the top. Every
// number stands for two hours (8 is 8 in the morning and 20 in the evening),
// so a switch under the clock picks which one: sun, moon, sunrise or sunset,
// depending on the part of the day.
//
// Moving the hands keeps the chosen half of the day (the hour hand on 8 stays
// 8 or 20); only the switch moves between the two hours of a pair.
import { getTime, setTime, shiftTime, subscribe } from './state.js';
import { format, handAngles, partOfDay, spoken } from './time.js';
import { createScene } from './scene.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const C = 160;            // center
const R_FACE = 154;
const R_NUM = 122;        // the numbers 1–12
const BAND = 40;          // width of the frosted band behind the numbers
const HOUR_LEN = 78;
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

// Small icons for the switch. Sunrise and sunset are a half sun on the horizon.
const ICONS = {
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  sunrise: '<path d="M7 17a5 5 0 0 1 10 0"/><path d="M3 20h18M12 4v5M9 6.5l3-2.5 3 2.5M4.2 11.2l1.5 1.5M19.8 11.2l-1.5 1.5"/>',
  sunset: '<path d="M7 17a5 5 0 0 1 10 0"/><path d="M3 20h18M12 4v5M9 6.5l3 2.5 3-2.5M4.2 11.2l1.5 1.5M19.8 11.2l-1.5 1.5"/>',
};
const ICON_FOR = {
  night: 'moon', sunrise: 'sunrise', morning: 'sun', midday: 'sun',
  afternoon: 'sun', sunset: 'sunset', evening: 'moon',
};

function build(strings) {
  const svg = el('svg', {
    viewBox: '0 0 320 320', class: 'dial-svg', role: 'slider', tabindex: 0,
    'aria-label': strings.dialLabel, 'aria-valuemin': 0, 'aria-valuemax': 1439,
  });
  el('circle', { class: 'face', cx: C, cy: C, r: R_FACE }, svg);
  el('circle', { class: 'rim', cx: C, cy: C, r: 148.5 }, svg);
  el('circle', { class: 'band', cx: C, cy: C, r: R_NUM }, svg);
  [R_NUM - BAND / 2, R_NUM + BAND / 2].forEach((r) => el('circle', { class: 'ring-edge', cx: C, cy: C, r }, svg));

  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const [x1, y1] = polar(major ? 143 : 146, i * 6);
    const [x2, y2] = polar(151, i * 6);
    el('line', { class: major ? 'tick major' : 'tick', x1: fix(x1), y1: fix(y1), x2: fix(x2), y2: fix(y2) }, svg);
  }

  const numbers = [];
  for (let n = 1; n <= 12; n++) {
    const [x, y] = polar(R_NUM, n * 30);
    const g = el('g', { class: 'num', 'data-n': n, transform: `translate(${fix(x)} ${fix(y)})` }, svg);
    el('circle', { class: 'num-bg', r: 16 }, g);
    el('text', {}, g).textContent = String(n);
    numbers.push(g);
  }

  const hand = (name, len) => {
    const g = el('g', { class: `hand hand-${name}`, 'data-hand': name }, svg);
    // A light outline under each hand keeps it visible over dark night skies.
    el('line', { class: 'hand-outline', x1: C, y1: C + 10, x2: C, y2: C - len }, g);
    el('line', { class: 'hand-line', x1: C, y1: C + 10, x2: C, y2: C - len }, g);
    el('line', { class: 'hand-hit', x1: C, y1: C, x2: C, y2: C - len }, g);
    return g;
  };
  const minute = hand('minute', MINUTE_LEN);
  const hour = hand('hour', HOUR_LEN);
  el('circle', { class: 'hub', cx: C, cy: C, r: 7 }, svg);

  return { svg, numbers, hour, minute };
}

/** The sun/moon switch: the two hours the hour hand points at (8 and 20). */
function buildSwitch(strings) {
  const group = document.createElement('div');
  group.className = 'dial-switch';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', strings.dialSwitch);
  const buttons = ['first', 'second'].map((half) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dial-half';
    btn.dataset.half = half;
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"></svg><span class="dial-half-name"></span><span class="dial-half-hour"></span>';
    group.append(btn);
    return btn;
  });
  return { group, buttons };
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
  const { group: halfSwitch, buttons } = buildSwitch(strings);
  root.prepend(wrap, halfSwitch);

  buttons.forEach((btn) => btn.addEventListener('click', () => {
    const { h, m } = getTime();
    const want = btn.dataset.half === 'first' ? h % 12 : (h % 12) + 12;
    setTime(want, m, 'dial');
  }));

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
      // Hour hand: where it points within 12 hours, snapped to 5 minutes,
      // staying in the same half of the day (the switch changes the half).
      const target = (Math.round((angle * 2) / 5) * 5) % 720;
      const half = h < 12 ? 0 : 12;
      setTime(half + Math.floor(target / 60), target % 60, 'dial');
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
  // closest one); a press that stays put is a tap. Tapping a number moves the
  // hour hand there (same half of the day); tapping the face moves the
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
      if (num) {
        const { h, m } = getTime();
        setTime((h < 12 ? 0 : 12) + (Number(num.dataset.n) % 12), m, 'dial');
      } else {
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
    hour.style.transform = `rotate(${shown.hour}deg)`;
    minute.style.transform = `rotate(${shown.minute}deg)`;

    const phase = partOfDay(h);
    root.dataset.phase = phase;
    scene.dataset.phase = phase;
    const n = h % 12 || 12;
    numbers.forEach((g) => g.classList.toggle('is-active', Number(g.dataset.n) === n));

    // The switch offers this hour and its partner, e.g. 8 (morning) and 20 (evening).
    const hours = [h % 12, (h % 12) + 12];
    buttons.forEach((btn, i) => {
      const hh = hours[i];
      const part = partOfDay(hh);
      if (btn.dataset.hour !== String(hh)) {
        btn.dataset.hour = String(hh);
        btn.dataset.icon = ICON_FOR[part];
        btn.querySelector('svg').innerHTML = ICONS[ICON_FOR[part]];
        btn.querySelector('.dial-half-name').textContent = strings.phases[part];
        btn.querySelector('.dial-half-hour').textContent = String(hh);
        btn.setAttribute('aria-label', `${strings.phases[part]}, ${hh}`);
      }
      btn.setAttribute('aria-pressed', String(hh === h));
    });

    svg.setAttribute('aria-valuenow', String(h * 60 + m));
    svg.setAttribute('aria-valuetext', `${format(h, m)}, ${spoken(h, m)}`);
  });
}
