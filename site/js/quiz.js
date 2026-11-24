// Practice quiz (Step 6): a floating card like the lesson card. Ten questions
// per round, instant feedback with the rule, score + streak, a little burst of
// suns and stars on a good streak, and an end screen with the best score.
import { getTime, setTime } from './state.js';
import {
  ROUND_SIZE, generateRound, isCorrectChoice, isCorrectSet, explain, scoreBand,
} from './quiz-core.js';
import { format } from './time.js';
import { play, isMuted, setMuted } from './sound.js';
import { ensureName, getName } from './name.js';

const STORAGE_KEY = 'clocking.quiz';
const STREAK_CELEBRATIONS = new Set([3, 5, 8, 10]);

// Where a set-the-clock question sends the learner: what to scroll to and what glows.
const SET_TARGETS = {
  digital: { scroll: '.stage', glow: '.stage' },
  dial: { scroll: '#dial', glow: '.dial-panel' },   // the clock and its sun/moon switch
};

const storage = {
  read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  },
  write(value) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* not kept */ }
  },
};

function richText(el, text) {
  el.replaceChildren(...text.split('**').map((part, i) => {
    if (i % 2 === 0) return document.createTextNode(part);
    const b = document.createElement('strong');
    b.textContent = part;
    return b;
  }));
}

const ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICON_CROSS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>';

