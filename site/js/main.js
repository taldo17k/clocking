import strings from '../strings/en.js';
import { PHASES } from './phases.js';

const pad = (n) => String(n).padStart(2, '0');

function applyStrings() {
  document.documentElement.lang = strings.lang;
  document.documentElement.dir = strings.dir;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const text = strings[el.dataset.i18n];
    if (typeof text === 'string') el.textContent = text;
  });
}

// Temporary preview (Steps 1–2): show a phase's sky and a sample time.
// The real clock logic arrives in Steps 3–4.
function showPhase(phase, button) {
  const stage = document.getElementById('stage');
  stage.dataset.phase = phase.id;
  document.getElementById('phase-name').textContent = strings.phases[phase.id];

  const time = `${pad(phase.from)}:00`;
  const digits = time.replace(':', '');
  const digital = document.getElementById('digital');
  digital.querySelectorAll('.slot').forEach((slot, i) => { slot.textContent = digits[i]; });
  digital.setAttribute('aria-label', time);

  document.querySelectorAll('.phase-chip').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
}

function renderPhaseList() {
  const list = document.getElementById('phase-list');
  PHASES.forEach((phase) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'phase-chip';
    btn.dataset.phase = phase.id;
    btn.setAttribute('aria-pressed', 'false');
    const range = phase.from === phase.to ? pad(phase.from) : `${pad(phase.from)}–${pad(phase.to)}`;
    btn.innerHTML = '<span class="swatch" aria-hidden="true"></span><span class="chip-name"></span><span class="chip-hours"></span>';
    btn.querySelector('.chip-name').textContent = strings.phases[phase.id];
    btn.querySelector('.chip-hours').textContent = range;
    btn.addEventListener('click', () => showPhase(phase, btn));
    li.append(btn);
    list.append(li);
  });
}

applyStrings();
renderPhaseList();
const morning = PHASES.find((p) => p.id === 'morning');
showPhase({ ...morning, from: 8 }, document.querySelector('.phase-chip[data-phase="morning"]'));
