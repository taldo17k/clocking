// All user-facing English text lives here, so a Hebrew file can replace it later.
export default {
  lang: 'en',
  dir: 'ltr',
  siteName: 'Clocking',
  heroTitle: 'How to read the 24-hour clock',
  heroLead: "A day has 24 hours. Let's learn to read every one of them.",
  hoursLabel: 'hours (00–23)',
  minutesLabel: 'minutes (00–59)',
  hoursGroup: 'Hours',
  minutesGroup: 'Minutes',
  valueText: {
    hours: (hh) => `${hh} hours`,
    minutes: (mm) => `${mm} minutes`,
  },
  sentence: (words) => `It's ${words}.`,
  nowButton: 'Now',
  playButton: 'Play the day',
  stopButton: 'Stop',
  pairsTitle: 'Hour pairs',
  pairsHint: 'The two hours in each row are said the same way. Tap an hour or a picture to jump to it.',
  pairsLeft: '00–11',
  pairsRight: '12–23',
  dialTitle: 'The two-ring clock',
  dialHint: 'Drag the hands or tap a number. Both hours of a pair sit in the same spot.',
  dialLabel: 'Two-ring clock. Up and down change the hour, left and right change the minutes.',
  legendInner: 'Inner ring: 00–11',
  legendOuter: 'Outer ring: 12–23',
  stageTitle: 'The digital clock',
  stageHint: 'Change the hours and minutes with the arrows, by swiping up and down, or with the keyboard.',
  footerCredit: 'Based on a hand-drawn lesson.',
  phases: {
    night: 'Night',
    sunrise: 'Sunrise',
    morning: 'Morning',
    midday: 'Midday',
    afternoon: 'Afternoon',
    sunset: 'Sunset',
    evening: 'Evening',
  },

  // Words used to say a time aloud (see js/time.js).
  speech: {
    ones: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
      'eighteen', 'nineteen'],
    tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty'],
    oh: 'oh',            // 08:05 → "eight oh five"
    oclock: "o'clock",   // 08:00 → "eight o'clock"
    and: 'and',
    minute: 'minute',
    minutes: 'minutes',
    // How each part of the day is said at the end of a sentence.
    partPhrase: {
      night: 'at night',
      sunrise: 'in the morning',
      morning: 'in the morning',
      midday: 'at midday',
      afternoon: 'in the afternoon',
      sunset: 'in the evening',
      evening: 'in the evening',
    },
  },
};
