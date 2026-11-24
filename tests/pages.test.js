import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { buildPage, LANGUAGES } from '../scripts/build-pages.mjs';

const read = (p) => readFileSync(new URL(`../site/${p}`, import.meta.url), 'utf8');

for (const code of Object.keys(LANGUAGES)) {
  const strings = (await import(`../site/strings/${code}.js`)).default;

  test(`site/${code}/index.html is up to date (run: npm run build:pages)`, () => {
    assert.equal(read(`${code}/index.html`), buildPage(read('index.html'), code, strings),
      `The ${code} page is out of date. Run: npm run build:pages`);
  });

  test(`the ${code} page starts in its own language, with its own preview`, () => {
    const html = read(`${code}/index.html`);
    assert.ok(html.includes(`<html lang="${strings.lang}" dir="${strings.dir}"`));
    assert.match(html, /<base href="\.\.\/">/);
    assert.ok(html.includes(`og:url" content="https://taldo17k.github.io/clocking/${code}/"`));
    assert.ok(html.includes(`og:image" content="https://taldo17k.github.io/clocking/assets/og-image-${code}.jpg"`));
    assert.ok(existsSync(new URL(`../site/assets/og-image-${code}.jpg`, import.meta.url)), 'the preview picture exists');
    assert.ok(html.includes(`data-i18n="heroTitle">${strings.heroTitle}<`), 'the title is filled in');
  });
}

test('the English page links to every language for search engines', () => {
  const html = read('index.html');
  for (const code of Object.keys(LANGUAGES)) {
    assert.match(html, new RegExp(`hreflang="${code}[^"]*" href="https://taldo17k.github.io/clocking/${code}/"`));
  }
});
