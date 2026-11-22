// Animated sky scenes. createScene() builds one scene element; its look is
// driven entirely by its data-phase attribute and css/scene.css, so changing
// the phase cross-fades the colors and the sun/moon/clouds/stars.
import { subscribe } from './state.js';
import { partOfDay } from './time.js';

// Small seeded random generator so every scene's stars and clouds are stable
// between page loads but differ from scene to scene.
function random(seed) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const SUN = `
<svg class="sun" viewBox="-50 -50 100 100" aria-hidden="true">
  <circle class="sun-halo" r="40"/>
  <g class="sun-rays">${Array.from({ length: 12 }, (_, i) =>
    `<line x1="0" y1="-31" x2="0" y2="${i % 2 ? -40 : -45}" transform="rotate(${i * 30})"/>`).join('')}
  </g>
  <circle class="sun-core" r="24"/>
  <circle class="sun-shine" cx="-8" cy="-8" r="6"/>
</svg>`;

const MOON = `
<svg class="moon" viewBox="-50 -50 100 100" aria-hidden="true">
  <path class="moon-body" d="M 4 -30 A 30 30 0 1 0 4 30 A 36 36 0 0 1 4 -30 Z"/>
  <circle class="moon-crater" cx="-14" cy="-6" r="3.5"/>
  <circle class="moon-crater" cx="-9" cy="12" r="2.5"/>
</svg>`;

const CLOUD = '<path d="M14 38 a12 12 0 0 1 1-24 a17 17 0 0 1 32-7 a14 14 0 0 1 26 7 a12 12 0 0 1 13 24 z"/>';
const BIRD = '<path d="M1 5 Q5.5 0 10 5 Q14.5 0 19 5"/>';

const HILLS = `
<svg class="scene-hills" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
  <path class="hill-3" d="M0 48 C50 18 110 22 170 44 S300 10 400 38 V100 H0 Z"/>
  <path class="hill-2" d="M0 66 C70 40 150 50 220 64 S340 42 400 58 V100 H0 Z"/>
  <path class="hill-1" d="M0 84 C90 66 170 76 250 82 S350 70 400 78 V100 H0 Z"/>
</svg>`;

let sceneCount = 0;

/** Build a scene element for a part of the day. */
export function createScene(phase, { className = '' } = {}) {
  const rand = random(++sceneCount * 7919);
  const root = document.createElement('div');
  root.className = `scene ${className}`.trim();
  root.dataset.phase = phase;
  root.setAttribute('aria-hidden', 'true');

  const stars = Array.from({ length: 26 }, () => {
    const s = (1 + rand() * 2).toFixed(1);
    const big = rand() > 0.88 ? ' big' : '';
    return `<span class="star${big}" style="left:${(rand() * 100).toFixed(1)}%;top:${(rand() * 100).toFixed(1)}%;--s:${s}px;--d:${(1.5 + rand() * 2.5).toFixed(1)}s;--delay:-${(rand() * 4).toFixed(1)}s"></span>`;
  }).join('');

  const clouds = Array.from({ length: 3 }, (_, i) => {
    const d = 45 + rand() * 35;
    return `<svg class="cloud" viewBox="0 0 100 42" style="--y:${(8 + i * 18 + rand() * 8).toFixed(0)}%;--w:${(28 + rand() * 18).toFixed(0)}cqmin;--d:${d.toFixed(0)}s;--delay:-${(rand() * d).toFixed(0)}s">${CLOUD}</svg>`;
  }).join('');

  const birds = Array.from({ length: 3 }, (_, i) => {
    const d = 22 + rand() * 10;
    return `<svg class="bird" viewBox="0 0 20 8" style="--y:${(18 + i * 9 + rand() * 6).toFixed(0)}%;--d:${d.toFixed(0)}s;--delay:-${(rand() * d).toFixed(0)}s">${BIRD}</svg>`;
  }).join('');

  const flies = Array.from({ length: 7 }, () =>
    `<span class="fly" style="--x:${(rand() * 95).toFixed(0)}%;--y:${(rand() * 80).toFixed(0)}%;--dx:${(rand() * 30 - 15).toFixed(0)}px;--dy:${(rand() * 20 - 10).toFixed(0)}px;--d:${(3 + rand() * 4).toFixed(1)}s;--delay:-${(rand() * 5).toFixed(1)}s"></span>`).join('');

  root.innerHTML = `
    <div class="scene-sky"></div>
    <div class="scene-glow"></div>
    <div class="scene-stars">${stars}</div>
    <div class="scene-shoot" style="--shoot-delay:${(rand() * 6).toFixed(1)}s"></div>
    <div class="scene-orb">${SUN}${MOON}</div>
    <div class="scene-clouds">${clouds}</div>
    <div class="scene-birds">${birds}</div>
    ${HILLS}
    <div class="scene-flies">${flies}</div>`;
  return root;
}

/** The big scene behind the digital clock, following the current time. */
export function initStageScene(stage, label, strings) {
  const scene = createScene('morning', { className: 'stage-scene' });
  stage.prepend(scene);
  subscribe(({ h }) => {
    const part = partOfDay(h);
    scene.dataset.phase = part;
    stage.dataset.phase = part;
    label.textContent = strings.phases[part];
  });
}
