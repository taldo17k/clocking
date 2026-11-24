import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildHebrewPage } from '../scripts/build-he.mjs';
import he from '../site/strings/he.js';

const read = (p) => readFileSync(new URL(`../site/${p}`, import.meta.url), 'utf8');

test('site/he/index.html is up to date (run: npm run build:he)', () => {
  assert.equal(read('he/index.html'), buildHebrewPage(read('index.html'), he),
    'The Hebrew page is out of date. Run: npm run build:he');
});

test('the Hebrew page starts in Hebrew, right-to-left, with a Hebrew preview', () => {
  const html = read('he/index.html');
  assert.match(html, /<html lang="he" dir="rtl"/);
  assert.match(html, /<base href="\.\.\/">/);
  assert.match(html, /og:url" content="https:\/\/taldo17k\.github\.io\/clocking\/he\/"/);
  assert.match(html, /og:image" content="[^"]*og-image-he\.jpg"/);
  assert.ok(html.includes(`data-i18n="heroTitle">${he.heroTitle}<`), 'the Hebrew title is filled in');
});
