# Clocking: Plan for an Interactive 24-Hour Clock Teaching Site

## Goal

Turn the hand-made teaching page (`documents/24hr-clock-example.jpeg`, transcribed in `documents/CONTENT.md`) into a simple, polished, interactive website that teaches how to read the 24-hour clock. The site will:

- be in **English** for v1, with the structure ready for Hebrew (RTL) later
- be hosted on **GitHub Pages** as a static site, with no backend
- **track visitors** in a privacy-friendly way

## What the original teaches (summary of `documents/CONTENT.md`)

1. **Hour pairs:** 00=12, 01=13 … 11=23. Both hours in a pair are *said* the same way, and the rule is +12 or −12.
2. **Parts of the day:** each range of hours has its own sky scene: Night (00–05), Sunrise (06), Morning (07–11), Midday (12–14), Afternoon (15–17), Sunset (18), Evening (19–21), Night (22–23). The original groups 12–15 as midday; the English version moves 15 to the afternoon.
3. **Clock structure:** `HH:MM` means hours (00–23) : minutes (00–59).
4. **How to say it:** `08:15` → "eight fifteen in the morning", and `22:39` → "ten thirty-nine at night".

The site keeps this order and this method. Its core is a **digital `HH:MM` clock**, the **pairs table**, and a **sky scene** that changes with the hour. Underneath sits a **two-ring analog clock**: an inner ring 00–11 and an outer ring 12–23 around it, matching the two columns of the pairs table. It shows why the pairs are "the same": both hours in a pair sit at the same spot on the dial.

## Guiding Decisions

| Topic | Decision | Why |
|---|---|---|
| Stack | Plain HTML + CSS + vanilla JavaScript (ES modules), no build step | Simplest thing that works on GitHub Pages |
| Visuals | Sky scenes drawn as inline SVG/CSS in the colorful, hand-drawn spirit of the original | Sharp at any size and easy to animate between parts of the day |
| Text | All UI strings in one `strings/en.js` | Adding Hebrew later is mostly translation plus `dir="rtl"` |
| AM/PM | Part-of-day words come first, as in the original. AM/PM is shown as a small secondary hint | Stays faithful to the original while still helping English speakers |
| Analytics | **GoatCounter** (free, cookieless, no consent banner needed). Fallback: Cloudflare Web Analytics | Works with one script tag on a static site |
| Deployment | A GitHub Actions workflow deploys to Pages on every push to `main` | Repeatable, no manual steps |

---

## Step 0: Reference material and content outline ✅ done

**Tasks**
- Original image is in `documents/24hr-clock-example.jpeg`.
- Content is transcribed and translated into `documents/CONTENT.md`; the margins are ignored.
- The author has confirmed these choices: "Sunrise" (06) and "Sunset" (18), Midday 12–14 and Afternoon 15–17, AM/PM as a secondary hint, and the two-ring analog clock.

**Success criteria**
- [x] The reference image is committed and viewable in the repo.
- [x] `documents/CONTENT.md` lists every concept from the drawing, in English, in teaching order.
- [x] The author has confirmed the open interpretations.

---

## Step 1: Project skeleton and GitHub Pages deployment

**Tasks**
- Create the structure:
  ```
  site/                # the only folder published to GitHub Pages
    index.html
    css/styles.css
    js/main.js
    js/phases.js       # part-of-day hour ranges
    js/time.js         # pure functions: pair(h), partOfDay(h), spoken(h, m)
    js/clock.js        # digital HH:MM clock component
    js/dial.js         # two-ring analog clock (SVG)
    js/scene.js        # sky scene renderer
    js/lessons.js      # lesson navigation
    js/quiz.js         # practice mode
    strings/en.js      # all UI text
    assets/            # favicon, og-image
  tests/time.test.js   # not published
  .github/workflows/pages.yml
  ```
  The repo is public, but `PLAN.md` and `documents/` are not deployed to the live site.
- Add a minimal placeholder page.
- Configure the deploy workflow and enable Pages in the repo settings.

