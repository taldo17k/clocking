// Builds the Hebrew page, site/he/index.html, from the English site/index.html.
//   npm run build:he
// Run it after changing site/index.html or site/strings/he.js. A unit test
// (tests/he-page.test.js) fails, and so does the deploy, if the Hebrew page is
// out of date, so the two can never drift apart.
//
// The Hebrew page uses the same CSS, JavaScript and images as the English one
// (<base href="../">). It starts in Hebrew and right-to-left before any script
// runs, and its link preview (title, description, picture) is in Hebrew.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SITE = 'https://taldo17k.github.io/clocking/';
const root = (path) => fileURLToPath(new URL(`../site/${path}`, import.meta.url));

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildHebrewPage(englishHtml, he) {
  let html = englishHtml;
  const replace = (from, to) => {
    if (!html.includes(from)) throw new Error(`build-he: expected to find ${from}`);
    html = html.replace(from, to);
  };
  const setMeta = (attr, name, value) => {
    const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(">)`);
    if (!re.test(html)) throw new Error(`build-he: missing <meta ${attr}="${name}">`);
    html = html.replace(re, `$1${escapeHtml(value)}$2`);
  };

  const title = `Clocking · ${he.heroTitle}`;
  const description = 'דרך ידידותית ואינטראקטיבית ללמוד לקרוא שעון של 24 שעות: זוגות שעות, שעון עם שתי טבעות, שיעור קצר ותרגול.';
  const alt = `Clocking: ${he.heroTitle}, עם שבע תמונות שמיים מהלילה ועד הערב.`;

  replace('<html lang="en" dir="ltr"', `<html lang="${he.lang}" dir="${he.dir}"`);
  replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <!-- Generated from ../index.html by scripts/build-he.mjs. Edit those, then run: npm run build:he -->\n  <base href="../">');
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  setMeta('name', 'description', description);
  replace(`<link rel="canonical" href="${SITE}">`, `<link rel="canonical" href="${SITE}he/">`);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', `${SITE}he/`);
  setMeta('property', 'og:image', `${SITE}assets/og-image-he.jpg`);
  setMeta('property', 'og:image:alt', alt);
  replace('<meta property="og:site_name" content="Clocking">', '<meta property="og:site_name" content="Clocking">\n  <meta property="og:locale" content="he_IL">');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', `${SITE}assets/og-image-he.jpg`);
  setMeta('name', 'twitter:image:alt', alt);
  // Rubik has Hebrew letters (Nunito doesn't); Fredoka already includes Hebrew.
  html = html.replaceAll('family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;800', 'family=Fredoka:wght@500;600;700&family=Rubik:wght@400;600;800');
  replace('<a class="brand" href="./">', '<a class="brand" href="he/">');

  // Fill in the Hebrew text now, so the page never shows English first.
  html = html.replace(/(<[^>]*\sdata-i18n="(\w+)"[^>]*>)([^<]*)(<)/g, (all, open, key, _text, close) =>
    (typeof he[key] === 'string' ? `${open}${escapeHtml(he[key])}${close}` : all));
  html = html.replace(/(<[^>]*\sdata-i18n-label="(\w+)"[^>]*>)/g, (tag, _all, key) =>
    (typeof he[key] === 'string' ? tag.replace(/aria-label="[^"]*"/, `aria-label="${escapeHtml(he[key])}"`) : tag));
  return html;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const he = (await import('../site/strings/he.js')).default;
  const html = buildHebrewPage(readFileSync(root('index.html'), 'utf8'), he);
  mkdirSync(root('he'), { recursive: true });
  writeFileSync(root('he/index.html'), html);
  console.log('Wrote site/he/index.html');
}
