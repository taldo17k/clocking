// Guided lessons (Step 5). A card floats at the bottom of the screen; each
// step sets the clock, scrolls to the widget it talks about and gives it a
// golden spotlight. The text lives in strings/en.js; the example breakdowns
// are built from time.js so they always match the rest of the page.
import { setTime, subscribe } from './state.js';
import { numberWords, pad, pair, partOfDay, spoken, spokenHour } from './time.js';

const STORAGE_KEY = 'clocking.lesson';
const CYCLE_MS = 1800;

// Each step: which widget to spotlight, and what the clock does meanwhile.
// `times` cycles through [h, m] pairs; `hint` highlights part of the digital clock.
const STEPS = [
  { id: 'day', target: 'pairs', times: [[0, 0], [6, 0], [8, 0], [12, 0], [15, 0], [18, 0], [20, 0], [22, 0]] },
  { id: 'pairs', target: 'pairs', times: [[3, 0], [15, 0], [8, 0], [20, 0], [10, 0], [22, 0]] },
  { id: 'rings', target: 'dial', times: [[3, 0], [15, 0], [9, 0], [21, 0]] },
  { id: 'structure', target: 'digital', times: [[14, 35]], hint: ['hours', 'minutes'] },
  { id: 'example1', target: 'digital', times: [[8, 15]], example: [8, 15] },
  { id: 'example2', target: 'digital', times: [[22, 39]], example: [22, 39] },
];

// What to scroll to, and what gets the golden glow.
const TARGETS = {
  pairs: { scroll: '.board-panel', glow: '.board-panel' },
  dial: { scroll: '.dial-panel', glow: '.dial-panel' },
  digital: { scroll: '.stage-section', glow: '.stage' },
};

// localStorage can be missing or throw (private mode, blocked storage).
const storage = {
  read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  },
  write(value) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* progress just isn't kept */ }
  },
};

/** Text with **bold** parts, built without innerHTML. */
function richText(el, text) {
  el.replaceChildren(...text.split('**').map((part, i) => {
    if (i % 2 === 0) return document.createTextNode(part);
    const b = document.createElement('strong');
    b.textContent = part;
    return b;
  }));
}

/** Rows that take a time apart, e.g. 22 → 22 − 12 = 10 → "ten". */
function breakdown(h, m, strings) {
  const t = strings.lesson.breakdown;
  const hourWord = numberWords(spokenHour(h));
  const rows = [];
  if (h >= 12) rows.push([pad(h), t.pair(pad(h), pad(pair(h))), hourWord]);
  else if (h === 0) rows.push([pad(h), t.midnight, hourWord]);
  else rows.push([pad(h), null, hourWord]);
  rows.push([pad(m), null, m === 0 ? strings.speech.oclock : numberWords(m)]);
  const part = partOfDay(h);
  rows.push([strings.phases[part], null, strings.speech.partPhrase[part]]);
  return { rows, sentence: strings.sentence(spoken(h, m)) };
}

