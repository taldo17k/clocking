import { test } from 'node:test';
import assert from 'node:assert/strict';
import en from '../site/strings/en.js';
import zh from '../site/strings/zh.js';
import { format, minuteWords, spoken, spokenAs, useSpeech } from '../site/js/time.js';
import { generateRound, explain } from '../site/js/quiz-core.js';

const say = (h, m) => spoken(h, m, zh.speech);

test('both lesson examples in Chinese', () => {
  assert.equal(zh.sentence(say(8, 15)), '现在是上午八点十五分。');
  assert.equal(zh.sentence(say(22, 39)), '现在是晚上十点三十九分。');
});

test('Chinese grammar: 两点, 零五分, whole hours, 凌晨 and the parts of the day', () => {
  assert.equal(say(8, 0), '上午八点');
  assert.equal(say(8, 5), '上午八点零五分');
  assert.equal(say(8, 10), '上午八点十分');
  assert.equal(say(14, 2), '中午两点零二分');
  assert.equal(say(2, 20), '凌晨两点二十分');
  assert.equal(say(0, 0), '凌晨十二点');
  assert.equal(say(5, 45), '凌晨五点四十五分');
  assert.equal(say(6, 30), '早上六点三十分');
  assert.equal(say(12, 0), '中午十二点');
  assert.equal(say(15, 21), '下午三点二十一分');
  assert.equal(say(18, 12), '傍晚六点十二分');
  assert.equal(say(20, 59), '晚上八点五十九分');
  assert.equal(say(23, 11), '晚上十一点十一分');
  assert.equal(minuteWords(0, zh.speech), '');
  assert.equal(spokenAs(15, 15, 45, zh.speech), '下午十五点四十五分');
  assert.equal(spoken(8, 15, en.speech), 'eight fifteen in the morning');
});

test('Chinese strings have the same entries as English', () => {
  const shape = (obj, path = '') => Object.entries(obj).flatMap(([k, v]) => {
    if (path === '' && k === 'speech') return [];
    const p = path ? `${path}.${k}` : k;
    return v && typeof v === 'object' && !Array.isArray(v) ? shape(v, p) : [`${p}:${typeof v}`];
  }).sort();
  assert.deepEqual(shape(zh), shape(en));
  assert.deepEqual(Object.keys(zh.speech.partPhrase).sort(), Object.keys(en.speech.partPhrase).sort());
});

test('the quiz works in Chinese', () => {
  useSpeech(zh.speech);
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
        const text = explain(q, zh);
        assert.ok(text.length > 8 && !/undefined|NaN/.test(text), text);
        assert.ok(!/[a-z]{3,}/i.test(text), `English left in: ${text}`);
      }
    }
    assert.equal(explain({ type: 'say', h: 15, m: 45 }, zh), '15 − 12 = 3，读作“三点”；45 读作“四十五分”；这个时段前面加“下午”。');
    assert.equal(explain({ type: 'set', h: 22, m: 35, answer: format(22, 35) }, zh), '“晚上十点”在一天的后半段：10 + 12 = 22。所以是 22:35。');
    assert.equal(explain({ type: 'set', h: 2, m: 0, answer: format(2, 0) }, zh), '“凌晨两点”在一天的前半段，所以是 2:00。');
  } finally {
    useSpeech(en.speech);
  }
});
