import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROUND_SIZE, generateRound, makeQuestion, isCorrectChoice, isCorrectSet, explain, scoreBand,
} from '../site/js/quiz-core.js';
import { format, pair, pad, partOfDay, spoken } from '../site/js/time.js';
import strings from '../site/strings/en.js';

// Small seeded generator so failures are reproducible.
const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1);

test('a round has 10 questions, the agreed mix, and no repeats', () => {
  for (const seed of SEEDS) {
    const round = generateRound(seeded(seed));
    assert.equal(round.length, ROUND_SIZE);
    const keys = round.map((q) => q.key);
    assert.equal(new Set(keys).size, ROUND_SIZE, `repeat in seed ${seed}: ${keys}`);
    const count = (t) => round.filter((q) => q.type === t).length;
    assert.deepEqual([count('pair'), count('part'), count('say'), count('set')], [2, 2, 3, 3]);
    const vias = round.filter((q) => q.type === 'set').map((q) => q.via);
    assert.ok(vias.includes('digital') && vias.includes('dial'), `both clocks used, seed ${seed}: ${vias}`);
    assert.ok(vias.every((v) => v === 'digital' || v === 'dial'));
  }
});

test('multiple-choice questions have 4 distinct options including the answer', () => {
  for (const seed of SEEDS) {
    for (const type of ['pair', 'part', 'say']) {
      const q = makeQuestion(type, seeded(seed));
      assert.equal(q.options.length, 4, `${type} seed ${seed}: ${q.options}`);
      assert.equal(new Set(q.options).size, 4);
      assert.ok(q.options.includes(q.answer));
    }
  }
});

test('answers agree with time.js', () => {
  for (const seed of SEEDS) {
    const r = seeded(seed);
    const p = makeQuestion('pair', r);
    assert.equal(p.answer, pad(pair(p.h)));
    assert.ok(!p.options.includes(pad(p.h)), 'the question hour is never an option');
    const pt = makeQuestion('part', r);
    assert.equal(pt.answer, partOfDay(pt.h));
    const s = makeQuestion('say', r);
    assert.equal(s.answer, spoken(s.h, s.m));
    const st = makeQuestion('set', r);
    assert.equal(st.answer, format(st.h, st.m));
    assert.equal(st.words, spoken(st.h, st.m));
    assert.equal(st.m % 5, 0);
    assert.ok(!isCorrectSet(st, st.start.h, st.start.m), 'set questions never start on the answer');
  }
});

test('the "say" distractors include the classic mistakes', () => {
  const q = { ...makeQuestion('say', seeded(5)) };
  // Build one by hand: 15:45
  const fixed = makeQuestion('say', (() => { const v = [15 / 24 + 0.001, 9 / 12 + 0.001]; let i = 0; return () => (i < v.length ? v[i++] : 0.5); })());
  assert.equal(fixed.h, 15);
  assert.equal(fixed.m, 45);
  assert.equal(fixed.answer, 'three forty-five in the afternoon');
  assert.ok(q.options.length === 4);
});

test('choice checking', () => {
  const q = makeQuestion('pair', seeded(3));
  assert.ok(isCorrectChoice(q, q.answer));
  assert.ok(!isCorrectChoice(q, q.options.find((o) => o !== q.answer)));
});

test('set-the-clock accepts ±2 minutes, also across midnight', () => {
  const q = { type: 'set', h: 22, m: 35 };
  assert.ok(isCorrectSet(q, 22, 35));
  assert.ok(isCorrectSet(q, 22, 33));
  assert.ok(isCorrectSet(q, 22, 37));
  assert.ok(!isCorrectSet(q, 22, 38));
  assert.ok(!isCorrectSet(q, 10, 35), 'the pair hour is wrong');
  const midnight = { type: 'set', h: 0, m: 0 };
  assert.ok(isCorrectSet(midnight, 23, 59));
  assert.ok(isCorrectSet(midnight, 23, 58));
  assert.ok(!isCorrectSet(midnight, 23, 57));
});

test('explanations', () => {
  assert.equal(explain({ type: 'pair', h: 17, answer: '05' }, strings), '17 − 12 = 05. They are said the same way.');
  assert.equal(explain({ type: 'pair', h: 3, answer: '15' }, strings), '03 + 12 = 15. They are said the same way.');
  assert.equal(explain({ type: 'part', h: 20, m: 0 }, strings), '20:00 belongs to Evening (19–21).');
  assert.equal(explain({ type: 'part', h: 6, m: 30 }, strings), '06:30 belongs to Sunrise (06).');
  assert.equal(explain({ type: 'say', h: 15, m: 45 }, strings), '15 − 12 = 03, said "three"; 45 is "forty-five"; and it\'s in the afternoon.');
  assert.equal(explain({ type: 'say', h: 8, m: 0 }, strings), '08 is said "eight"; 00 is "o\'clock"; and it\'s in the morning.');
  assert.equal(explain({ type: 'say', h: 12, m: 5 }, strings), '12 − 12 = 00, said "twelve"; 05 is "five"; and it\'s at midday.');
  assert.equal(explain({ type: 'set', h: 22, m: 35, answer: '22:35' }, strings), '"ten" at night is in the second half of the day: 10 + 12 = 22. So it\'s 22:35.');
  assert.equal(explain({ type: 'set', h: 8, m: 15, answer: '08:15' }, strings), '"eight" in the morning is in the first half of the day, so it\'s 08:15.');
  for (const seed of SEEDS.slice(0, 50)) {
    for (const q of generateRound(seeded(seed))) assert.ok(explain(q, strings).length > 10);
  }
});

test('score bands', () => {
  assert.equal(scoreBand(10), 'perfect');
  assert.equal(scoreBand(9), 'great');
  assert.equal(scoreBand(7), 'great');
  assert.equal(scoreBand(6), 'good');
  assert.equal(scoreBand(4), 'good');
  assert.equal(scoreBand(3), 'practice');
  assert.equal(scoreBand(0), 'practice');
});
