// The one current time shown everywhere on the page. Every component reads it
// through subscribe() and changes it through setTime()/shiftTime(), so the
// digital clock, sky, pairs table, sentence and dial always agree.
import { addMinutes } from './time.js';

// Starts on the visitor's current time (the lesson still uses 08:15 and 22:39).
const now = new Date();
let current = { h: now.getHours(), m: now.getMinutes() };
const listeners = new Set();

export const getTime = () => ({ ...current });

/** `source` says who changed the time ('digital', 'dial', 'pairs', 'play', …). */
export function setTime(h, m, source = 'unknown') {
  if (h === current.h && m === current.m) return;
  current = { h, m };
  listeners.forEach((fn) => fn(getTime(), source));
}

export function shiftTime(deltaMinutes, source) {
  const t = addMinutes(current.h, current.m, deltaMinutes);
  setTime(t.h, t.m, source);
}

/** Calls fn right away with the current time, then on every change. */
export function subscribe(fn) {
  listeners.add(fn);
  fn(getTime(), 'init');
  return () => listeners.delete(fn);
}