export function initLessons(strings) {
  const L = strings.lesson;
  const card = document.getElementById('lesson');
  const startBtn = document.getElementById('btn-lesson');
  const startLabel = startBtn.querySelector('span');
  const progressText = card.querySelector('.lesson-progress');
  const title = card.querySelector('.lesson-title span');
  const body = card.querySelector('.lesson-body');
  const box = card.querySelector('.lesson-breakdown');
  const dots = card.querySelector('.lesson-dots');
  const backBtn = card.querySelector('[data-action="back"]');
  const nextBtn = card.querySelector('[data-action="next"]');
  const closeBtn = card.querySelector('[data-action="close"]');

  backBtn.querySelector('span').textContent = L.back;
  backBtn.setAttribute('aria-label', L.back);
  closeBtn.setAttribute('aria-label', L.close);

  STEPS.forEach(() => {
    const dot = document.createElement('span');
    dot.className = 'lesson-dot';
    dots.append(dot);
  });

  let progress = storage.read(); // { step, done }
  let step = Number.isInteger(progress.step) && progress.step >= 0 && progress.step < STEPS.length ? progress.step : 0;
  let cycle = null;
  let open = false;

  const updateStartButton = () => {
    if (progress.done) startLabel.textContent = L.replay;
    else if (progress.step > 0) startLabel.textContent = L.continue(step + 1, STEPS.length);
    else startLabel.textContent = L.start;
  };

  const stopCycle = () => { clearInterval(cycle); cycle = null; };
  const clearSpotlight = () => {
    document.querySelectorAll('.is-spotlight').forEach((el) => el.classList.remove('is-spotlight'));
    document.querySelectorAll('.spin.is-hint').forEach((el) => el.classList.remove('is-hint'));
  };

  const show = (index, { scroll = true } = {}) => {
    step = index;
    const s = STEPS[step];
    const text = L.steps[s.id];

    progressText.textContent = L.progress(step + 1, STEPS.length);
    title.textContent = text.title;
    richText(body, text.body);
    [...dots.children].forEach((d, i) => {
      d.classList.toggle('is-done', i < step);
      d.classList.toggle('is-current', i === step);
    });
    backBtn.disabled = step === 0;
    const nextLabel = step === STEPS.length - 1 ? L.finish : L.next;
    nextBtn.querySelector('span').textContent = nextLabel;
    nextBtn.setAttribute('aria-label', nextLabel);

    if (s.example) {
      const { rows, sentence } = breakdown(...s.example, strings);
      const list = document.createElement('ol');
      rows.forEach(([from, via, to]) => {
        const li = document.createElement('li');
        const chip = document.createElement('span');
        chip.className = 'lesson-chip';
        chip.textContent = from;
        li.append(chip);
        if (via) {
          const v = document.createElement('span');
          v.className = 'lesson-via';
          v.textContent = via;
          li.append(' → ', v);
        }
        const word = document.createElement('strong');
        word.textContent = to;
        li.append(' → ', word);
        list.append(li);
      });
      const result = document.createElement('p');
      result.className = 'lesson-result';
      result.textContent = sentence;
      box.replaceChildren(list, result);
      box.hidden = false;
    } else {
      box.replaceChildren();
      box.hidden = true;
    }

    // Clock + spotlight
    stopCycle();
    clearSpotlight();
    const target = TARGETS[s.target];
    document.querySelector(target.glow).classList.add('is-spotlight');
    if (scroll) document.querySelector(target.scroll).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

    let i = 0;
    const tick = () => {
      const [h, m] = s.times[i % s.times.length];
      setTime(h, m, 'lesson');
      if (s.hint) {
        const part = s.hint[i % s.hint.length];
        document.querySelectorAll('.spin').forEach((el) => el.classList.toggle('is-hint', el.dataset.unit === part));
      }
      i++;
    };
    tick();
    if (s.times.length > 1 || s.hint) cycle = setInterval(tick, CYCLE_MS);

    progress = { ...progress, step };
    storage.write(progress);
    updateStartButton();
  };

  const openLesson = () => {
    document.dispatchEvent(new CustomEvent('sheet:open', { detail: 'lesson' }));
    if (progress.done) { progress = { step: 0, done: false }; step = 0; }
    open = true;
    card.hidden = false;
    document.body.classList.add('lesson-open');
    startBtn.setAttribute('aria-expanded', 'true');
    show(step);
    nextBtn.focus({ preventScroll: true });
  };
  const closeLesson = () => {
    if (!open) return;
    open = false;
    stopCycle();
    clearSpotlight();
    card.hidden = true;
    document.body.classList.remove('lesson-open');
    startBtn.setAttribute('aria-expanded', 'false');
    updateStartButton();
  };

  startBtn.addEventListener('click', () => (open ? closeLesson() : openLesson()));
  closeBtn.addEventListener('click', () => { closeLesson(); startBtn.focus(); });
  backBtn.addEventListener('click', () => { if (step > 0) show(step - 1); });
  nextBtn.addEventListener('click', () => {
    if (step < STEPS.length - 1) { show(step + 1); return; }
    progress = { step: 0, done: true };
    storage.write(progress);
    step = 0;
    closeLesson();
    document.dispatchEvent(new CustomEvent('lesson:finished'));
  });
  card.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeLesson(); startBtn.focus(); } });
  document.addEventListener('sheet:open', (e) => { if (e.detail !== 'lesson') closeLesson(); });

  // If the learner changes the time themselves, stop the step's animation
  // (the card stays open so they can keep reading).
  subscribe((_, source) => {
    if (cycle && source !== 'lesson' && source !== 'init') {
      stopCycle();
      document.querySelectorAll('.spin.is-hint').forEach((el) => el.classList.remove('is-hint'));
    }
  });

  updateStartButton();
}
