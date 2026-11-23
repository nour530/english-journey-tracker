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

const OUTPUT_TASKS = [
  'Writing: 5 sentences about your life using today\'s grammar',
  'Speaking: shadow 5 minutes of today\'s podcast (repeat after the speaker)',
  'Writing: an 80-word paragraph on this week\'s theme',
  'Speaking: record yourself 2 minutes on this week\'s theme, then listen back',
  'Writing: a short email (to a friend or colleague) using today\'s grammar',
  'Speaking: explain today\'s grammar rule out loud, as if you were the teacher',
];

const TOTAL_DAYS = PLAN.length * 7;

// Build the task list for a given day of the journey (1..84).
function tasksForDay(day) {
  const d = ((day - 1) % TOTAL_DAYS + TOTAL_DAYS) % TOTAL_DAYS;
  const weekIdx = Math.floor(d / 7);
  const dayInWeek = d % 7;
  const week = PLAN[weekIdx];
  const podcast = PODCASTS[d % PODCASTS.length];

  if (dayInWeek === 6) {
    return {
      weekIdx, dayInWeek, week, lesson: 'Weekly review',
      tasks: [
        { id: 'grammar', cat: 'Grammar', min: 25, text: `Review week ${weekIdx + 1}: re-read your notes on all 6 lessons and redo the exercises you got wrong` },
        { id: 'vocab', cat: 'Vocabulary', min: 15, text: 'Self-test every word you added this week (use "Quiz me" in Vocabulary)' },
        { id: 'podcast', cat: 'Podcast', min: 20, text: `Listen to any episode of ${podcast.name} without the transcript first` },
        { id: 'output', cat: 'Speaking', min: 30, text: 'Fun day: watch one episode of a series in English with English subtitles' },
      ],
    };
  }

  return {
    weekIdx, dayInWeek, week, lesson: week.lessons[dayInWeek],
    tasks: [
      { id: 'grammar', cat: 'Grammar', min: 25, text: `${week.lessons[dayInWeek]} - study the rule, write 10 example sentences, do exercises` },
      { id: 'vocab', cat: 'Vocabulary', min: 15, text: `Learn 10 new words on "${week.theme}" and review yesterday's words` },
      { id: 'podcast', cat: 'Podcast', min: 20, text: `Listen to ${podcast.name} and note 3 new expressions` },
      { id: 'output', cat: dayInWeek % 2 ? 'Speaking' : 'Writing', min: 10, text: OUTPUT_TASKS[dayInWeek] },
    ],
  };
}
