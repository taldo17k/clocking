// Builds the translated pages (site/he/index.html, site/zh/index.html) from the
// English site/index.html.
//   npm run build:pages     (npm run build:he does the same)
// Run it after changing site/index.html or a file in site/strings/. A unit test
// (tests/pages.test.js) fails, and so does the deploy, if a page is out of date,
// so the languages can never drift apart.
//
// Each page uses the same CSS, JavaScript and images as the English one
// (<base href="../">). It starts in its own language (and direction) before any
// script runs, and its link preview (title, description, picture) is translated.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SITE = 'https://taldo17k.github.io/clocking/';
const root = (path) => fileURLToPath(new URL(`../site/${path}`, import.meta.url));

/** Everything about each translated page that isn't in its strings file. */
export const LANGUAGES = {
  he: {
    locale: 'he_IL',
    description: 'דרך ידידותית ואינטראקטיבית ללמוד לקרוא שעון של 24 שעות: זוגות שעות, שעון מחוגים, שיעור קצר ותרגול.',
    alt: (title) => `Clocking: ${title}, עם שבע תמונות שמיים מהלילה ועד הערב.`,
    // Rubik has Hebrew letters (Nunito doesn't); Fredoka already includes Hebrew.
    bodyFont: 'Rubik',
  },
  zh: {
    locale: 'zh_CN',
    description: '用有趣的互动方式学会读24小时制时钟：成对的钟点、指针时钟、简短的课程和练习。',
    alt: (title) => `Clocking：${title}，七张从夜晚到晚上的天空图片。`,
    // Chinese characters come from the visitor's own system fonts (see styles.css),
    // so no large Chinese web font is downloaded.
    bodyFont: null,
  },
};

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildPage(englishHtml, code, strings) {
  const cfg = LANGUAGES[code];
  let html = englishHtml;
  const replace = (from, to) => {
    if (!html.includes(from)) throw new Error(`build-pages (${code}): expected to find ${from}`);
    html = html.replace(from, to);
  };
  const setMeta = (attr, name, value) => {
    const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(">)`);
    if (!re.test(html)) throw new Error(`build-pages (${code}): missing <meta ${attr}="${name}">`);
    html = html.replace(re, `$1${escapeHtml(value)}$2`);
  };

  const url = `${SITE}${code}/`;
  const image = `${SITE}assets/og-image-${code}.jpg`;
  const title = `Clocking · ${strings.heroTitle}`;

  replace('<html lang="en" dir="ltr"', `<html lang="${strings.lang}" dir="${strings.dir}"`);
  replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <!-- Generated from ../index.html by scripts/build-pages.mjs. Edit those, then run: npm run build:pages -->\n  <base href="../">');
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  setMeta('name', 'description', cfg.description);
  replace(`<link rel="canonical" href="${SITE}">`, `<link rel="canonical" href="${url}">`);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', cfg.description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);
  setMeta('property', 'og:image:alt', cfg.alt(strings.heroTitle));
  replace('<meta property="og:site_name" content="Clocking">', `<meta property="og:site_name" content="Clocking">\n  <meta property="og:locale" content="${cfg.locale}">`);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', cfg.description);
  setMeta('name', 'twitter:image', image);
  setMeta('name', 'twitter:image:alt', cfg.alt(strings.heroTitle));
  if (cfg.bodyFont) html = html.replaceAll('family=Nunito:wght@400;600;800', `family=${cfg.bodyFont}:wght@400;600;800`);
  replace('<a class="brand" href="./">', `<a class="brand" href="${code}/">`);

  // Fill in the translated text now, so the page never shows English first.
  html = html.replace(/(<[^>]*\sdata-i18n="(\w+)"[^>]*>)([^<]*)(<)/g, (all, open, key, _text, close) =>
    (typeof strings[key] === 'string' ? `${open}${escapeHtml(strings[key])}${close}` : all));
  html = html.replace(/(<[^>]*\sdata-i18n-label="(\w+)"[^>]*>)/g, (tag, _all, key) =>
    (typeof strings[key] === 'string' ? tag.replace(/aria-label="[^"]*"/, `aria-label="${escapeHtml(strings[key])}"`) : tag));
  return html;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const english = readFileSync(root('index.html'), 'utf8');
  for (const code of Object.keys(LANGUAGES)) {
    const strings = (await import(`../site/strings/${code}.js`)).default;
    mkdirSync(root(code), { recursive: true });
    writeFileSync(root(`${code}/index.html`), buildPage(english, code, strings));
    console.log(`Wrote site/${code}/index.html`);
  }
}
