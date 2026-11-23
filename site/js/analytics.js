// Visitor counting with GoatCounter (https://www.goatcounter.com):
// anonymous, no cookies. Runs only on the live site, so local testing is not counted.
// If an ad-blocker stops the script, nothing else on the page is affected.
const SITE = 'https://taldo17k.goatcounter.com/count';
const LIVE_HOST = 'taldo17k.github.io';

function count(path, title) {
  try { window.goatcounter?.count?.({ path, title, event: true }); } catch { /* blocked or not loaded */ }
}

export function initAnalytics() {
  if (location.hostname !== LIVE_HOST) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = SITE;
  document.head.append(script);

  document.addEventListener('lesson:finished', () => count('lesson-finished', 'Finished the lesson'));
  document.addEventListener('quiz:finished', (e) => {
    count('quiz-finished', 'Finished a quiz');
    count(`quiz-score-${e.detail.band}`, `Quiz score: ${e.detail.band}`);
  });
}
