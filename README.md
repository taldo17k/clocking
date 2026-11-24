# Clocking: learn the 24-hour clock

A friendly, interactive website that teaches how to read the 24-hour clock.

**Live site: https://taldo17k.github.io/clocking/** · **בעברית: https://taldo17k.github.io/clocking/he/**

![Clocking: the hour pairs board with a sky picture for every part of the day](docs/screenshot.png)

## What's inside

- **Hour pairs:** the table from the original drawing. Each hour from 00–11 sits next to its partner 12 hours later (08 = 20), with an animated sky for every part of the day.
- **Two-ring clock:** the inner ring holds 00–11 and the outer ring holds 12–23. Drag the hands or tap a number.
- **Digital clock:** change the time with the arrows, by swiping or with the keyboard, and read it as a sentence ("It's ten thirty-nine at night").
- **Lesson:** six short steps that walk through the clock, ending with the two examples from the drawing (08:15 and 22:39).
- **Practice quiz:** ten questions per round, with sounds, streaks and a best score.
- Everything stays in sync: change the time anywhere and the sky, table and clocks follow.

## Run it locally

You need [Node.js](https://nodejs.org/) 20 or newer. There is nothing to install.

```sh
npm run serve     # preview at http://localhost:8000 (Hebrew: /he/)
npm test          # unit tests for the clock, quiz and Hebrew page
npm run build:he  # rebuild site/he/index.html after editing site/index.html or site/strings/he.js
```

Use `npm run serve` rather than `python3 -m http.server`. The Python server doesn't tell browsers to check for new files, so after an edit a browser can mix old and new JavaScript and break the page.

## How it's built

Plain HTML, CSS and JavaScript modules with no build step. The `site/` folder is the whole website.

| Path | What it holds |
|---|---|
| `site/js/time.js` | The clock rules (pairs, parts of the day, how a time is said), used everywhere |
| `site/js/quiz-core.js` | Quiz questions, answer checking and explanations |
| `site/strings/en.js`, `site/strings/he.js` | All the text on the site, in English and Hebrew |
| `site/he/index.html` | The Hebrew page, generated from `site/index.html` by `scripts/build-he.mjs` |
| `site/js/scene.js`, `site/css/scene.css` | The animated sky scenes |
| `tests/` | Unit tests (`node --test`) |
| `documents/CONTENT.md` | The original drawing transcribed and translated, plus the content decisions |
| `PLAN.md` | The build plan, with success criteria for each step |

Every push to `main` runs the tests and deploys `site/` to GitHub Pages (`.github/workflows/pages.yml`).

## Privacy

- Visits are counted with [GoatCounter](https://www.goatcounter.com/): anonymous, with no cookies, and only on the live site.
- The learner's first name, lesson progress and best quiz score stay in their own browser and are never sent anywhere.

## Credit

Based on a hand-drawn Hebrew lesson page about the 24-hour clock, made by the project's author. The hour pairs table, the parts of the day and both examples come from that page.