**Success criteria**
- [x] The page loads locally (`python3 -m http.server`) with no console errors.
- [x] Pushing to `main` triggers the workflow, and it finishes green.
- [x] The site is live at `https://taldo17k.github.io/clocking/`.
- [x] All asset paths are relative, so nothing 404s under the `/clocking/` sub-path.

---

## Step 2: Visual design system

**Tasks**
- Create a playful, warm look that echoes the marker drawing: rounded shapes, bold colors, and a friendly handwritten-style display font with a clean body font.
- Build one color palette for each part of the day, taken from the drawing: black, moon-yellow and stars (night); pink hills and purple (sunrise); light blue and sun (morning); bright blue and big sun (midday); orange and purple stripes (sunset); dark sky and moon (evening).
- Define CSS custom properties, and make the layout mobile-first and responsive.

**Success criteria**
- [x] All colors and sizes come from CSS variables in one place.
- [x] Looks good at 360px, 768px and 1440px widths, with no horizontal scroll.
- [x] Text contrast meets WCAG AA over every sky scene.
- [x] Lighthouse Accessibility score is 95 or higher.

---

## Step 3: Core time logic (pure functions plus tests)

**Tasks**
- `pair(h)` returns the partner hour (h±12).
- `spokenHour(h)` returns 1–12, where both 00 and 12 give "twelve".
- `partOfDay(h)` returns one of night (00–05, 22–23), sunrise (06), morning (07–11), midday (12–14), afternoon (15–17), sunset (18) or evening (19–21).
- `spoken(h, m)` returns English text, for example "eight fifteen in the morning", "two forty-five in the afternoon" or "ten thirty-nine at night".
- `addMinutes(h, m, delta)` moves the time forward or back and wraps around midnight.
- `amPm(h)` returns the 12-hour hint, for example `{ hour: 3, period: 'PM' }`.
- `spokenLong(h, m)` returns the literal phrasing from the drawing, for example "eight and fifteen minutes in the morning".
- `handAngles(h, m)` returns the hour-hand and minute-hand angles for the analog dial, plus which ring is active (inner for 00–11, outer for 12–23).

**Success criteria**
- [x] Unit tests (`node --test`) cover all 24 hours of `pair`, `spokenHour`, `partOfDay` and `handAngles`.
- [x] Boundaries are correct: 14 is midday, 15 is afternoon, 18 is sunset, and 22 is night.
- [x] Both hours in a pair produce the same hour-hand angle, for example 03 and 15.
- [x] The two examples from the drawing produce the expected sentences: `08:15` and `22:39`.
- [x] Edge cases pass: `00:00`, `06:00`, `12:00`, `18:00`, `23:59`, and minutes `00`, `05` ("oh five") and `30`.

---

## Step 4: The interactive explorer (main screen)

This is the drawing brought to life on one screen.

