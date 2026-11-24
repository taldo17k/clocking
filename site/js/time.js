// Core 24-hour clock logic. Pure functions, no DOM: used by the explorer,
// the lessons, the quiz and the tests, so there is one source of truth.
import en from '../strings/en.js';
import { PHASES } from './phases.js';

const HOURS_IN_DAY = 24;
const MINUTES_IN_DAY = HOURS_IN_DAY * 60;

function checkHour(h) {
  if (!Number.isInteger(h) || h < 0 || h > 23) throw new RangeError(`hour must be an integer 0–23, got ${h}`);
}
function checkMinute(m) {
  if (!Number.isInteger(m) || m < 0 || m > 59) throw new RangeError(`minute must be an integer 0–59, got ${m}`);
}

/** Two-digit text, e.g. 8 → "08". */
export const pad = (n) => String(n).padStart(2, '0');

/** "HH:MM", e.g. (8, 15) → "08:15". */
export function format(h, m) {
  checkHour(h); checkMinute(m);
  return `${pad(h)}:${pad(m)}`;
}

/** The partner hour from the pairs table: 00↔12, 01↔13 … 11↔23. */
export function pair(h) {
  checkHour(h);
  return (h + 12) % HOURS_IN_DAY;
}

/** The hour as it is said aloud (1–12). Both 00 and 12 are said "twelve". */
export function spokenHour(h) {
  checkHour(h);
  return h % 12 || 12;
}

/** Part of the day for an hour: 'night' | 'sunrise' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'evening'. */
export function partOfDay(h) {
  checkHour(h);
  return PHASES.find((p) => h >= p.from && h <= p.to).id;
}

/** 12-hour hint: 00 → 12 AM, 12 → 12 PM, 15 → 3 PM. */
export function amPm(h) {
  checkHour(h);
  return { hour: spokenHour(h), period: h < 12 ? 'AM' : 'PM' };
}

/** Move the time by `delta` minutes (may be negative), wrapping around midnight. */
export function addMinutes(h, m, delta) {
  checkHour(h); checkMinute(m);
  if (!Number.isInteger(delta)) throw new RangeError(`delta must be an integer, got ${delta}`);
  const total = (((h * 60 + m + delta) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  return { h: Math.floor(total / 60), m: total % 60 };
}

/**
 * Angles for the two-ring analog dial, in degrees clockwise from the top.
 * The inner ring holds 00–11 (left column of the pairs table) and the outer
 * ring holds 12–23 (right column), so both hours of a pair share one angle.
 */
export function handAngles(h, m) {
  checkHour(h); checkMinute(m);
  return {
    hour: ((h % 12) + m / 60) * 30,
    minute: m * 6,
    ring: h < 12 ? 'inner' : 'outer',
  };
}


// --- Saying the time aloud ------------------------------------------------
// English and Hebrew follow different rules; the language is picked by the
// `lang` of the speech words. The page calls useSpeech() once at start-up.

let currentSpeech = en.speech;
/** Choose the language used by default (strings.speech from en.js or he.js). */
export function useSpeech(words) { currentSpeech = words; }

/**
 * A range such as "07–11". On the Hebrew page it is wrapped in invisible
 * left-to-right isolate marks (U+2066 … U+2069), so right-to-left text doesn't
 * flip it into "11–07" or split it across two lines.
 */
export function formatRange(from, to) {
  if (from === to) return pad(from);
  if (currentSpeech.lang !== 'he') return `${pad(from)}–${pad(to)}`;
  // Word joiners (U+2060) also stop the line from breaking inside the range.
  return `\u2066${pad(from)}\u2060–\u2060${pad(to)}\u2069`;
}

/** A number 0–59 in words, e.g. 39 → "thirty-nine" / "שלושים ותשע". */
export function numberWords(n, words = currentSpeech) {
  if (!Number.isInteger(n) || n < 0 || n > 59) throw new RangeError(`number must be an integer 0–59, got ${n}`);
  if (n < 20) return words.ones[n];
  const tens = words.tens[Math.floor(n / 10)];
  if (!(n % 10)) return tens;
  return words.lang === 'he' ? `${tens} ו${words.ones[n % 10]}` : `${tens}-${words.ones[n % 10]}`;
}

/** How the minutes are said on their own, e.g. 15 → "fifteen" / "חמש עשרה דקות". 0 → "o'clock" / "". */
export function minuteWords(m, words = currentSpeech) {
  checkMinute(m);
  if (words.lang === 'he') {
    if (m === 0) return '';
    if (m === 1) return `${words.minute} ${words.ones[1]}`;      // דקה אחת
    if (m === 2) return `${words.two} ${words.minutes}`;          // שתי דקות
    return `${numberWords(m, words)} ${words.minutes}`;
  }
  return m === 0 ? words.oclock : numberWords(m, words);
}

/**
 * Say a time, naming the hour as `hourNumber` (normally spokenHour(h)).
 * English: 08:15 → "eight fifteen in the morning", 08:05 → "eight oh five in the morning",
 * 08:00 → "eight o'clock in the morning".
 * Hebrew (as on the hand-made page): 08:15 → "שמונה וחמש עשרה דקות בבוקר",
 * 22:39 → "עשר ושלושים ותשע דקות בלילה", 08:00 → "שמונה בבוקר".
 */
export function spokenAs(hourNumber, h, m, words = currentSpeech) {
  checkHour(h); checkMinute(m);
  const hour = numberWords(hourNumber, words);
  const part = words.partPhrase[partOfDay(h)];
  if (words.lang === 'he') return m === 0 ? `${hour} ${part}` : `${hour} ו${minuteWords(m, words)} ${part}`;
  let minutes;
  if (m === 0) minutes = words.oclock;
  else if (m < 10) minutes = `${words.oh} ${numberWords(m, words)}`;
  else minutes = numberWords(m, words);
  return `${hour} ${minutes} ${part}`;
}

/** The natural way to say a time, e.g. 22:39 → "ten thirty-nine at night" / "עשר ושלושים ותשע דקות בלילה". */
export function spoken(h, m, words = currentSpeech) {
  checkHour(h);
  return spokenAs(spokenHour(h), h, m, words);
}

/**
 * The literal phrasing from the hand-made page:
 * 08:15 → "eight and fifteen minutes in the morning",
 * 22:39 → "ten and thirty-nine minutes at night".
 */
export function spokenLong(h, m, words = en.speech) {
  checkHour(h); checkMinute(m);
  const hour = numberWords(spokenHour(h), words);
  const part = words.partPhrase[partOfDay(h)];
  if (m === 0) return `${hour} ${words.oclock} ${part}`;
  const unit = m === 1 ? words.minute : words.minutes;
  return `${hour} ${words.and} ${numberWords(m, words)} ${unit} ${part}`;
}
