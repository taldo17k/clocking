// All user-facing Chinese text (Simplified). Same keys as en.js (a test checks that).
// Times are said the usual way: part of the day first, then the hour and minutes:
//   8:15 → "上午八点十五分"    22:39 → "晚上十点三十九分"
// 2 o'clock is 两点, minutes under ten get a 零 (八点零五分), and the small
// hours (0–5) are 凌晨.

export default {
  lang: 'zh-CN',
  dir: 'ltr',
  siteName: 'Clocking',
  nameTitle: '你好！你叫什么名字？',
  nameBody: '我们会用它来为你加油。名字只保存在这台设备上。',
  nameLabel: '你的名字',
  namePlaceholder: '你的名字',
  nameSkip: '跳过',
  nameGo: '开始吧',
  nameChange: '修改名字',
  nameSomeoneElse: '我是别人',
  name: {
    welcomeBack: (name) => `欢迎回来！你是${name}吗？`,
    welcomeBody: '这台设备可能有别人在用，所以加油之前我们先问一下。',
    itsMe: (name) => `是的，我是${name}`,
    hello: (name) => `${name}，你好！准备好学习24小时制时钟了吗？`,
    wellDone: (name) => `${name}，真棒！你完成了课程。接下来试试练习吧。`,
    lessonHi: (name) => `${name}，你好！`,
    inARow: (n, name) => `${name}，连对${n}题！`,
    end: {
      perfect: (name) => `${name}，满分！你已经是24小时制时钟高手了。`,
      great: (name) => `${name}，做得很好！差一点就满分了。`,
      good: (name) => `${name}，开头不错。再玩一次，刷新你的成绩吧。`,
      practice: (name) => `${name}，继续练习吧。课程也能帮到你。`,
    },
  },
  heroTitle: '24小时制时钟',
  heroLead: '一天有24个小时。我们一起来学会读每一个钟点吧。',
  hoursLabel: '小时（0–23）',
  minutesLabel: '分钟（00–59）',
  hoursGroup: '小时',
  minutesGroup: '分钟',
  valueText: {
    hours: (hh) => `${hh}点`,
    minutes: (mm) => `${mm}分`,
  },
  sentence: (words) => `现在是${words}。`,
  showAmPm: false,  // 上午/下午 is already part of the sentence
  nowButton: '现在',
  playButton: '播放一天',
  stopButton: '停止',
  pairsTitle: '成对的钟点',
  pairsHint: '每一行的两个钟点读法相同。点一下钟点或图片就能跳过去。',
  pairsLeft: '0–11',
  pairsRight: '12–23',
  dialTitle: '指针时钟',
  dialHint: '像普通时钟一样拨动指针，再用太阳和月亮选择一天中的时段。',
  dialLabel: '指针时钟。上下键改变小时，左右键改变分钟。',
  dialSwitch: '一天中的时段',
  stageTitle: '数字时钟',
  stageHint: '用箭头、上下滑动或键盘来改变小时和分钟。',
  footerCredit: '根据一张手绘的课程页面制作。',
  footerPrivacy: '匿名统计访问量，不使用 Cookie。',
  footerSocial: '关注作者',
  quizOpen: '练习',
  quiz: {
    open: '练习',
    close: '关闭练习',
    progress: (n, total) => `第 ${n} 题，共 ${total} 题`,
    score: (n) => `得分 ${n}`,
    streak: (n) => `连对 ${n}`,
    // **bold** marks words to emphasise.
    prompts: {
      pair: (hh) => `哪个钟点和 **${hh}** 的读法相同？`,
      part: (time) => `**${time}** 属于一天中的哪个时段？`,
      say: (time) => `**${time}** 怎么读？`,
      setDigital: (words) => `把**数字时钟**调到**${words}**。`,
      setDial: (time) => `把**指针时钟**调到 **${time}**。`,
    },
    setHint: {
      digital: '用箭头、上下滑动数字或用键盘来调整，然后点“检查”。',
      dial: '先根据小时判断是一天中的哪个时段，再拨动指针，并在时钟下面选好时段，然后点“检查”。',
    },
    soundOn: '声音开',
    soundOff: '声音关',
    check: '检查',
    next: '下一题',
    results: '看我的成绩',
    again: '再玩一次',
    correct: '答对了！',
    wrong: '不太对。',
    youSet: (time) => `你调到了 ${time}。`,
    inARow: (n) => `连对${n}题！`,
    end: {
      title: '本轮结束',
      best: (best, total) => `最高分：${best} / ${total}`,
      newBest: '新纪录！',
      perfect: '满分！你已经是24小时制时钟高手了。',
      great: '做得很好！差一点就满分了。',
      good: '开头不错。再玩一次，刷新你的成绩吧。',
      practice: '继续练习吧。课程也能帮到你。',
    },
    explain: {
      pairUp: (hh, partner, word) => `${hh} + 12 = ${partner}。两个钟点都读“${word}点”。`,
      pairDown: (hh, partner, word) => `${hh} − 12 = ${partner}。两个钟点都读“${word}点”。`,
      part: (time, name, range) => `${time} 属于${name}（${range}）。`,
      minus: (hh, small, word) => `${hh} − 12 = ${small}，读作“${word}点”`,
      midnight: '0 读作“十二点”',
      same: (hh, word) => `${hh} 读作“${word}点”`,
      say: (hourRule, mm, minuteWords, phrase) => (minuteWords
        ? `${hourRule}；${mm} 读作“${minuteWords}”；这个时段前面加“${phrase}”。`
        : `${hourRule}；00 分不用读出来；这个时段前面加“${phrase}”。`),
      setDial: (hh, dialHour, phase) => `${hh > 12 ? `${hh} − 12 = ${dialHour}，所以短针指向 ${dialHour}` : `短针指向 ${dialHour}`}。${hh} 点属于${phase}，所以在时钟下面选“${phase}”。`,
      plus: (small, hh) => `${small} + 12 = ${hh}`,
      set: (word, phrase, answer, plus) => (plus
        ? `“${phrase}${word}点”在一天的后半段：${plus}。所以是 ${answer}。`
        : `“${phrase}${word}点”在一天的前半段，所以是 ${answer}。`),
    },
  },
  lesson: {
    start: '开始课程',
    continue: (n, total) => `继续课程（${n}/${total}）`,
    replay: '再学一遍',
    progress: (n, total) => `第 ${n} 课，共 ${total} 课`,
    back: '上一步',
    next: '下一步',
    finish: '完成',
    close: '关闭课程',
    // **bold** marks words to emphasise.
    steps: {
      day: {
        title: '一天有24个小时',
        body: '从午夜到下一个午夜，时钟一共数 **24 个小时**，从 **0** 到 **23**。一天中的每个时段都有自己的天空：夜晚、日出、上午、中午、下午、日落和晚上。看着钟点一个个过去，图片也会跟着亮起来。',
      },
      pairs: {
        title: '成对的钟点',
        body: '**0 到 11** 的每个钟点都有一个**晚 12 小时**的搭档：3 和 15，8 和 20，10 和 22。要找到搭档，就**加 12** 或**减 12**。同一对的两个钟点**读法相同**：15 读“三点”，22 读“十点”。0 和 12 都读“十二点”。',
      },
      digital: {
        title: '读数字时钟',
        body: '数字时钟用数字显示时间。冒号前面是**小时**，从 0 到 23。冒号后面是**分钟**，从 00 到 59。所以 **14:35** 就是 14 点 35 分。',
      },
      dial: {
        title: '读指针时钟',
        body: '指针时钟有两根指针。**短针**指小时，**长针**指分钟。数字从 1 到 12，**12 在最上面**，所以每个数字代表**两个钟点**：8 可以是上午 8 点，也可以是晚上 20 点。时钟下面的**太阳和月亮**告诉你是哪一个。',
      },
      example1: {
        title: '例 1：8:15',
        body: '我们一部分一部分地来读 **8:15**：',
      },
      example2: {
        title: '例 2：22:39',
        body: '我们来读 **22:39**。**22** 比 12 大，所以先**减 12** 找到它的搭档，再用同样的方法来读：',
      },
      roni: {
        title: '罗尼来调数字时钟',
        body: '**罗尼**要把**数字时钟**调到**晚上十点三十五分**。晚上的“十点”在一天的后半段：10 + 12 = 22。所以罗尼把小时调到 **22**，分钟调到 **35**：**22:35**。',
      },
      mika: {
        title: '米卡来调指针时钟',
        body: '**米卡**要把**指针时钟**调到 **19:30**。19 − 12 = 7，所以米卡把**短针**拨到 **7**，**长针**拨到 **6**（就是 30 分）。19 点是**晚上**，所以再点一下**月亮**。',
      },
    },
    breakdown: {
      pair: (hh, partner) => `${hh} − 12 = ${partner}`,
      midnight: '0 和 12 读法相同',
      noMinutes: '整点',
      arrow: '→',
    },
  },
  phases: {
    night: '夜晚',
    sunrise: '日出',
    morning: '上午',
    midday: '中午',
    afternoon: '下午',
    sunset: '日落',
    evening: '晚上',
  },

  // Words used to say a time aloud (see js/time.js).
  speech: {
    lang: 'zh',
    ones: ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
    ten: '十',
    hours: { 2: '两' },  // 2 o'clock is 两点 (but 2 minutes is 零二分)
    hourUnit: '点',
    minuteUnit: '分',
    earlyNight: '凌晨',  // 0–5
    // Said at the start of the sentence, before the hour.
    partPhrase: {
      night: '晚上',      // 22–23 (0–5 is 凌晨)
      sunrise: '早上',
      morning: '上午',
      midday: '中午',
      afternoon: '下午',
      sunset: '傍晚',
      evening: '晚上',
    },
  },
};
