import strings from '../strings/en.js';
import { amPm, format, pad, partOfDay, spoken } from './time.js';
import { setTime, shiftTime, subscribe } from './state.js';
import { initDigital } from './clock.js';
import { initStageScene } from './scene.js';
import { initPairs } from './pairs.js';
import { initDial } from './dial.js';
import { initLessons } from './lessons.js';
import { initQuiz } from './quiz.js';
import { initAnalytics } from './analytics.js';
import { initName } from './name.js';

const $ = (id) => document.getElementById(id);

function applyStrings() {
  document.documentElement.lang = strings.lang;
  document.documentElement.dir = strings.dir;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const text = strings[el.dataset.i18n];
    if (typeof text === 'string') el.textContent = text;
  });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => {
    const text = strings[el.dataset.i18nLabel];
    if (typeof text === 'string') el.setAttribute('aria-label', text);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const text = strings[el.dataset.i18nPlaceholder];
    if (typeof text === 'string') el.placeholder = text;
  });
}

// --- "How we say it" line + a calm screen-reader announcement -------------
function initSentence() {
  let liveTimer;
  subscribe(({ h, m }, source) => {
    const sentence = strings.sentence(spoken(h, m));
    const { hour, period } = amPm(h);
    $('say-text').textContent = sentence;
    $('ampm').textContent = `${hour}:${pad(m)} ${period}`;
    // Announce once the time stops changing, and not during "Play the day".
    clearTimeout(liveTimer);
    if (source === 'init' || source === 'play') return;
    liveTimer = setTimeout(() => { $('live').textContent = `${format(h, m)}. ${sentence}`; }, 600);
  });
}

// --- Now / Play the day ----------------------------------------------------
const PLAY_STEP_MIN = 5;
const PLAY_TICK_MS = 60;   // 288 ticks ≈ 17 s for a whole day

function initControls() {
  const playBtn = $('btn-play');
  let timer = null;
  let ticks = 0;

  const stop = () => {
    clearInterval(timer);
    timer = null;
    document.body.classList.remove('is-playing');
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.querySelector('span').textContent = strings.playButton;
  };
  const start = () => {
    document.body.classList.add('is-playing');
    playBtn.setAttribute('aria-pressed', 'true');
    playBtn.querySelector('span').textContent = strings.stopButton;
    setTime(0, 0, 'play');
    ticks = (24 * 60) / PLAY_STEP_MIN;
    timer = setInterval(() => {
      shiftTime(PLAY_STEP_MIN, 'play');
      if (--ticks <= 0) stop();
    }, PLAY_TICK_MS);
  };

  playBtn.addEventListener('click', () => (timer ? stop() : start()));
  $('btn-now').addEventListener('click', () => {
    const now = new Date();
    setTime(now.getHours(), now.getMinutes(), 'now');
  });

  // Any change made by the learner stops the animation.
  subscribe((_, source) => {
    if (timer && source !== 'play' && source !== 'init') stop();
  });
}

// Tint the page background with the current part of the day.
function initPageTint() {
  subscribe(({ h }) => { document.body.dataset.phase = partOfDay(h); });
}

applyStrings();
initPageTint();
initStageScene($('stage'), $('phase-name'), strings);
initDigital($('digital'), strings);
initSentence();
initControls();
initPairs($('pairs'), strings);
initDial($('dial'), strings);
initName(strings);
initLessons(strings);
initQuiz(strings);
initAnalytics();
