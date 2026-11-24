import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  pad, format, pair, spokenHour, partOfDay, amPm, addMinutes,
  handAngles, numberWords, spoken, spokenLong,
} from '../site/js/time.js';

const ALL_HOURS = Array.from({ length: 24 }, (_, h) => h);

test('format: hours without a leading zero, minutes with two digits', () => {
  assert.equal(pad(7), '07');
  assert.equal(format(8, 15), '8:15');
  assert.equal(format(0, 0), '0:00');
  assert.equal(format(22, 5), '22:05');
  assert.equal(format(23, 59), '23:59');
});

test('pair matches the pairs table for all 24 hours', () => {
  const table = [[0, 12], [1, 13], [2, 14], [3, 15], [4, 16], [5, 17],
    [6, 18], [7, 19], [8, 20], [9, 21], [10, 22], [11, 23]];
  for (const [a, b] of table) {
    assert.equal(pair(a), b, `pair(${a})`);
    assert.equal(pair(b), a, `pair(${b})`);
  }
  for (const h of ALL_HOURS) assert.equal(pair(pair(h)), h);
});

test('spokenHour: both hours in a pair are said the same, 00 and 12 are "twelve"', () => {
  assert.equal(spokenHour(0), 12);
  assert.equal(spokenHour(12), 12);
  assert.equal(spokenHour(1), 1);
  assert.equal(spokenHour(13), 1);
  assert.equal(spokenHour(23), 11);
  for (const h of ALL_HOURS) {
    assert.equal(spokenHour(h), spokenHour(pair(h)));
    assert.ok(spokenHour(h) >= 1 && spokenHour(h) <= 12);
  }
});

test('partOfDay covers all 24 hours with the agreed ranges', () => {
  const expected = {
    night: [0, 1, 2, 3, 4, 5, 22, 23],
    sunrise: [6],
    morning: [7, 8, 9, 10, 11],
    midday: [12, 13, 14],
    afternoon: [15, 16, 17],
    sunset: [18],
    evening: [19, 20, 21],
  };
  for (const [part, hours] of Object.entries(expected)) {
    for (const h of hours) assert.equal(partOfDay(h), part, `partOfDay(${h})`);
  }
  assert.equal(Object.values(expected).flat().length, 24);
});

test('partOfDay boundaries', () => {
  assert.equal(partOfDay(5), 'night');
  assert.equal(partOfDay(6), 'sunrise');
  assert.equal(partOfDay(7), 'morning');
  assert.equal(partOfDay(11), 'morning');
  assert.equal(partOfDay(12), 'midday');
  assert.equal(partOfDay(14), 'midday');
  assert.equal(partOfDay(15), 'afternoon');
  assert.equal(partOfDay(17), 'afternoon');
  assert.equal(partOfDay(18), 'sunset');
  assert.equal(partOfDay(19), 'evening');
  assert.equal(partOfDay(21), 'evening');
  assert.equal(partOfDay(22), 'night');
});

test('amPm hint', () => {
  assert.deepEqual(amPm(0), { hour: 12, period: 'AM' });
  assert.deepEqual(amPm(11), { hour: 11, period: 'AM' });
  assert.deepEqual(amPm(12), { hour: 12, period: 'PM' });
  assert.deepEqual(amPm(15), { hour: 3, period: 'PM' });
  assert.deepEqual(amPm(23), { hour: 11, period: 'PM' });
});

test('addMinutes wraps around midnight both ways', () => {
  assert.deepEqual(addMinutes(23, 59, 1), { h: 0, m: 0 });
  assert.deepEqual(addMinutes(0, 0, -1), { h: 23, m: 59 });
  assert.deepEqual(addMinutes(12, 59, 1), { h: 13, m: 0 });
  assert.deepEqual(addMinutes(8, 15, 60), { h: 9, m: 15 });
  assert.deepEqual(addMinutes(23, 0, 60), { h: 0, m: 0 });
  assert.deepEqual(addMinutes(10, 30, 24 * 60), { h: 10, m: 30 });
  assert.deepEqual(addMinutes(1, 0, -3 * 24 * 60 - 61), { h: 23, m: 59 });
});

test('handAngles: 12 at the top, pairs share an angle', () => {
  assert.deepEqual(handAngles(0, 0), { hour: 0, minute: 0 });
  assert.deepEqual(handAngles(12, 0), { hour: 0, minute: 0 });
  assert.deepEqual(handAngles(3, 0), { hour: 90, minute: 0 });
  assert.deepEqual(handAngles(15, 0), { hour: 90, minute: 0 });
  assert.deepEqual(handAngles(6, 30), { hour: 195, minute: 180 });
  for (const h of ALL_HOURS) {
    assert.equal(handAngles(h, 20).hour, handAngles(pair(h), 20).hour, `hour ${h} and ${pair(h)} share an angle`);
  }
});

test('numberWords', () => {
  assert.equal(numberWords(0), 'zero');
  assert.equal(numberWords(5), 'five');
  assert.equal(numberWords(12), 'twelve');
  assert.equal(numberWords(15), 'fifteen');
  assert.equal(numberWords(20), 'twenty');
  assert.equal(numberWords(39), 'thirty-nine');
  assert.equal(numberWords(59), 'fifty-nine');
});

test('the two examples from the hand-made page', () => {
  assert.equal(spoken(8, 15), 'eight fifteen in the morning');
  assert.equal(spoken(22, 39), 'ten thirty-nine at night');
  assert.equal(spokenLong(8, 15), 'eight and fifteen minutes in the morning');
  assert.equal(spokenLong(22, 39), 'ten and thirty-nine minutes at night');
});

test('spoken edge cases', () => {
  assert.equal(spoken(0, 0), "twelve o'clock at night");
  assert.equal(spoken(6, 0), "six o'clock in the morning");
  assert.equal(spoken(12, 0), "twelve o'clock at midday");
  assert.equal(spoken(15, 45), 'three forty-five in the afternoon');
  assert.equal(spoken(18, 0), "six o'clock in the evening");
  assert.equal(spoken(23, 59), 'eleven fifty-nine at night');
  assert.equal(spoken(8, 5), 'eight oh five in the morning');
  assert.equal(spoken(13, 30), 'one thirty at midday');
  assert.equal(spokenLong(9, 1), 'nine and one minute in the morning');
  assert.equal(spokenLong(20, 0), "eight o'clock in the evening");
});

test('pairs are said with the same words, apart from the part of the day', () => {
  for (const h of ALL_HOURS) {
    const a = spoken(h, 10).split(' ').slice(0, 2).join(' ');
    const b = spoken(pair(h), 10).split(' ').slice(0, 2).join(' ');
    assert.equal(a, b);
  }
});

test('invalid input throws', () => {
  for (const bad of [-1, 24, 1.5, NaN, '8']) {
    assert.throws(() => pair(bad), RangeError);
    assert.throws(() => partOfDay(bad), RangeError);
  }
  for (const bad of [-1, 60, 2.5]) {
    assert.throws(() => spoken(8, bad), RangeError);
    assert.throws(() => handAngles(8, bad), RangeError);
  }
});
