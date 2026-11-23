// The 12-week study plan.
// Written as a teacher's programme for a B2 learner who rebuilds grammar from the
// ground up while keeping vocabulary, reading and listening at B2+.
// Realistic goal: a strong B2+ in 12 weeks (C1 is the next step).
//
// The plan is a sequence of positions, not calendar dates:
//   position 0      = starting test
//   positions 1..84 = 12 weeks x 7 days (days 1-6 lessons, day 7 review)
//   position 28, 56 = checkpoint tests, position 84 = final test
// The app moves to the next position only when the day's main task is done,
// so a missed day never skips a lesson.

const PLAN = [
  {
    title: 'Foundations', level: 'A1 + B2 skills', theme: 'Daily life & routines',
    lessons: [
      'Parts of speech & word order (Subject-Verb-Object)',
      'to be & there is / there are',
      'Nouns: countable vs uncountable, plural spelling',
      'Articles: a / an / the / no article',
      'Collocations: words that go together (make a decision, heavy rain)',
      'Word formation: prefixes & suffixes (rely → reliable → reliability)',
    ],
  },
  {
    title: 'Present tenses', level: 'A1-A2', theme: 'Work & career',
    lessons: [
      'Present simple: form & spelling of -s / -es',
      'Present simple: questions & negatives (do / does)',
      'Adverbs of frequency & word order',
      'Present continuous: form & use',
      'Present simple vs present continuous',
      'Stative verbs (know, want, believe, own...)',
    ],
  },
  {
    title: 'Talking about the past', level: 'A2', theme: 'Travel & places',
    lessons: [
      'Past simple: regular verbs & pronouncing -ed',
      'Past simple: the 50 most common irregular verbs',
      'Past simple: questions & negatives (did)',
      'Past continuous',
      'Past simple vs past continuous (when / while)',
      'used to / would / be used to / get used to',
    ],
  },
  {
    title: 'Present perfect', level: 'B1', theme: 'Technology & the internet',
    lessons: [
      'Present perfect: form & life experiences (ever / never)',
      'Present perfect with just / already / yet',
      'for / since / how long',
      'Present perfect vs past simple',
      'Present perfect continuous',
      'Present perfect simple vs continuous',
    ],
  },
  {
    title: 'Narratives & the future', level: 'B1', theme: 'Health & lifestyle',
    lessons: [
      'Past perfect simple',
      'Past perfect continuous & narrative tenses',
      'Future: will vs going to',
      'Present continuous & present simple for the future',
      'Future continuous & future perfect',
      'Time clauses (when, as soon as, until + present)',
    ],
  },
  {
    title: 'Modal verbs', level: 'B1-B2', theme: 'Education & learning',
    lessons: [
      'Ability: can, could, be able to',
      'Permission & requests: can, could, may',
      'Obligation: must, have to, need to - mustn\'t vs don\'t have to',
      'Advice: should, ought to, had better',
      'Deduction in the present: must, might, can\'t',
      'Past modals: should have, must have, could have',
    ],
  },
  {
    title: 'Conditionals', level: 'B1-B2', theme: 'Money & business',
    lessons: [
      'Zero & first conditional',
      'Second conditional',
      'Third conditional',
      'Mixed conditionals',
      'unless, as long as, provided that, in case',
      'wish / if only / I\'d rather',
    ],
  },
  {
    title: 'The passive', level: 'B2', theme: 'Environment & nature',
    lessons: [
      'Passive: present simple & past simple',
      'Passive: all tenses & with modals',
      'Passive with "by" - when (and when not) to use it',
      'It is said that... / He is believed to...',
      'Causative: have / get something done',
      'Active vs passive in formal writing',
    ],
  },
  {
    title: 'Reported speech', level: 'B2', theme: 'Media & news',
    lessons: [
      'Reported statements & tense backshift',
      'Reported questions',
      'Reported commands & requests',
      'Reporting verbs (suggest, deny, admit, warn...)',
      'Time & place changes (tomorrow → the next day)',
      'Indirect questions (Could you tell me where...?)',
    ],
  },
  {
    title: 'Clauses & verb patterns', level: 'B2', theme: 'Society & relationships',
    lessons: [
      'Defining relative clauses (who, which, that, whose)',
      'Non-defining relative clauses',
      'Gerunds after verbs & prepositions',
      'Infinitives after verbs & adjectives',
      'Gerund or infinitive? (stop, remember, try, forget)',
      'Participle clauses',
    ],
  },
  {
    title: 'The glue of English', level: 'B2', theme: 'Emotions & personality',
    lessons: [
      'Quantifiers: some, any, much, many, a few, a little',
      'Comparatives & superlatives (much / far / the... the...)',
      'Prepositions of time & place (in, on, at)',
      'Phrasal verbs: separable vs inseparable',
      'Linking words: although, despite, however, whereas',
      'Question tags & So do I / Neither do I',
    ],
  },
  {
    title: 'Advanced polish', level: 'B2-C1', theme: 'Academic words & idioms',
    lessons: [
      'Inversion (Never have I..., Not only... but also)',
      'Cleft sentences (What I need is..., It was... that)',
      'Emphasis: do / does, so / such',
      'Articles: advanced uses & zero article',
      'Formal vs informal register',
      'Final mock test & self-assessment',
    ],
  },
];