export function initQuiz(strings) {
  const Q = strings.quiz;
  const card = document.getElementById('quiz');
  const openBtn = document.getElementById('btn-quiz');
  const progressText = card.querySelector('.quiz-progress');
  const scoreEl = card.querySelector('[data-stat="score"] span');
  const streakEl = card.querySelector('[data-stat="streak"] span');
  const streakStat = card.querySelector('[data-stat="streak"]');
  const prompt = card.querySelector('.quiz-prompt');
  const hint = card.querySelector('.quiz-hint');
  const optionsBox = card.querySelector('.quiz-options');
  const feedback = card.querySelector('.quiz-feedback');
  const actionBtn = card.querySelector('[data-action="quiz-next"]');
  const actionLabel = actionBtn.querySelector('span');
  const closeBtn = card.querySelector('[data-action="close"]');
  const dots = card.querySelector('.lesson-dots');
  const burst = card.querySelector('.quiz-burst');
  const soundBtn = card.querySelector('[data-action="sound"]');

  const renderSound = () => {
    const off = isMuted();
    soundBtn.classList.toggle('is-off', off);
    soundBtn.setAttribute('aria-pressed', String(!off));
    soundBtn.setAttribute('aria-label', off ? Q.soundOff : Q.soundOn);
    soundBtn.title = off ? Q.soundOff : Q.soundOn;
  };
  soundBtn.addEventListener('click', () => { setMuted(!isMuted()); renderSound(); });
  renderSound();

  closeBtn.setAttribute('aria-label', Q.close);
  for (let i = 0; i < ROUND_SIZE; i++) {
    const d = document.createElement('span');
    d.className = 'lesson-dot';
    dots.append(d);
  }

  let round = [];
  let index = 0;
  let score = 0;
  let streak = 0;
  let answered = false;
  let results = [];
  let open = false;

  const current = () => round[index];
  const clearSpotlight = () => document.querySelectorAll('.is-spotlight').forEach((el) => el.classList.remove('is-spotlight'));

  const updateStats = () => {
    scoreEl.textContent = Q.score(score);
    streakEl.textContent = Q.streak(streak);
    streakStat.classList.toggle('is-hot', streak >= 3);
    [...dots.children].forEach((d, i) => {
      d.classList.toggle('is-current', i === index && index < round.length);
      d.classList.toggle('is-right', results[i] === true);
      d.classList.toggle('is-wrong', results[i] === false);
    });
  };

  const setAction = (label, { hidden = false } = {}) => {
    actionLabel.textContent = label;
    actionBtn.hidden = hidden;
  };

  const celebrate = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    burst.replaceChildren();
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.className = i % 3 === 0 ? 'burst-sun' : 'burst-star';
      const angle = (i / 14) * Math.PI * 2;
      const dist = 70 + Math.random() * 60;
      s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      s.style.setProperty('--dy', `${Math.sin(angle) * dist - 30}px`);
      s.style.animationDelay = `${Math.random() * 120}ms`;
      burst.append(s);
    }
    setTimeout(() => burst.replaceChildren(), 1400);
  };

  const showFeedback = (correct, extra = '') => {
    const q = current();
    feedback.replaceChildren();
    feedback.className = `quiz-feedback ${correct ? 'is-right' : 'is-wrong'}`;
    const head = document.createElement('strong');
    head.textContent = correct ? Q.correct : Q.wrong;
    feedback.append(head, ' ', extra ? `${extra} ` : '', explain(q, strings));
    if (correct && STREAK_CELEBRATIONS.has(streak)) {
      const chip = document.createElement('span');
      chip.className = 'quiz-streak-chip';
      chip.textContent = getName() ? strings.name.inARow(streak, getName()) : Q.inARow(streak);
      feedback.append(' ', chip);
      celebrate();
      play('streak');
    }
    feedback.hidden = false;
  };

  const answer = (correct, extra) => {
    answered = true;
    results[index] = correct;
    if (correct) { score++; streak++; } else { streak = 0; }
    updateStats();
    play(correct ? 'correct' : 'wrong');
    showFeedback(correct, extra);
    // Show the question's time on the page as feedback (scene, table, dial).
    const q = current();
    setTime(q.h, q.m, 'quiz');
    setAction(index === round.length - 1 ? Q.results : Q.next);
    actionBtn.focus({ preventScroll: true });
  };

  const showQuestion = () => {
    const q = current();
    answered = false;
    burst.replaceChildren();
    clearSpotlight();
    feedback.hidden = true;
    progressText.textContent = Q.progress(index + 1, round.length);
    card.classList.remove('is-finished');
    updateStats();

    const time = format(q.h, q.m);
    if (q.type === 'pair') richText(prompt, Q.prompts.pair(String(q.h)));
    if (q.type === 'part') richText(prompt, Q.prompts.part(time));
    if (q.type === 'say') richText(prompt, Q.prompts.say(time));
    if (q.type === 'set') richText(prompt, q.via === 'dial' ? Q.prompts.setDial(format(q.h, q.m)) : Q.prompts.setDigital(q.words));

    optionsBox.replaceChildren();
    if (q.type === 'set') {
      const target = SET_TARGETS[q.via] ?? SET_TARGETS.digital;
      hint.textContent = Q.setHint[q.via] ?? Q.setHint.digital;
      hint.hidden = false;
      optionsBox.hidden = true;
      setTime(q.start.h, q.start.m, 'quiz');
      document.querySelector(target.glow).classList.add('is-spotlight');
      // Bring the clock to the top of the screen, above the quiz card.
      document.querySelector(target.scroll).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      setAction(Q.check);
    } else {
      hint.hidden = true;
      optionsBox.hidden = false;
      optionsBox.dataset.type = q.type;
      q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        btn.dataset.value = opt;
        if (q.type === 'part') btn.dataset.phase = opt;
        const label = document.createElement('span');
        label.textContent = q.type === 'part' ? strings.phases[opt] : opt;
        btn.append(label);
        btn.addEventListener('click', () => {
          if (answered) return;
          const correct = isCorrectChoice(q, opt);
          optionsBox.querySelectorAll('.quiz-option').forEach((b) => {
            b.disabled = true;
            if (b.dataset.value === q.answer) { b.classList.add('is-right'); b.insertAdjacentHTML('beforeend', ICON_CHECK); }
          });
          if (!correct) { btn.classList.add('is-wrong'); btn.insertAdjacentHTML('beforeend', ICON_CROSS); }
          answer(correct);
        });
        optionsBox.append(btn);
      });
      setAction(Q.next, { hidden: true });
      optionsBox.querySelector('.quiz-option')?.focus({ preventScroll: true });
    }
  };

  const showEnd = () => {
    clearSpotlight();
    card.classList.add('is-finished');
    const saved = storage.read();
    const best = Math.max(saved.best ?? 0, score);
    const isNewBest = score > (saved.best ?? -1) && score > 0;
    storage.write({ best, rounds: (saved.rounds ?? 0) + 1 });

    progressText.textContent = Q.end.title;
    index = round.length;
    updateStats();
    const big = document.createElement('span');
    big.className = 'quiz-final';
    big.textContent = `${score} / ${round.length}`;
    prompt.replaceChildren(big);
    hint.hidden = false;
    const band = scoreBand(score, round.length);
    hint.textContent = getName() ? strings.name.end[band](getName()) : Q.end[band];
    optionsBox.replaceChildren();
    optionsBox.hidden = true;
    feedback.hidden = false;
    feedback.className = 'quiz-feedback';
    feedback.textContent = isNewBest ? `${Q.end.newBest} ${Q.end.best(best, round.length)}` : Q.end.best(best, round.length);
    setAction(Q.again);
    if (score >= Math.ceil(round.length * 0.7)) celebrate();
    document.dispatchEvent(new CustomEvent('quiz:finished', { detail: { score, total: round.length, band: scoreBand(score, round.length) } }));
  };

  const startRound = () => {
    round = generateRound();
    index = 0;
    score = 0;
    streak = 0;
    results = [];
    showQuestion();
  };

  actionBtn.addEventListener('click', () => {
    if (card.classList.contains('is-finished')) { startRound(); return; }
    const q = current();
    if (q.type === 'set' && !answered) {
      const { h, m } = getTime();
      const correct = isCorrectSet(q, h, m);
      answer(correct, correct ? '' : Q.youSet(format(h, m)));
      return;
    }
    if (!answered) return;
    index++;
    if (index < round.length) showQuestion();
    else showEnd();
  });

  const openQuiz = async () => {
    await ensureName();
    document.dispatchEvent(new CustomEvent('sheet:open', { detail: 'quiz' }));
    open = true;
    card.hidden = false;
    document.body.classList.add('lesson-open');
    openBtn.setAttribute('aria-expanded', 'true');
    startRound();
  };
  const closeQuiz = () => {
    if (!open) return;
    open = false;
    card.hidden = true;
    clearSpotlight();
    document.body.classList.remove('lesson-open');
    openBtn.setAttribute('aria-expanded', 'false');
  };

  openBtn.addEventListener('click', () => (open ? closeQuiz() : openQuiz()));
  closeBtn.addEventListener('click', () => { closeQuiz(); openBtn.focus(); });
  card.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeQuiz(); openBtn.focus(); } });
  document.addEventListener('sheet:open', (e) => { if (e.detail !== 'quiz') closeQuiz(); });
}
