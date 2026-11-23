// The learner's first name, used only to make the page friendlier
// ("Great job, Dana!"). It stays in this browser and is never sent anywhere,
// including the visitor counter.
//
// The name is remembered on the device. On each new visit (browser session),
// the first lesson or quiz checks who is learning: "Welcome back! Are you Dana?"
// If nobody gave a name last time, it simply asks again.
const STORAGE_KEY = 'clocking.name';
const SESSION_KEY = 'clocking.nameChecked';
const MAX_LENGTH = 20;

const storage = {
  read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  },
  write(value) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* kept for this visit only */ }
  },
};

// Whether this visit already checked the name (sessionStorage ends with the session).
let checkedThisVisit = false;
const session = {
  checked() {
    try { return checkedThisVisit || sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return checkedThisVisit; }
  },
  markChecked() {
    checkedThisVisit = true;
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* remembered in memory */ }
  },
};

let state = storage.read(); // { name }
const clean = (text) => text.replace(/\s+/g, ' ').trim().slice(0, MAX_LENGTH);

export const getName = () => (typeof state.name === 'string' ? clean(state.name) : '');

function save(name) {
  state = { name: clean(name) };
  storage.write(state);
  document.dispatchEvent(new CustomEvent('name:change', { detail: getName() }));
}

let strings;
let card;
let title;
let body;
let form;
let input;
let confirmBox;
let itsMeLabel;
let pending = null;

function close(name) {
  if (!pending) return;
  save(name ?? getName());
  session.markChecked();
  card.hidden = true;
  document.body.classList.remove('lesson-open');
  const resolve = pending;
  pending = null;
  resolve(getName());
}

/** 'confirm': "Are you Dana?" · 'ask': the name box (prefilled with `value`). */
function showMode(mode, value = getName()) {
  const asking = mode === 'ask';
  title.textContent = asking ? strings.nameTitle : strings.name.welcomeBack(getName());
  body.textContent = asking ? strings.nameBody : strings.name.welcomeBody;
  form.hidden = !asking;
  confirmBox.hidden = asking;
  if (asking) {
    input.value = value;
    input.focus({ preventScroll: true });
  } else {
    itsMeLabel.textContent = strings.name.itsMe(getName());
    confirmBox.querySelector('[data-action="its-me"]').focus({ preventScroll: true });
  }
}

function open(mode) {
  // If the card is already open, the newest request takes over.
  if (pending) return new Promise((resolve) => { pending = resolve; });
  document.dispatchEvent(new CustomEvent('sheet:open', { detail: 'name' }));
  card.hidden = false;
  document.body.classList.add('lesson-open');
  showMode(mode);
  return new Promise((resolve) => { pending = resolve; });
}

/** Show the name box. Resolves with the name ('' when skipped). */
export const askName = () => open('ask');

/**
 * Before a lesson or quiz: once per visit, check who is learning.
 * Known name → "Are you Dana?"; no name → ask for one.
 */
export function ensureName() {
  if (session.checked()) return Promise.resolve(getName());
  return open(getName() ? 'confirm' : 'ask');
}

export function initName(allStrings) {
  strings = allStrings;
  card = document.getElementById('name-card');
  title = card.querySelector('#name-title span');
  body = card.querySelector('.name-body');
  form = card.querySelector('form');
  input = card.querySelector('#name-input');
  confirmBox = card.querySelector('.name-confirm');
  itsMeLabel = confirmBox.querySelector('[data-action="its-me"] span');
  input.maxLength = MAX_LENGTH;

  form.addEventListener('submit', (e) => { e.preventDefault(); close(input.value); });
  card.querySelector('[data-action="skip"]').addEventListener('click', () => close(''));
  confirmBox.querySelector('[data-action="its-me"]').addEventListener('click', () => close(getName()));
  confirmBox.querySelector('[data-action="someone-else"]').addEventListener('click', () => showMode('ask', ''));
  // Escape keeps things as they are: the same name, or the name typed so far.
  card.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(form.hidden ? getName() : input.value); });
  document.addEventListener('sheet:open', (e) => { if (e.detail !== 'name') close(); });

  // "Hi, Dana!" under the intro, with a way to change the name.
  const hello = document.getElementById('hero-hello');
  const helloText = hello.querySelector('span');
  const render = (finished) => {
    const name = getName();
    hello.hidden = !name;
    if (name) helloText.textContent = finished ? strings.name.wellDone(name) : strings.name.hello(name);
  };
  hello.querySelector('button').addEventListener('click', () => askName());
  document.addEventListener('name:change', () => render(false));
  document.addEventListener('lesson:finished', () => render(true));
  render(false);
}
