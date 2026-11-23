// The 12-week study plan (84 days).
// Written as a teacher's programme for a B2 learner who wants to rebuild
// grammar from the ground up while keeping vocabulary and listening at B2+.
// Days 1-6 of each week = one grammar lesson each. Day 7 = weekly review.

const PLAN = [
  {
    title: 'Foundations', level: 'A1', theme: 'Daily life & routines',
    lessons: [
      'Parts of speech & sentence structure (Subject-Verb-Object)',
      'The verb "to be": positive, negative, questions',
      'Nouns: countable vs uncountable, plural spelling',
      'Articles: a / an / the / no article',
      'Pronouns & possessives (I, me, my, mine, \'s)',
      'There is / there are + this, that, these, those',
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
      'Time & place changes (tomorrow -> the next day)',
      'Practice: rewrite a dialogue as a report',
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
      'Classic errors: make/do, say/tell, since/for, fun/funny',
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
  { name: '6 Minute English (BBC)', url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english', why: 'Short, clear, with transcript. Perfect daily habit.' },
  { name: 'The English We Speak (BBC)', url: 'https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak', why: 'One idiom or expression in 3 minutes.' },
  { name: 'All Ears English', url: 'https://www.allearsenglish.com/', why: 'Natural American conversation, B2+.' },
  { name: "Luke's English Podcast", url: 'https://teacherluke.co.uk/', why: 'British teacher, long episodes, great for listening stamina.' },
  { name: 'TED Talks Daily', url: 'https://www.ted.com/podcasts/ted-talks-daily', why: 'Real native speed on interesting topics.' },
];

// How the daily output task is done (one format per lesson day).
const OUTPUT_FORMATS = [
  { cat: 'Writing', how: 'Write 5-8 sentences', steps: ["Write 5-8 sentences answering the question.", "Use today's grammar point at least 5 times and underline it.", "Use 3 of today's new words.", "Read it aloud once when you finish."] },
  { cat: 'Speaking', how: 'Shadow + speak 2 minutes', steps: ["Shadowing (5 min): play 1 minute of today's podcast and repeat right after the speaker, copying rhythm and intonation.", "Then answer the question out loud for 2 minutes without stopping.", "Try to use today's grammar point."] },
  { cat: 'Writing', how: 'Write an 80-word paragraph', steps: ["Write one paragraph of about 80 words answering the question.", "Use today's grammar point and 3 new words from this week.", "Check: capital letters, -s endings, articles, verb tenses."] },
  { cat: 'Speaking', how: 'Record yourself 2 minutes', steps: ["Record a 2-minute voice note on your phone answering the question.", "Listen back and write down 2 mistakes or hesitations.", "Record it a second time, better."] },
  { cat: 'Writing', how: 'Write a short email', steps: ["Write a short email (60-100 words) to a friend or colleague about the question.", "Start with a greeting and end with a closing line.", "Use today's grammar point at least 3 times."] },
  { cat: 'Speaking', how: 'Teach it out loud', steps: ["Explain today's grammar rule out loud as if you were the teacher (2 min).", "Give 3 examples of your own.", "Then answer the question out loud for 1-2 minutes."] },
];

const TOTAL_DAYS = PLAN.length * 7;

// Build the task list (with full details) for a given day of the journey (1..84).
function tasksForDay(day) {
  const d = ((day - 1) % TOTAL_DAYS + TOTAL_DAYS) % TOTAL_DAYS;
  const weekIdx = Math.floor(d / 7);
  const dayInWeek = d % 7;
  const week = PLAN[weekIdx];
  const podcast = PODCASTS[d % PODCASTS.length];
  const listen = {
    h: 'How to listen (20 min)',
    list: [
      'Listen once WITHOUT the transcript: what is the main idea?',
      "Listen again WITH the transcript (if there is one). Pause on every phrase you don't know.",
      'Write 3 new expressions in the Vocabulary tab with your own example.',
      'Log the episode in the Podcasts tab - the task ticks itself.',
    ],
  };

  if (dayInWeek === 6) {
    const words = WORDS[weekIdx];
    return {
      weekIdx, dayInWeek, week, lesson: 'Weekly review',
      tasks: [
        { id: 'grammar', cat: 'Grammar', min: 25, text: `Weekly review: the 6 lessons of week ${weekIdx + 1} (${week.title})`,
          detail: { title: `Week ${weekIdx + 1} grammar review`, sections: [
            { h: 'What to do', list: ['Re-read the rule of each lesson below (open each day with the ‹ arrow on the Today page).', 'Redo the exercises you got wrong this week.', 'Spend extra time on your starred lessons (Grammar tab).', 'Write ONE paragraph that uses all 6 grammar points.'] },
            { h: "This week's lessons", list: week.lessons },
          ] } },
        { id: 'vocab', cat: 'Vocabulary', min: 15, text: `Self-test all the "${week.theme}" words of this week`,
          detail: { title: `Vocabulary review: ${week.theme}`, sections: [
            { h: 'What to do', list: ['Open Vocabulary and press "Quiz me". Mark the words you really know.', 'For every word you missed, write a new example sentence.', "Words below without a ✓ are not saved yet - click to add them."] },
            { h: `All ${words.length} words of the week`, chips: words },
          ] } },
        { id: 'podcast', cat: 'Podcast', min: 20, text: `${podcast.name}: one episode, first without the transcript`,
          detail: { title: 'Review-day listening', sections: [
            { h: "Today's podcast", link: podcast },
            listen,
          ] } },
        { id: 'output', cat: 'Speaking', min: 30, text: 'Fun day: watch one episode of a series in English with English subtitles',
          detail: { title: 'Fun day: a series in English', sections: [
            { h: 'What to do', list: ['Watch one episode (20-40 min) of a series you like, in English with ENGLISH subtitles (not Arabic or French).', 'Pause on 3 sentences you like and repeat them out loud.', 'Save 3 expressions in Vocabulary.'] },
            { h: 'Good series for B2', list: ['Friends / Modern Family - everyday conversation', 'The Office - work vocabulary', 'Sherlock / The Crown - British English', 'Suits - business and formal English'] },
          ] } },
      ],
    };
  }

  const [rule, examples, wrong, right, practice] = GRAMMAR[weekIdx][dayInWeek];
  const words = WORDS[weekIdx].slice(dayInWeek * 10, dayInWeek * 10 + 10);
  const topic = TOPICS[weekIdx][dayInWeek];
  const out = OUTPUT_FORMATS[dayInWeek];
  const lesson = week.lessons[dayInWeek];

  return {
    weekIdx, dayInWeek, week, lesson,
    tasks: [
      { id: 'grammar', cat: 'Grammar', min: 25, text: lesson,
        detail: { title: lesson, sections: [
          { h: 'The rule', text: rule },
          { h: 'Examples', list: examples },
          { h: 'Common mistake', mistake: [wrong, right] },
          { h: 'Your exercise', text: practice },
          { h: 'Study steps (25 min)', list: ['Read the rule and the examples (5 min). For more, find the same topic in English Grammar in Use (Murphy) or on British Council LearnEnglish.', 'Do the exercises in the book or online and check your answers (10 min).', 'Do your exercise above (10 min).', 'Still unsure? Star this lesson in the Grammar tab.'] },
        ] } },
      { id: 'vocab', cat: 'Vocabulary', min: 15, text: `10 words on "${week.theme}": ${words.slice(0, 3).join(', ')}...`,
        detail: { title: `Today's 10 words: ${week.theme}`, sections: [
          { h: "Today's words - click a word to add it", chips: words },
          { h: 'How to learn them (15 min)', list: ["First review yesterday's words with \"Quiz me\" (3 min).", "Look up each word in Cambridge or Oxford Learner's Dictionary: meaning + pronunciation.", 'Click the word above and save it with the meaning and YOUR OWN example sentence.', 'When you save your 10th word today, this task ticks itself.'] },
        ] } },
      { id: 'podcast', cat: 'Podcast', min: 20, text: `${podcast.name}: an episode about ${week.theme.toLowerCase()}`,
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
