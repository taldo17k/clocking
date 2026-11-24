import { test } from 'node:test';
import assert from 'node:assert/strict';
import en from '../site/strings/en.js';
import he from '../site/strings/he.js';
import { format, minuteWords, spoken, spokenAs, useSpeech } from '../site/js/time.js';
import { generateRound, explain } from '../site/js/quiz-core.js';

const say = (h, m) => spoken(h, m, he.speech);

test('both lesson examples match the hand-made page word for word', () => {
  assert.equal(he.sentence(say(8, 15)), 'השעה שמונה וחמש עשרה דקות בבוקר.');
  assert.equal(he.sentence(say(22, 39)), 'השעה עשר ושלושים ותשע דקות בלילה.');
});

test('Hebrew grammar: feminine numbers, one and two minutes, o\'clock, parts of the day', () => {
  assert.equal(say(8, 0), 'שמונה בבוקר');
  assert.equal(say(8, 1), 'שמונה ודקה אחת בבוקר');
  assert.equal(say(8, 2), 'שמונה ושתי דקות בבוקר');
  assert.equal(say(8, 5), 'שמונה וחמש דקות בבוקר');
  assert.equal(say(15, 21), 'שלוש ועשרים ואחת דקות אחר הצהריים');
  assert.equal(say(15, 22), 'שלוש ועשרים ושתיים דקות אחר הצהריים');
  assert.equal(say(0, 5), 'שתים עשרה וחמש דקות בלילה');
  assert.equal(say(12, 30), 'שתים עשרה ושלושים דקות בצהריים');
  assert.equal(say(11, 50), 'אחת עשרה וחמישים דקות בבוקר');
  assert.equal(say(6, 10), 'שש ועשר דקות בבוקר');
  assert.equal(say(18, 45), 'שש וארבעים וחמש דקות בערב');
  assert.equal(say(20, 0), 'שמונה בערב');
  assert.equal(minuteWords(0, he.speech), '');
  assert.equal(spokenAs(15, 15, 45, he.speech), 'חמש עשרה וארבעים וחמש דקות אחר הצהריים');
  // English is unchanged
  assert.equal(spoken(8, 15, en.speech), 'eight fifteen in the morning');
  assert.equal(spokenAs(15, 15, 45, en.speech), 'fifteen forty-five in the afternoon');
});

test('Hebrew strings have the same entries as English', () => {
  const shape = (obj, path = '') => Object.entries(obj).flatMap(([k, v]) => {
    if (path === '' && k === 'speech') return []; // words differ by language on purpose
    const p = path ? `${path}.${k}` : k;
    return v && typeof v === 'object' && !Array.isArray(v) ? shape(v, p) : [`${p}:${typeof v}`];
  }).sort();
  assert.deepEqual(shape(he), shape(en));
  assert.deepEqual(Object.keys(he.speech.partPhrase).sort(), Object.keys(en.speech.partPhrase).sort());
});

test('the quiz works in Hebrew', () => {
  useSpeech(he.speech);
  try {
    for (let seed = 1; seed <= 100; seed++) {
      let s = seed;
      const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (const q of generateRound(rand)) {
        if (q.options) {
          assert.equal(new Set(q.options).size, 4, q.options.join(' | '));
          assert.ok(q.options.includes(q.answer));
        }
        if (q.type === 'say') assert.equal(q.answer, spoken(q.h, q.m));
        if (q.type === 'set') assert.equal(q.words, spoken(q.h, q.m));
        const text = explain(q, he);
        assert.ok(text.length > 10 && !/undefined|NaN/.test(text), text);
        assert.ok(!/[a-z]{3,}/i.test(text.replace(/⁦|⁩/g, '')), `English left in: ${text}`);
      }
    }
    assert.equal(explain({ type: 'say', h: 15, m: 45 }, he), '⁦15 − 12 = 03⁩, ואומרים "שלוש"; 45 זה "ארבעים וחמש דקות"; וזה אחר הצהריים.');
    assert.equal(explain({ type: 'set', h: 22, m: 35, answer: format(22, 35) }, he), '"עשר" בלילה זה בחצי השני של היממה: ⁦10 + 12 = 22⁩. לכן השעה 22:35.');
  } finally {
    useSpeech(en.speech);
  }
});