**Layout (revised after the author's review):** from top to bottom:
1. Title with the "Now" and "Play the day" buttons.
2. **Hour pairs board**, full width and laid out like the drawing. The 00–11 scenes (night, sunrise, morning) are on the left, the 12–23 scenes (midday, afternoon, sunset, evening, night) on the right. Each scene is bracketed to its rows, and the current scene lights up. Tapping a scene jumps to it.
3. **Two-ring clock**.
4. **Digital clock** on its animated sky, with the spoken sentence.

All the scenes are animated (`js/scene.js`, `css/scene.css`): layered hills, a sun with turning rays, a glowing moon, drifting clouds, flying birds, twinkling stars, shooting stars, evening fireflies, and a horizon glow at sunrise and sunset. The "Parts of the day" buttons were removed, because the side scenes do the same job.

**Tasks**
- **Digital clock `HH : MM`** with up and down controls (plus swipe, scroll and keyboard) for hours and for minutes. Hours are labeled "hours (00–23)" and minutes "minutes (00–59)", as in the "structure of the clock" section of the drawing.
- **Sky scene** behind or beside the clock. It changes smoothly to match the current part of the day (moon and stars, rising sun, full sun, sunset, and so on) and shows the part-of-day name.
- **Pairs table**, 00=12 … 11=23. The current hour's row lights up, and a curved arrow connects the pair, as in the original.
- **"How we say it"** line, for example "It's ten thirty-nine at night". It also shows a small AM/PM hint.
- **"Now"** button for the current time, and a **"Play the day"** button that runs through 00:00 → 23:59 so the scenes and the highlighted row change.
- **Two-ring analog clock**, placed underneath the digital clock, scene and table:
  - The **inner ring** shows 00–11, with 00 at the top (the left column of the table). The **outer ring** around it shows 12–23, with 12 at the top (the right column).
  - Hour and minute hands follow the time that is set. The active ring lights up: inner for 00–11 and outer for 12–23. The number the hour hand points to is highlighted on both rings, which shows the pair visually.
  - Dragging the hands (mouse or touch) or tapping a number on either ring sets the time. Everything above it (digital clock, scene, table, sentence) stays in sync.
  - The dial's background tint follows the current part of the day.

**Success criteria**
- [x] Changing the hour from 23 to 00 wraps correctly, and minutes 59 → 00 increase the hour.
- [x] The scene, the highlighted row and the spoken sentence always agree with the hours shown.
- [x] Works with mouse, touch and keyboard. Screen readers hear the time and the spoken sentence (`aria-live`).
- [x] "Play the day" goes through all 8 scenes in order: night → sunrise → morning → midday → afternoon → sunset → evening → night.
- [x] The analog dial and the digital clock always show the same time, whichever one was changed.
- [x] Dragging the hour hand clockwise past the top moves from 11 to 12 (onto the outer ring) and from 23 to 00 (back to the inner ring).
- [x] Tapping 15 on the outer ring and tapping 3 on the inner ring point the hand at the same spot, but produce 15:xx and 03:xx respectively.
- [x] The dial is readable at 360px width, with ring numbers at least 14px.

---

## Step 5: Guided lessons

**Tasks**
- Build four short steps that follow the order of the original page:
  1. **A day has 24 hours.** Introduce the parts of the day with the sky scenes.
  2. **Hour pairs.** Show the table and the "+12" rule; the pairs are said the same way, and 00 is said as "twelve". Then show the two-ring dial: each pair sits at the same spot, one on the inner ring and one on the outer ring.
  3. **Structure of the clock.** Explain HH:MM, hours 00–23 and minutes 00–59.
  4. **Reading a time aloud.** Walk through the two examples from the drawing step by step: `08:15` and `22:39`.
- Each step drives the explorer, setting the time and highlighting the relevant part.
- Add Next and Back navigation and a progress indicator.
- *As built:* six short cards in a floating lesson card: a day has 24 hours, hour pairs, two rings and one spot, hours : minutes, example 08:15 and example 22:39. Each card sets the clock, scrolls to its widget and gives it a golden spotlight; the examples are broken down step by step (22 → 22 − 12 = 10 → "ten").

**Success criteria**
- [x] Every concept in `documents/CONTENT.md` appears in a lesson.
- [x] Each step's text can be read in under 1 minute.
- [x] The examples from the drawing (`08:15`, `22:39`) appear exactly as in the original.
- [x] Progress is remembered in `localStorage` (with a graceful fallback if storage is blocked).

---

## Step 6: Practice and quiz mode

**Tasks**
- Question types, based on the drawing:
  - **Find the pair:** "17 is the same as …?" → 5
  - **Part of the day:** "What part of the day is 20:00?" → Evening (the scene is shown after the answer)
  - **Say it:** "How do we say 15:45?" → choose "three forty-five in the afternoon"
  - **Set the clock:** "Set the clock to ten thirty-nine at night" → 22:39, using the digital controls or the analog dial
- Give instant feedback that explains the rule, for example "22 − 12 = 10, and 22 is at night."
- Show a score and streak counter, with a small celebration on a good streak.
- *As built:* a "Practice" button opens a floating quiz card (same style as the lesson card). Each round has 10 questions: 2 pair, 2 part of day, 3 say it, 3 set the clock. Every answer shows the rule, the page jumps to the question's time, and a burst of suns and stars marks 3, 5, 8 and 10 in a row. The end screen shows the score and the best score. The logic is in `js/quiz-core.js`, with unit tests in `tests/quiz.test.js`.
- *Revised after review:* set-the-clock questions name one clock ("Set the **digital clock** to…" or "Set the **two-ring clock** to…"), and each round uses both. The named clock scrolls to the top of the screen, above the quiz card, and only it glows. Correct and wrong answers play short sounds made with the Web Audio API, and a streak adds a sparkle; a speaker button mutes them, and the setting is remembered.

**Success criteria**
- [x] Questions are randomly generated, and none repeats within a 10-question round.
- [x] Every wrong answer shows the correct answer and the rule behind it.
- [x] Every question type is checked by the functions from Step 3, so there is one source of truth.
- [x] A full round can be completed on a phone using only touch.

---

## Step 7: Visitor tracking

**Tasks**
- Create a GoatCounter site (for example, `clocking.goatcounter.com`) and add its script tag.
- Track key events: lesson completed, quiz finished, and score band.
- Optionally make the dashboard public and link it from the README.
- Add a footer note: "Anonymous, cookie-free visit counting."
- *As built:* `js/analytics.js` loads GoatCounter (`taldo17k.goatcounter.com`) only on `taldo17k.github.io`. It counts the events `lesson-finished`, `quiz-finished` and `quiz-score-<band>`. The first two criteria are checked once the site is pushed.
- *Extra:* the first time someone starts a lesson or quiz, the site asks for their first name. It can be skipped, and it can be changed later from the greeting. On each new visit, the first lesson or quiz asks "Welcome back! Are you Dana?", with "Yes, I'm Dana" or "I'm someone else"; if no name was given last time, it asks for one again. The name is used only on the page (a greeting, the lesson's first step, quiz messages), stays in that browser, and is never sent to the visitor counter. The site is always dark; the light theme is kept in the CSS but turned off with `data-theme="dark"` on `<html>`.

**Success criteria**
- [x] A visit to the live site appears on the GoatCounter dashboard within a few minutes.
- [x] Custom events appear in the dashboard.
- [x] No cookies are set (checked in DevTools → Application → Cookies).
- [x] Analytics does not run on `localhost`.
- [x] If an ad-blocker blocks analytics, the site still works normally.

---

## Step 8: Polish, SEO and sharing

**Tasks**
- Add a favicon, title, meta description, and Open Graph and Twitter card tags. The preview image can be a sky-scene collage.
- Respect `prefers-reduced-motion`: scene changes fade instead of animating.
- Update `README.md` with a description, the live link, a screenshot, how to run it locally, and credit to the original hand-made page.
- *As built:*
  - **Preview card:** `assets/og-image.jpg` (1200×630, 95 KB) is made from the real sky scenes, with Open Graph and Twitter tags and a canonical URL.
  - **Phone speed:** the slow drift of the panel backgrounds repainted every panel on every frame. It now moves the layer instead, which the graphics card handles; main-thread work fell from 2.6 s to 0.26 s per 3 s. Google Fonts no longer block the first paint.
  - **Lighthouse:** on the live site before the fix, mobile was 61/100/100/100 and desktop 97/100/100/100. Locally after the fix, mobile is 99/100/100/100. On the live site after the fix: mobile 100/100/100/100 (90 on the first cold run) and desktop 97/100/100/100.
  - **Contrast:** the worst case is the highlighted scene label at night, 5.28:1.
  - **Weight:** about 68 KB without fonts, before compression.
  - **Reduce motion:** about 540 animations normally, none with the setting on.
  - **Local preview:** `npm run serve`, which tells the browser to check for new files every time.

**Success criteria**
- [x] Sharing the link in WhatsApp or Slack shows a proper preview card.
- [x] Lighthouse scores: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [x] Total page weight is under 300 KB (excluding fonts).
- [x] Animations are reduced when the OS "reduce motion" setting is on.

---

## Step 9: Hebrew version

**Tasks**
- Add `strings/he.js` with the original wording (לילה, בוקר, צהריים, אחר הצהריים, ערב, and the example sentences).
- Serve Hebrew at its own address, `/clocking/he/`, instead of a language toggle in the page.
- Switch to `dir="rtl"`. The `HH:MM` display stays left-to-right.
- Add Hebrew spoken-time logic, which differs from English, for example "שמונה וחמש עשרה דקות".

**Success criteria**
- [x] `/clocking/he/` opens in Hebrew and right-to-left before any script runs; `/clocking/` stays English. Sharing either link shows a preview in its own language.
- [x] The RTL layout has no overlapping or misaligned elements, and the clock digits stay left-to-right.
- [x] The Hebrew lesson text matches the original page word for word for both examples.

- *As built:*
  - **The Hebrew page:** `site/he/index.html` is generated from `site/index.html` by `npm run build:he` (now `npm run build:pages`, `scripts/build-pages.mjs`). It shares the CSS, JavaScript and images through `<base href="../">`, starts with the Hebrew text already filled in, and has its own preview card (`assets/og-image-he.jpg`). A unit test fails, and so does the deploy, if it is out of date.
  - **Speaking times:** `time.js` speaks both languages (`useSpeech`). Hebrew uses feminine numbers and the page's wording: "השעה שמונה וחמש עשרה דקות בבוקר", "השעה עשר ושלושים ותשע דקות בלילה", "שמונה ודקה אחת", "שמונה ושתי דקות", "שמונה בבוקר".
  - **Layout:** midday is 12–14 in both languages. The digital clock and the hour pairs board keep the drawing's left-to-right layout, and sums and ranges are kept left-to-right inside Hebrew text. Hebrew uses the Rubik font for body text, has no AM/PM hint, and addresses learners in the plural ("לחצו").
  - **Checks:** a full Hebrew quiz round, the lesson and phone layouts are checked in the browser. Lighthouse for `/he/` (local, mobile): 98/100/100/100.

---

## Definition of Done (v1 = Steps 0–8)

- The site is live on GitHub Pages and updates automatically on every push to `main`.
- A learner can explore the digital clock and the two-ring dial, go through the four lessons and finish a quiz, on desktop or phone.
- Visits are counted anonymously and can be viewed on the analytics dashboard.

## Step 10: Chinese version (Simplified)

- [x] `/clocking/zh/` opens in Chinese before any script runs, with its own preview card (`assets/og-image-zh.jpg`).
- [x] Times follow standard Mandarin: part of the day first, 两点, 零五分, 凌晨 for 00–05. 08:15 → "现在是上午八点十五分。", 22:39 → "现在是晚上十点三十九分。"
- [x] Lesson, quiz (a full round of 10) and phone layout checked in the browser; side labels on phones read top to bottom with upright characters.

- *As built:* `scripts/build-pages.mjs` builds every translated page (`npm run build:pages`; `build:he` still works). Chinese characters use the visitor's system fonts, so no large font download. Midday is 12–14 (中午), as in the other languages.

## Step 11: Feedback from the first testers

- [x] Hours have no leading zero in text, questions and lessons (8:15, 0–11, "8 = 20"); minutes keep two digits (8:05). The digital clock itself keeps two-digit hours (08:15), like a real one.
- [x] Hour-pair answers end with how both hours are said ("8 + 12 = 20. Both are said "eight".").
- [x] The two-ring clock became a regular dial clock (1–12, 12 at the top). A switch under it picks the time of day: sun, moon, sunrise (6) or sunset (18), showing both hours, e.g. Morning 8 / Evening 20. Moving the hands keeps the chosen half.
- [x] The lesson has 8 steps: new "Reading the digital clock" and "Reading the dial clock", and two demonstrations played on the real clocks: Roni sets the digital clock to 22:35, Mika sets the dial clock to 19:30 and presses the moon.
- [x] All of it in English, Hebrew and Chinese; the three preview cards were redrawn.
- [x] Dial-clock questions give the time in numbers ("Set the dial clock to 18:45"): the learner works out the part of the day from the hour. The explanation shows where the short hand goes and which part of the day to pick. Mika's lesson step works the same way.
