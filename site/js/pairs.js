// The hour pairs board, laid out like the hand-made page: the pairs table in
// the middle (00 = 12 … 11 = 23), brackets grouping the rows, and a sky scene
// for each part of the day — 00–11 on the left, 12–23 on the right.
// The current row is highlighted, the current hour is circled, its pair gets a
// dashed circle, and the scene for the current hour lights up.
import { getTime, setTime, subscribe } from './state.js';
import { PHASES } from './phases.js';
import { pad, pair, partOfDay } from './time.js';
import { createScene } from './scene.js';

const HEADER_ROWS = 1;

export function initPairs(board, strings) {
  const place = (node, col, rowFrom, rowSpan = 1) => {
    node.style.gridColumn = col;
    node.style.gridRow = `${rowFrom + HEADER_ROWS + 1} / span ${rowSpan}`;
    board.append(node);
    return node;
  };

  // Column headers
  [['hl', strings.pairsLeft], ['hr', strings.pairsRight]].forEach(([col, text]) => {
    const th = document.createElement('div');
    th.className = 'pairs-head';
    th.textContent = text;
    th.style.gridColumn = col;
    th.style.gridRow = '1';
    board.append(th);
  });

  // Sliding highlight behind the current row
  const rowHighlight = document.createElement('div');
  rowHighlight.className = 'pairs-row-hl';
  rowHighlight.setAttribute('aria-hidden', 'true');
  place(rowHighlight, 'hl / hr-end', 0);

  // Scenes and brackets, one per part of the day and side
  const groups = PHASES.map((phase) => {
    const side = phase.from < 12 ? 'left' : 'right';
    const row = phase.from % 12;
    const span = phase.to - phase.from + 1;

    const bracket = document.createElement('div');
    bracket.className = `pairs-bracket pairs-bracket-${side}`;
    bracket.setAttribute('aria-hidden', 'true');
    place(bracket, side === 'left' ? 'bl' : 'br', row, span);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pairs-scene pairs-scene-${side}`;
    btn.dataset.phase = phase.id;
    const range = phase.from === phase.to ? pad(phase.from) : `${pad(phase.from)}–${pad(phase.to)}`;
    btn.setAttribute('aria-label', `${strings.phases[phase.id]}, ${range}`);
    btn.append(createScene(phase.id));
    const label = document.createElement('span');
    label.className = 'pairs-scene-label';
    label.textContent = strings.phases[phase.id];
    btn.append(label);
    btn.addEventListener('click', () => setTime(phase.from, 0, 'pairs'));
    place(btn, side === 'left' ? 'sl' : 'sr', row, span);

    return { phase, bracket, btn };
  });

  // Hour buttons and "=" signs
  const hourButton = (hour) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hour-btn';
    btn.dataset.hour = String(hour);
    btn.dataset.phase = partOfDay(hour);
    btn.textContent = pad(hour);
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', `${pad(hour)}, ${strings.phases[partOfDay(hour)]}`);
    btn.addEventListener('click', () => setTime(hour, getTime().m, 'pairs'));
    return btn;
  };
  const buttons = [];
  for (let k = 0; k < 12; k++) {
    buttons.push(place(hourButton(k), 'hl', k));
    const eq = document.createElement('span');
    eq.className = 'pairs-eq';
    eq.setAttribute('aria-hidden', 'true');
    eq.textContent = '=';
    place(eq, 'eq', k);
    buttons.push(place(hourButton(k + 12), 'hr', k));
  }

  // Slide the highlighter to the current row (rows can differ in height).
  let currentRow = 0;
  const moveHighlight = () => {
    const first = buttons[0];
    const target = buttons[currentRow * 2];
    const offset = target.offsetTop + target.offsetHeight / 2 - (first.offsetTop + first.offsetHeight / 2);
    board.style.setProperty('--row-y', `${offset}px`);
  };
  new ResizeObserver(moveHighlight).observe(board);

  subscribe(({ h }) => {
    currentRow = h % 12;
    moveHighlight();
    const partner = pair(h);
    buttons.forEach((btn) => {
      const hour = Number(btn.dataset.hour);
      btn.classList.toggle('is-active', hour === h);
      btn.classList.toggle('is-pair', hour === partner);
      btn.setAttribute('aria-pressed', String(hour === h));
    });
    groups.forEach(({ phase, bracket, btn }) => {
      const active = h >= phase.from && h <= phase.to;
      bracket.classList.toggle('is-active', active);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  });
}