const PODCASTS = [
  { name: '6 Minute English (BBC)', url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english', why: 'Short and clear, with transcript. A good warm-up, B1-B2.' },
  { name: 'The English We Speak (BBC)', url: 'https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak', why: 'One idiom or expression in 3 minutes.' },
  { name: 'All Ears English', url: 'https://www.allearsenglish.com/', why: 'Natural American conversation, B2+.' },
  { name: "Luke's English Podcast", url: 'https://teacherluke.co.uk/', why: 'British teacher, long episodes, great for listening stamina.' },
  { name: 'TED Talks Daily', url: 'https://www.ted.com/podcasts/ted-talks-daily', why: 'Real native speed on interesting topics.' },
];

// Listening gets harder over the 12 weeks: easier podcasts first, native-speed ones later.
const PODCAST_BY_PHASE = [[0, 1, 2], [2, 3, 1], [3, 4, 2]];

// How the daily output task is done (one format per lesson day).
const OUTPUT_FORMATS = [
  { cat: 'Writing', how: 'Write 5-8 sentences', steps: ["Write 5-8 sentences answering the question.", "Use today's grammar point at least 5 times and underline it.", "Use 3 of today's new words.", "Read it aloud once when you finish."] },
  { cat: 'Speaking', how: 'Shadow + speak 2 minutes', steps: ["Shadowing (5 min): play 1 minute of today's podcast and repeat right after the speaker, copying rhythm and intonation.", "Then answer the question out loud for 2 minutes without stopping.", "Try to use today's grammar point."] },
  { cat: 'Writing', how: 'Write an 80-word paragraph', steps: ["Write one paragraph of about 80 words answering the question.", "Use today's grammar point and 3 new words from this week.", "Check: capital letters, -s endings, articles, verb tenses."] },
  { cat: 'Speaking', how: 'Record yourself 2 minutes', steps: ["Record a 2-minute voice note on your phone answering the question.", "Listen back and write down 2 mistakes or hesitations.", "Record it a second time, better."] },
  { cat: 'Writing', how: 'Write a short email', steps: ["Write a short email (60-100 words) to a friend or colleague about the question.", "Start with a greeting and end with a closing line.", "Use today's grammar point at least 3 times.", "Once a week, get one of your texts corrected (a teacher, a native friend, or an AI tool) and note your mistakes."] },
  { cat: 'Speaking', how: 'Teach it out loud', steps: ["Explain today's grammar rule out loud as if you were the teacher (2 min).", "Give 3 examples of your own.", "Then answer the question out loud for 1-2 minutes.", "Once a week, try to speak with a real person (language exchange, friend, colleague)."] },
];

const TOTAL_DAYS = PLAN.length * 7; // 84
const TEST_AT = { 0: 'diag', 28: 'cp1', 56: 'cp2', 84: 'final' };
const REVIEW_GAPS = [1, 3, 7, 21]; // spaced repetition: revisit after 1, 3, 7 and 21 days

// Map a position (0, 1..84, then cycling for a second round) to its place in the plan.
function normPos(p) { return p <= 0 ? 0 : ((p - 1) % TOTAL_DAYS) + 1; }
function lessonAt(p) {
  if (p < 1) return null;
  const d = (normPos(p) - 1);
  return d % 7 === 6 ? null : { w: Math.floor(d / 7), l: d % 7 };
}
function testQuestions(id) {
  const t = TESTS[id];
  return t.weeks.flatMap((w) => t.lessons.map((l) => ({ w, l, q: QUIZ[w][l] })));
}

const vocabReviewTask = (min) => ({
  id: 'vocab', cat: 'Vocabulary', min, text: 'Review the words that are due today',
  detail: { title: 'Vocabulary review', sections: [
    { h: 'Due today', due: true },
    { h: 'How it works', list: ['Each word comes back after 1, 3, 7 and 21 days.', 'Answer honestly: "I knew it" moves the word to the next step, "I didn\'t know" sends it back to tomorrow.', 'After 4 correct reviews the word is marked as known.'] },
  ] },
});

// Build the task list (with full details) for a plan position.
function tasksForDay(pos) {
  const p = normPos(pos);
  const testId = TEST_AT[p];

  // ---- test days ----
  if (testId) {
    const t = TESTS[testId];
    const n = testQuestions(testId).length;
    const weekIdx = p === 0 ? 0 : Math.floor((p - 1) / 7);
    const tasks = [
      { id: 'test', cat: 'Test', min: t.min, text: `${t.name}: ${n} questions`,
        detail: { title: t.name, sections: [
          { h: 'About this test', text: t.intro },
          { h: 'Your result', test: testId },
        ] } },
    ];
    if (p === 0) {
      tasks.push({ id: 'setup', cat: 'Setup', min: 5, text: 'Read "My plan" and set your reminder times',
        detail: { title: 'Set up your journey', sections: [
          { h: 'What to do', list: ['Open "My plan" in the sidebar and read the daily routine.', 'Open "Reminders & settings": choose reminder times that fit your day.', 'Tick "Start English Journey when Windows starts" so you never forget.'] },
        ] } });
    } else {
      tasks.push(vocabReviewTask(10));
    }
    return { pos: p, kind: 'test', testId, weekIdx, week: PLAN[weekIdx], title: t.name, tasks };
  }

  const d = p - 1;
  const weekIdx = Math.floor(d / 7);
  const dayInWeek = d % 7;
  const week = PLAN[weekIdx];
  const phase = Math.min(2, Math.floor(weekIdx / 4));
  const podcast = PODCASTS[PODCAST_BY_PHASE[phase][d % 3]];
  const listen = {
    h: 'How to listen (15 min)',
    list: [
      'Listen once WITHOUT the transcript: what is the main idea?',
      "Listen again WITH the transcript (if there is one). Pause on every phrase you don't know.",
      'Save 1-2 new expressions in the Vocabulary tab with your own example.',
      'Log the episode in the Podcasts tab - the task ticks itself.',
    ],
  };

  // ---- day 7: light review day ----
  if (dayInWeek === 6) {
    return {
      pos: p, kind: 'review', weekIdx, dayInWeek, week, title: `Week ${weekIdx + 1} review`,
      tasks: [
        { id: 'grammar', cat: 'Grammar', min: 15, text: `Light review: the 6 lessons of week ${weekIdx + 1} (${week.title})`,
          detail: { title: `Week ${weekIdx + 1} grammar review`, sections: [
            { h: 'What to do (15 min)', list: ['Go through the common mistake of each lesson below and say the correct sentence out loud.', 'Revise your starred lessons (Grammar tab).', 'Write ONE short paragraph that uses at least 3 of the grammar points.'] },
            { h: 'This week\'s lessons - say the correct version', reviews: week.lessons.map((_, l) => reviewItem(weekIdx, l)) },
          ] } },
        vocabReviewTask(10),
        { id: 'output', cat: 'Fun', min: 25, text: 'Fun day: watch one episode of a series in English with English subtitles',
          detail: { title: 'Fun day: a series in English', sections: [
            { h: 'What to do', list: ['Watch one episode (20-40 min) of a series you like, in English with ENGLISH subtitles (not Arabic or French).', 'Pause on 3 sentences you like and repeat them out loud.', 'Save 2 expressions in Vocabulary.'] },
            { h: 'Good series for B2', list: ['Friends / Modern Family - everyday conversation', 'The Office - work vocabulary', 'Sherlock / The Crown - British English', 'Suits - business and formal English'] },
          ] } },
      ],
    };
  }

  // ---- lesson days ----
  const [rule, examples, wrong, right, practice] = GRAMMAR[weekIdx][dayInWeek];
  const words = WORDS[weekIdx].slice(dayInWeek * 10, dayInWeek * 10 + 10);
  const topic = TOPICS[weekIdx][dayInWeek];
  const out = OUTPUT_FORMATS[dayInWeek];
  const lesson = week.lessons[dayInWeek];
  const pv = PHRASAL[weekIdx][dayInWeek];
  const reading = READING[d % READING.length];

  // Spaced grammar review: lessons from 1, 3, 7 and 21 days ago.
  const reviews = REVIEW_GAPS.map((g) => p - g).map(lessonAt).filter(Boolean)
    .filter((x, i, a) => a.findIndex((y) => y.w === x.w && y.l === x.l) === i)
    .map((x) => reviewItem(x.w, x.l));

  const grammarSections = [
    { h: 'The rule', text: rule },
    { h: 'Examples', list: examples },
    { h: 'Common mistake', mistake: [wrong, right] },
    { h: 'Your exercise', text: practice },
  ];
  if (reviews.length) grammarSections.push({ h: 'Quick review (5 min) - correct each sentence, then check', reviews });
  grammarSections.push({ h: 'Study steps (25 min)', list: [
    'Read the rule and the examples (5 min). For more, find the same topic in English Grammar in Use (Murphy) or on British Council LearnEnglish.',
    reviews.length ? 'Do the quick review above (5 min).' : 'Read the rule out loud and write 2 examples of your own (5 min).',
    'Do exercises in the book or online and check your answers (10 min).',
    'Do your exercise above (5 min). Still unsure? Star this lesson in the Grammar tab.',
  ] });

  return {
    pos: p, kind: 'lesson', weekIdx, dayInWeek, week, title: lesson,
    tasks: [
      { id: 'grammar', cat: 'Grammar', min: 25, text: lesson, detail: { title: lesson, sections: grammarSections } },
      { id: 'vocab', cat: 'Vocabulary', min: 10, text: `Review due words + 7 new: "${week.theme}" (${words.slice(0, 2).join(', ')}...)`,
        detail: { title: `Vocabulary: ${week.theme}`, sections: [
          { h: 'Step 1 - review (spaced repetition)', due: true },
          { h: 'Step 2 - choose 5 of these 10 (skip the ones you know). Click to add.', chips: words },
          { h: 'Phrasal verb of the day', phrasal: pv },
          { h: 'How to save a word', list: ['Look it up in Cambridge or Oxford Learner\'s Dictionary: meaning + pronunciation.', 'Save it WITH its collocation (e.g. "meet a deadline", not just "deadline") and YOUR OWN example.', 'Add 2 more words from today\'s reading or podcast - 7 new words in total.', 'The task ticks itself when you have saved 7 new words today and no reviews are left.'] },
        ] } },
      { id: 'reading', cat: 'Reading', min: 15, text: `${reading.name}: one short article about ${week.theme.toLowerCase()}`,
        detail: { title: `Reading: ${reading.name}`, sections: [
          { h: "Today's source", link: reading },
          { h: 'What to read', text: `One short article (300-600 words) about "${week.theme}" - or any topic you enjoy. Interest matters more than the topic.` },
          { h: 'How to read (15 min)', list: ["Read once quickly for the main idea - don't stop for unknown words.", 'Read again slowly and underline 5-8 words or expressions you don\'t know.', 'Choose the 2 most useful ones and save them in Vocabulary with their collocation.', 'Summarise the article out loud in 2-3 sentences.'] },
        ] } },
      { id: 'podcast', cat: 'Podcast', min: 15, text: `${podcast.name}: an episode about ${week.theme.toLowerCase()}`,
        detail: { title: `Listening: ${podcast.name}`, sections: [
          { h: "Today's podcast", link: podcast },
          { h: 'Which episode?', text: `Choose an episode connected to this week's theme, "${week.theme}" (search the theme on the podcast's website). If you can't find one, choose any recent episode.` },
          listen,
        ] } },
      { id: 'output', cat: out.cat, min: 10, text: `${out.how}: ${topic}`,
        detail: { title: `${out.cat}: ${topic}`, sections: [
          { h: 'The question', text: topic },
          { h: 'Grammar to use', text: lesson },
          { h: 'How to do it', list: out.steps },
        ] } },
    ],
  };
}

function reviewItem(w, l) {
  const g = GRAMMAR[w][l];
  return { title: `Week ${w + 1}: ${PLAN[w].lessons[l]}`, wrong: g[2], right: g[3] };
}
