import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spoken } from '../site/js/time.js';

for (const code of ['en', 'he', 'zh']) {
  const strings = (await import(`../site/strings/${code}.js`)).default;
  test(`${code}: Roni's step uses the clock's words; Mika's gives the time in numbers`, () => {
    const plain = (text) => text.replace(/\*\*/g, '');
    assert.ok(plain(strings.lesson.steps.roni.body).includes(spoken(22, 35, strings.speech)), 'Roni: 22:35');
    assert.ok(strings.lesson.steps.roni.body.includes('22:35'));
    assert.ok(strings.lesson.steps.mika.body.includes('19:30'));
  });
  test(`${code}: no hour is written with a leading zero`, () => {
    const all = JSON.stringify(strings, (k, v) => (typeof v === 'function' ? v.toString() : v));
    // "00" for minutes is fine (00–59); hours like 08 or 03 are not.
    assert.deepEqual(all.match(/(?<![\d:])0[1-9](?!\d)/g), null);
  });
}
