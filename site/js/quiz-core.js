// Quiz logic (Step 6): question generation, answer checking and explanations.
// Pure functions, no DOM, so they are unit-tested in tests/quiz.test.js.
// Every answer is computed with time.js, the same rules the rest of the page uses.
import { PHASES } from './phases.js';
import { addMinutes, format, numberWords, pad, pair, partOfDay, spoken, spokenHour } from './time.js';

export const ROUND_SIZE = 10;
export const SET_TOLERANCE_MIN = 2;
const ROUND_TYPES = ['pair', 'pair', 'part', 'part', 'say', 'say', 'say', 'set', 'set', 'set'];
const PARTS = [...new Set(PHASES.map((p) => p.id))];

const randInt = (n, rand) => Math.floor(rand() * n);
export function shuffle(list, rand = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1, rand);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** The answer plus up to three distinct wrong options, shuffled. */
function withDistractors(answer, candidates, rand) {
  const wrong = [...new Set(candidates)].filter((c) => c !== answer);
  return shuffle([answer, ...shuffle(wrong, rand).slice(0, 3)], rand);
}
const fiveMinutes = (rand) => randInt(12, rand) * 5;

const MAKERS = {
  // "Which hour is said the same way as 17?" → 05
  pair(rand) {
    const h = randInt(24, rand);
    const p = pair(h);
    const answer = pad(p);
    const options = withDistractors(answer, [
      pad((p + 1) % 24), pad((p + 23) % 24), pad((h + 1) % 24), pad((h + 10) % 24), pad((p + 2) % 24),
    ].filter((o) => o !== pad(h)), rand);
    return { type: 'pair', key: `pair:${h}`, h, m: 0, options, answer };
  },

  // "What part of the day is 20:35?" → evening
  part(rand) {
    const h = randInt(24, rand);
    const m = fiveMinutes(rand);
    const answer = partOfDay(h);
    const options = withDistractors(answer, PARTS, rand);
    return { type: 'part', key: `part:${h}`, h, m, options, answer };
  },

  // "How do we say 15:45?" → "three forty-five in the afternoon"
  say(rand) {
    const h = randInt(24, rand);
    const m = fiveMinutes(rand);
    const answer = spoken(h, m);
    const words = answer.split(' ');
    const candidates = [
      spoken(pair(h), m),                         // right words, wrong half of the day
      spoken(h, (m + 10) % 60),                   // wrong minutes
      spoken((h + 1) % 24, m),                    // hour off by one
    ];
    if (h >= 13) candidates.unshift([numberWords(h), ...words.slice(1)].join(' ')); // "fifteen forty-five…"
    const options = withDistractors(answer, candidates, rand);
    return { type: 'say', key: `say:${h}:${m}`, h, m, options, answer };
  },

  // "Set the digital clock / two-ring clock to ten thirty-five at night." → 22:35
  set(rand, via = 'digital') {
    const h = randInt(24, rand);
    const m = fiveMinutes(rand);
    const start = addMinutes(h, m, 7 * 60 + 25); // start well away from the answer
    return { type: 'set', key: `set:${h}:${m}`, h, m, via, words: spoken(h, m), start, answer: format(h, m) };
  },
};

export function makeQuestion(type, rand = Math.random, via) {
  return MAKERS[type](rand, via);
}

/**
 * Ten questions: 2 pair, 2 part, 3 say, 3 set, in random order, never the
 * same one twice. The set-the-clock questions use both clocks: at least one
 * on the digital clock and one on the two-ring clock.
 */
export function generateRound(rand = Math.random) {
  const seen = new Set();
  const vias = shuffle(['digital', 'dial', rand() < 0.5 ? 'digital' : 'dial'], rand);
  return shuffle(ROUND_TYPES, rand).map((type) => {
    const via = type === 'set' ? vias.shift() : undefined;
    let q;
    let tries = 0;
    do { q = makeQuestion(type, rand, via); tries++; } while (seen.has(q.key) && tries < 100);
    seen.add(q.key);
    return q;
  });
}

/** For multiple-choice questions. */
export const isCorrectChoice = (q, choice) => choice === q.answer;

/** For "set the clock": within ±2 minutes, also across midnight. */
export function isCorrectSet(q, h, m) {
  const diff = Math.abs(h * 60 + m - (q.h * 60 + q.m));
  return Math.min(diff, 24 * 60 - diff) <= SET_TOLERANCE_MIN;
}

/** The rule behind the answer, in words. */
export function explain(q, strings) {
  const t = strings.quiz.explain;
  const part = partOfDay(q.h);
  const phase = PHASES.find((p) => q.h >= p.from && q.h <= p.to);
  const range = phase.from === phase.to ? pad(phase.from) : `${pad(phase.from)}–${pad(phase.to)}`;
  const hourWord = numberWords(spokenHour(q.h));
  const hourRule = q.h >= 12
    ? t.minus(pad(q.h), pad(spokenHour(q.h) % 12 === 0 ? 0 : spokenHour(q.h)), hourWord)
    : q.h === 0 ? t.midnight : t.same(pad(q.h), hourWord);

  switch (q.type) {
    case 'pair':
      return q.h >= 12 ? t.pairDown(pad(q.h), q.answer) : t.pairUp(pad(q.h), q.answer);
    case 'part':
      return t.part(format(q.h, q.m), strings.phases[part], range);
    case 'say':
      return t.say(hourRule, pad(q.m), q.m === 0 ? strings.speech.oclock : numberWords(q.m), strings.speech.partPhrase[part]);
    case 'set':
      return t.set(hourWord, strings.speech.partPhrase[part], q.answer, q.h >= 12 ? t.plus(pad(spokenHour(q.h) % 12), pad(q.h)) : '');
    default:
      return '';
  }
}

/** Score band for the end screen: 'perfect' | 'great' | 'good' | 'practice'. */
export function scoreBand(score, total = ROUND_SIZE) {
  if (score === total) return 'perfect';
  if (score >= Math.ceil(total * 0.7)) return 'great';
  if (score >= Math.ceil(total * 0.4)) return 'good';
  return 'practice';
}
