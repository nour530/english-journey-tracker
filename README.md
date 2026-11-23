# English Journey

A simple, clean desktop app to track an English learning journey: **grammar, vocabulary, reading, podcasts, daily tasks with a progress bar, tests and reminders**. It ships with a built-in 12-week plan for a B2 learner who wants to rebuild grammar from the very first lesson and reach a strong B2+.

**The plan in short:** a starting test (day 0) → 72 lessons over 12 weeks, about 75 min/day (grammar, vocabulary, reading, podcast, speaking/writing) → light review on day 7 → checkpoint tests on days 28 and 56 → final test on day 84. Words and grammar come back after 1, 3, 7 and 21 days (spaced repetition), and the plan only moves on when you finish a lesson.

![Today screen](docs/screenshots/today.png)

## Features

| Screen | What it does |
|---|---|
| **Today** | The day's tasks (grammar, vocabulary, reading, podcast, speaking/writing) + your own tasks. Progress bar fills as you tick tasks. Streak, journey progress, last 7 days, teacher tip. |
| **Task details** | Click any task to open its full lesson: grammar rule, examples, common mistake, exercise and a quick review of older lessons; words to choose from and the phrasal verb of the day; reading and podcast sources with method; the speaking/writing question. |
| **Tests** | Starting test, two checkpoints and a final test, taken inside the app. The starting test turns known weeks into 10-minute "skim" weeks; wrong checkpoint answers star their lessons. |
| **Grammar** | Test results and 72 lessons from A1 to C1 with Done / Today status, Skim / Focus badges and stars for revision. |
| **Vocabulary** | Word bank with spaced repetition (1, 3, 7, 21 days): review due words with *I knew it* / *I didn't know*. Search, filters, next review date. Saving 7 new words with no reviews left ticks the task. |
| **Podcasts** | Log episodes (minutes + expressions you heard). Recommended podcasts with links. Logging an episode ticks the podcast task. |
| **My plan** | The full 12-week programme and the daily routine explained. |
| **Reminders & settings** | Daily Windows notifications at the times you choose, start with Windows, start date, export/import backup. |

Closing the window keeps the app in the **system tray** so reminders keep working. Use the tray icon → *Quit* to exit completely.

## Run it

Requirements: [Node.js](https://nodejs.org) 18+.

```powershell
npm install
npm start
```

Build a single portable `.exe` (output in `release/`):

```powershell
npm run dist
```

## Tech

Electron + plain HTML/CSS/JavaScript. No framework, no database: data is saved locally (Electron `localStorage`) on your computer.

```
main.js          Electron window, tray, start-with-Windows
preload.js       Safe bridge between the window and Electron
src/plan.js      The 12-week study plan and the daily task generator
src/details.js   Content: 72 grammar lessons, 720 words, 72 questions, 72 test questions, 72 phrasal verbs
src/app.js       All app logic (tasks, progress, words, podcasts, reminders)
src/index.html   Layout
src/styles.css   Design
scripts/make-icon.js  Generates assets/icon.png
```

See [REPORT.md](REPORT.md) for the full project report and the learning plan.

## License

MIT
