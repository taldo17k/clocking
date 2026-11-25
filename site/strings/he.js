// All user-facing Hebrew text. Same keys as en.js (a test checks that).
// The two lesson examples follow the hand-made page word for word:
//   8:15 → "השעה שמונה וחמש עשרה דקות בבוקר"
//   22:39 → "השעה עשר ושלושים ותשע דקות בלילה"
// Learners are addressed in the plural ("לחצו", "גררו"), the usual gender-neutral
// form on Hebrew websites.

// Keeps sums, ranges and scores left-to-right inside right-to-left text, so
// "22 − 12 = 10" is not displayed as "10 = 12 − 22". The marks are invisible.
const ltr = (text) => `\u2066${text.replace(/–/g, '\u2060–\u2060')}\u2069`; // ranges never split across lines

export default {
  lang: 'he',
  dir: 'rtl',
  siteName: 'Clocking',
  nameTitle: 'שלום! מה השם שלך?',
  nameBody: 'נשתמש בו כדי לעודד אותך. הוא נשמר רק במכשיר הזה.',
  nameLabel: 'השם הפרטי שלך',
  namePlaceholder: 'השם הפרטי שלך',
  nameSkip: 'דילוג',
  nameGo: 'קדימה',
  nameChange: 'שינוי שם',
  nameSomeoneElse: 'מישהו אחר',
  name: {
    welcomeBack: (name) => `שוב שלום! האם כאן ${name}?`,
    welcomeBody: 'אולי מישהו אחר משתמש במכשיר, אז אנחנו בודקים לפני שמעודדים.',
    itsMe: (name) => `כן, כאן ${name}`,
    hello: (name) => `שלום ${name}! מוכנים ללמוד את שעון 24 השעות?`,
    wellDone: (name) => `כל הכבוד ${name}! סיימת את השיעור. עכשיו אפשר לנסות את התרגול.`,
    lessonHi: (name) => `שלום ${name}! `,
    inARow: (n, name) => `${n} ברצף, ${name}!`,
    end: {
      perfect: (name) => `מושלם, ${name}! שעון 24 השעות כבר לא סוד בשבילך.`,
      great: (name) => `עבודה מצוינת, ${name}! כמעט מושלם.`,
      good: (name) => `התחלה טובה, ${name}. אפשר לשחק שוב ולשפר את התוצאה.`,
      practice: (name) => `כדאי להמשיך להתאמן, ${name}. גם השיעור יכול לעזור.`,
    },
  },
  heroTitle: '24 שעות ביממה',
  heroLead: 'ביממה יש 24 שעות. בואו נלמד לקרוא כל אחת מהן.',
  hoursLabel: `שעות (${ltr('0–23')})`,
  minutesLabel: `דקות (${ltr('00–59')})`,
  hoursGroup: 'שעות',
  minutesGroup: 'דקות',
  valueText: {
    hours: (hh) => `${hh} שעות`,
    minutes: (mm) => `${mm} דקות`,
  },
  sentence: (words) => `השעה ${words}.`,
  showAmPm: false,  // Hebrew speakers don't use AM/PM
  nowButton: 'עכשיו',
  playButton: 'הריצו את היום',
  stopButton: 'עצירה',
  pairsTitle: 'שעות בזוגות',
  pairsHint: 'את שתי השעות בכל שורה אומרים אותו דבר. לחצו על שעה או על תמונה כדי לעבור אליה.',
  pairsLeft: ltr('0–11'),
  pairsRight: ltr('12–23'),
  dialTitle: 'שעון המחוגים',
  dialHint: 'הזיזו את המחוגים כמו בשעון רגיל, ואז בחרו את החלק ביום עם השמש והירח.',
  dialLabel: 'שעון מחוגים. חץ למעלה ולמטה משנה את השעה, ימינה ושמאלה את הדקות.',
  dialSwitch: 'חלק היום',
  stageTitle: 'השעון הדיגיטלי',
  stageHint: 'שנו את השעות והדקות עם החצים, בהחלקה למעלה ולמטה, או עם המקלדת.',
  footerCredit: 'מבוסס על דף לימוד שצויר ביד.',
  footerPrivacy: 'ספירת ביקורים אנונימית, בלי עוגיות.',
  footerSocial: 'רשתות חברתיות',
  quizOpen: 'חידון',
  quiz: {
    open: 'חידון',
    close: 'סגירת החידון',
    progress: (n, total) => `שאלה ${n} מתוך ${total}`,
    score: (n) => `ניקוד ${n}`,
    streak: (n) => `רצף ${n}`,
    // **bold** marks words to emphasise.
    prompts: {
      pair: (hh) => `איזו שעה אומרים כמו **${hh}**?`,
      part: (time) => `באיזה חלק של היום נמצאת השעה **${time}**?`,
      say: (time) => `איך אומרים **${time}**?`,
      setDigital: (words) => `כוונו את **השעון הדיגיטלי** ל**${words}**.`,
      setDial: (time) => `כוונו את **שעון המחוגים** ל־**${time}**.`,
    },
    setHint: {
      digital: 'השתמשו בחצים, החליקו את המספרים למעלה או למטה, או השתמשו במקלדת. אחר כך לחצו על "בדיקה".',
      dial: 'לפי השעה, הבינו באיזה חלק של היום מדובר. הזיזו את המחוגים ובחרו אותו מתחת לשעון. אחר כך לחצו על "בדיקה".',
    },
    soundOn: 'צליל פועל',
    soundOff: 'צליל כבוי',
    check: 'בדיקה',
    next: 'לשאלה הבאה',
    results: 'לתוצאה שלי',
    again: 'עוד סיבוב',
    correct: 'נכון!',
    wrong: 'לא בדיוק.',
    youSet: (time) => `כיוונת ל־${time}.`,
    inARow: (n) => `${n} ברצף!`,
    end: {
      title: 'הסיבוב הסתיים',
      best: (best, total) => `השיא: ${ltr(`${best} / ${total}`)}`,
      newBest: 'שיא חדש!',
      perfect: 'מושלם! שעון 24 השעות כבר לא סוד בשבילך.',
      great: 'עבודה מצוינת! כמעט מושלם.',
      good: 'התחלה טובה. אפשר לשחק שוב ולשפר את התוצאה.',
      practice: 'כדאי להמשיך להתאמן. גם השיעור יכול לעזור.',
    },
    explain: {
      pairUp: (hh, partner, word) => `${ltr(`${hh} + 12 = ${partner}`)}. את שתיהן אומרים "${word}".`,
      pairDown: (hh, partner, word) => `${ltr(`${hh} − 12 = ${partner}`)}. את שתיהן אומרים "${word}".`,
      part: (time, name, range) => `${time} שייכת ל${name} (${range}).`,
      minus: (hh, small, word) => `${ltr(`${hh} − 12 = ${small}`)}, ואומרים "${word}"`,
      midnight: 'את 0 אומרים "שתים עשרה"',
      same: (hh, word) => `את ${hh} אומרים "${word}"`,
      say: (hourRule, mm, minuteWords, phrase) => (minuteWords
        ? `${hourRule}; ${mm} זה "${minuteWords}"; וזה ${phrase}.`
        : `${hourRule}; ב־00 דקות לא אומרים את הדקות; וזה ${phrase}.`),
      setDial: (hh, dialHour, phase) => `${hh > 12 ? `${ltr(`${hh} − 12 = ${dialHour}`)}, לכן המחוג הקצר מצביע על ${dialHour}` : `המחוג הקצר מצביע על ${dialHour}`}. ${hh} שייכת ל${phase}, לכן בוחרים מתחת לשעון ב${phase}.`,
      plus: (small, hh) => ltr(`${small} + 12 = ${hh}`),
      set: (word, phrase, answer, plus) => (plus
        ? `"${word}" ${phrase} זה בחצי השני של היממה: ${plus}. לכן השעה ${answer}.`
        : `"${word}" ${phrase} זה בחצי הראשון של היממה, לכן השעה ${answer}.`),
    },
  },
  lesson: {
    start: 'להתחיל את השיעור',
    continue: (n, total) => `להמשיך את השיעור (${ltr(`${n}/${total}`)})`,
    replay: 'לעבור שוב על השיעור',
    progress: (n, total) => `שלב ${n} מתוך ${total}`,
    back: 'הקודם',
    next: 'הבא',
    finish: 'סיום',
    close: 'סגירת השיעור',
    // **bold** marks words to emphasise.
    steps: {
      day: {
        title: 'ביממה יש 24 שעות',
        body: 'מחצות עד חצות השעון סופר **24 שעות**, מ־**0** עד **23**. לכל חלק של היום יש שמיים משלו: לילה, זריחה, בוקר, צהריים, אחר הצהריים, שקיעה וערב. הסתכלו איך התמונות נדלקות כשהשעות עוברות.',
      },
      pairs: {
        title: 'זוגות שעות',
        body: 'לכל שעה מ־**0 עד 11** יש שעה זוג **12 שעות אחריה**: 3 ו־15, 8 ו־20, 10 ו־22. כדי למצוא את בת הזוג **מוסיפים 12** או **מורידים 12**. את שתי השעות בזוג **אומרים אותו דבר**: את 15 אומרים "שלוש" ואת 22 אומרים "עשר". את 0 ואת 12 אומרים "שתים עשרה".',
      },
      digital: {
        title: 'קוראים את השעון הדיגיטלי',
        body: 'השעון הדיגיטלי מראה את השעה במספרים. לפני הנקודתיים נמצאות **השעות**, מ־0 עד 23. אחרי הנקודתיים נמצאות **הדקות**, מ־00 עד 59. כך **14:35** פירושו 14 שעות ו־35 דקות.',
      },
      dial: {
        title: 'קוראים את שעון המחוגים',
        body: 'בשעון המחוגים יש שני מחוגים. **המחוג הקצר** מראה את השעה ו**המחוג הארוך** מראה את הדקות. המספרים הולכים מ־1 עד 12, ו**12 נמצא למעלה**, ולכן כל מספר מייצג **שתי שעות**: 8 הוא 8 בבוקר וגם 20 בערב. **השמש והירח** שמתחת לשעון מראים איזו מהן.',
      },
      example1: {
        title: 'דוגמה 1: 8:15',
        body: 'בואו נקרא את **8:15** חלק אחרי חלק:',
      },
      example2: {
        title: 'דוגמה 2: 22:39',
        body: 'בואו נקרא את **22:39**. השעה **22** גדולה מ־12, ולכן קודם **מורידים 12** כדי למצוא את בת הזוג שלה, ואז קוראים אותה אותו דבר:',
      },
      roni: {
        title: 'התור של רוני: השעון הדיגיטלי',
        body: `המשימה של רוני: לכוון את **השעון הדיגיטלי** ל**עשר ושלושים וחמש דקות בלילה**. "עשר" בלילה זה בחצי השני של היממה: ${ltr('10 + 12 = 22')}. לכן מכוונים את השעות ל־**22** ואת הדקות ל־**35**: **22:35**.`,
      },
      mika: {
        title: 'התור של מיקה: שעון המחוגים',
        body: `המשימה של מיקה: לכוון את **שעון המחוגים** ל־**19:30**. ${ltr('19 − 12 = 7')}, לכן מזיזים את **המחוג הקצר** ל־**7** ואת **המחוג הארוך** ל־**6** (זה 30 דקות). 19 היא שעה של **ערב**, לכן בוחרים ב**ירח**.`,
      },
    },
    breakdown: {
      pair: (hh, partner) => ltr(`${hh} − 12 = ${partner}`),
      midnight: 'את 0 אומרים כמו 12',
      noMinutes: 'בלי דקות',
      arrow: '←',
    },
  },
  phases: {
    night: 'לילה',
    sunrise: 'זריחה',
    morning: 'בוקר',
    midday: 'צהריים',
    afternoon: 'אחר הצהריים',
    sunset: 'שקיעה',
    evening: 'ערב',
  },

  // Words used to say a time aloud (see js/time.js). Hours and minutes are
  // feminine in Hebrew (שעה, דקה), so the feminine number forms are used.
  speech: {
    lang: 'he',
    ones: ['אפס', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע',
      'עשר', 'אחת עשרה', 'שתים עשרה', 'שלוש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה',
      'שמונה עשרה', 'תשע עשרה'],
    tens: ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים'],
    two: 'שתי',          // before a noun: "שתי דקות"
    minute: 'דקה',
    minutes: 'דקות',
    // How each part of the day is said at the end of a sentence.
    partPhrase: {
      night: 'בלילה',
      sunrise: 'בבוקר',
      morning: 'בבוקר',
      midday: 'בצהריים',
      afternoon: 'אחר הצהריים',
      sunset: 'בערב',
      evening: 'בערב',
    },
  },
};
