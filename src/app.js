/* English Journey - all app logic. Data lives in localStorage (one JSON object). */

const KEY = 'english-journey-v1';

// ---------- dates ----------
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
const todayIso = () => iso(new Date());
const nice = (s) => parse(s).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const short = (s) => parse(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

// ---------- state ----------
function defaults() {
  return {
    startDate: todayIso(),
    done: {},        // { 'YYYY-MM-DD': ['grammar', 'vocab', ...] }
    custom: {},      // { 'YYYY-MM-DD': [{ id, text, done }] }
    words: [],       // [{ id, word, meaning, example, date, known, level, due }]
    podcasts: [],    // [{ id, show, episode, minutes, notes, date }]
    stars: {},       // { 'w-l': true } lessons to revise
    tests: {},       // { diag: { date, score, total, weeks: { w: [correct, total] }, wrong: [...] } }
    reminders: [
      { id: 'r1', time: '08:00', label: "Grammar time - today's lesson is waiting", on: true },
      { id: 'r2', time: '13:00', label: 'Reading & podcast break - 30 minutes', on: true },
      { id: 'r3', time: '21:00', label: 'Check your progress bar before bed', on: true },
    ],
    fired: {},       // { reminderId: 'YYYY-MM-DD' }
  };
}

let state;
try { state = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
catch { state = defaults(); }
let schedCache = null;
const save = () => { schedCache = null; localStorage.setItem(KEY, JSON.stringify(state)); };
save();

const uid = () => Math.random().toString(36).slice(2, 10);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let viewDate = todayIso();

// ---------- schedule: progress-based plan positions ----------
// Walk from the start date to today. A date keeps the same plan position until
// the day's main task (first task) is done, so a missed day never skips a lesson.
function schedule() {
  const t = todayIso();
  if (schedCache && schedCache.t === t) return schedCache;
  const map = {};
  const doneAt = {}; // position -> date it was completed
  let p = 0;
  for (let d = state.startDate; d <= t; d = addDays(d, 1)) {
    map[d] = p;
    const main = tasksForDay(p).tasks[0].id;
    if ((state.done[d] || []).includes(main)) { doneAt[p] = d; p++; }
  }
  schedCache = { t, map, doneAt, today: t < state.startDate ? -1 : map[t] };
  return schedCache;
}

function planPos(date) {
  if (date < state.startDate) return -1;
  const s = schedule();
  if (date <= s.t) return s.map[date];
  return s.today < 0 ? diffDays(state.startDate, date) : s.today + diffDays(s.t, date);
}

function dateOfPos(n) {
  const s = schedule();
  if (s.doneAt[n]) return s.doneAt[n];
  const first = Object.keys(s.map).find((d) => s.map[d] === n);
  if (first) return first;
  return s.today < 0 ? addDays(state.startDate, n) : addDays(s.t, n - s.today);
}

// Starting-test result for a week: 'skim' (all right), 'focus' (all wrong) or ''.
function weekLevel(w) {
  const r = state.tests.diag;
  if (!r || !r.weeks[w]) return '';
  const [c, t] = r.weeks[w];
  return c === t ? 'skim' : c === 0 ? 'focus' : '';
}

function decorate(plan) {
  if (plan.kind !== 'lesson') return plan;
  const g = plan.tasks[0];
  const lvl = weekLevel(plan.weekIdx);
  if (lvl === 'skim') {
    g.min = 10; g.text = `Skim: ${g.text}`;
    g.detail.sections = g.detail.sections.filter((s) => !s.h.startsWith('Study steps'));
    g.detail.sections.unshift({ h: 'Skim day (10 min)', text: 'You got this area right in your starting test. Read the rule and the common mistake, do the quick review, write 3 sentences of your own and move on.' });
  } else if (lvl === 'focus') {
    g.text = `Focus: ${g.text}`;
    g.detail.sections.unshift({ h: 'Focus area', text: 'This was a weak area in your starting test. Take your time, do extra exercises, and star the lesson if it still feels unsure.' });
  }
  return plan;
}

function dayInfo(date) {
  const n = planPos(date);
  const planned = n >= 0 ? decorate(tasksForDay(n)) : null;
  const done = state.done[date] || [];
  const tasks = planned ? planned.tasks.map((t) => ({ ...t, done: done.includes(t.id) })) : [];
  const custom = (state.custom[date] || []).map((c) => ({ id: c.id, cat: 'Custom', text: c.text, done: c.done, custom: true }));
  const all = [...tasks, ...custom];
  const finished = all.filter((t) => t.done).length;
  return { n, planned, all, finished, pct: all.length ? Math.round((finished / all.length) * 100) : 0 };
}

function streak() {
  let s = 0;
  let d = todayIso();
  if (dayInfo(d).pct < 100) d = addDays(d, -1); // today not finished yet doesn't break the streak
  while (d >= state.startDate && dayInfo(d).pct === 100) { s++; d = addDays(d, -1); }
  return s;
}

const TIPS = [
  'Write your example sentences about YOUR life. Personal sentences are remembered far better than textbook ones.',
  'Do your word reviews before learning new words. Spaced repetition is what moves words into long-term memory.',
  'Listen to the podcast twice: first without the transcript for the general idea, then with it for the details.',
  'When you make a grammar mistake, don\'t just correct it - write the correct sentence 3 times.',
  'Even on a busy day, do 10 minutes. The habit matters more than the amount.',
  'Read your sentences out loud. Grammar you can say is grammar you really own.',
  'Learn words with their partners: "meet a deadline", "heavy traffic". Collocations make you sound natural.',
  'Missed a day? Nothing is lost - the plan waits for you and continues where you stopped.',
];

// ---------- navigation ----------
function showView(name) {
  document.querySelectorAll('nav button').forEach((x) => x.classList.toggle('active', x.dataset.view === name));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
  render();
}
document.querySelectorAll('nav button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));

// ---------- TODAY ----------
function renderToday() {
  const info = dayInfo(viewDate);
  const isToday = viewDate === todayIso();
  $('todayEyebrow').textContent = isToday ? 'Today' : (viewDate < todayIso() ? 'Past day' : 'Upcoming day');
  $('todayTitle').textContent = nice(viewDate);

  const p = info.planned;
  if (p) {
    const round = info.n > TOTAL_DAYS ? ' · second round' : '';
    let line;
    if (p.kind === 'test') line = `Day ${p.pos} · ${p.title}${round}`;
    else if (p.kind === 'review') line = `Day ${p.pos} · Week ${p.weekIdx + 1}: ${p.week.title}${round} — light review day`;
    else line = `Day ${p.pos} · Week ${p.weekIdx + 1}: ${p.week.title} (${p.week.level})${round} — ${p.title}`;
    const yesterday = addDays(viewDate, -1);
    if (info.n > 0 && yesterday >= state.startDate && viewDate <= todayIso() && planPos(yesterday) === info.n) {
      line += ' · continuing where you stopped';
    }
    $('todayLesson').textContent = line;
  } else {
    $('todayLesson').textContent = 'This day is before your journey started.';
  }

  $('progressPct').textContent = `${info.pct}%`;
  $('progressFill').style.width = `${info.pct}%`;
  $('progressFill').classList.toggle('full', info.pct === 100);
  $('progressText').textContent = info.all.length
    ? (info.pct === 100 ? 'All done — excellent work today!' : `${info.finished} of ${info.all.length} tasks done · about ${info.all.filter((t) => !t.done && t.min).reduce((a, t) => a + t.min, 0)} min left`)
    : 'No tasks for this day.';

  $('taskList').innerHTML = info.all.map((t) => `
    <li class="${t.done ? 'done' : ''}" data-id="${esc(t.id)}" data-custom="${t.custom ? 1 : ''}">
      <span class="tick" title="Mark as done">${t.done ? '✓' : ''}</span>
      <div class="t-body">
        <div class="t-meta"><span class="tag ${esc(t.cat)}">${esc(t.cat)}</span>${t.min ? `<span>${t.min} min</span>` : ''}</div>
        <div class="t-text">${esc(t.text)}</div>
      </div>
      ${t.custom ? '<button class="del" title="Delete task">×</button>' : '<span class="t-open">Details ›</span>'}
    </li>`).join('');

  // stats
  const s = streak();
  $('statStreak').textContent = s;
  $('statWords').textContent = state.words.length;
  $('statMinutes').textContent = state.podcasts.reduce((a, x) => a + Number(x.minutes || 0), 0);
  $('sideStreak').innerHTML = `<b>🔥 ${s}</b>day streak`;

  const n = Math.min(Math.max(planPos(todayIso()), 0), TOTAL_DAYS);
  $('journeyFill').style.width = `${(n / TOTAL_DAYS) * 100}%`;
  $('journeyText').textContent = `Day ${n} of ${TOTAL_DAYS} · ${TOTAL_DAYS - n} plan days to go`;

  let dots = '';
  for (let i = 6; i >= 0; i--) {
    const d = addDays(todayIso(), -i);
    const pct = dayInfo(d).pct;
    dots += `<div class="dot"><i><b class="${pct === 100 ? 'full' : ''}" style="height:${pct}%"></b></i>${parse(d).toLocaleDateString('en-GB', { weekday: 'short' })}</div>`;
  }
  $('weekDots').innerHTML = dots;
  $('tipText').textContent = TIPS[Math.abs(info.n) % TIPS.length];
}

$('taskList').addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  if (li.dataset.custom) {
    const list = state.custom[viewDate] || [];
    if (e.target.classList.contains('del')) state.custom[viewDate] = list.filter((c) => c.id !== id);
    else list.forEach((c) => { if (c.id === id) c.done = !c.done; });
    save(); renderToday();
    if (dayInfo(viewDate).pct === 100) toast('Day complete! 🎉');
  } else if (e.target.closest('.tick')) {
    togglePlanned(id);
  } else {
    openDetail(id);
  }
});

function togglePlanned(id, date = viewDate) {
  const list = state.done[date] || [];
  state.done[date] = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  save();
  renderToday();
  if (dayInfo(date).pct === 100) toast('Day complete! 🎉');
}

function tickToday(id, msg) {
  const t = todayIso();
  const list = state.done[t] || [];
  if (list.includes(id) || !dayInfo(t).all.some((x) => x.id === id)) return;
  state.done[t] = [...list, id];
  save();
  if (msg) toast(msg);
}

$('customTaskForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('customTaskInput').value.trim();
  if (!text) return;
  (state.custom[viewDate] ||= []).push({ id: uid(), text, done: false });
  $('customTaskInput').value = '';
  save(); renderToday();
});

$('prevDay').onclick = () => { viewDate = addDays(viewDate, -1); renderToday(); };
$('nextDay').onclick = () => { viewDate = addDays(viewDate, 1); renderToday(); };
$('goToday').onclick = () => { viewDate = todayIso(); renderToday(); };

// ---------- TASK DETAILS WINDOW ----------
let detailId = null;
let testMode = null; // { id, qs, result }

function plannedTasks() {
  return dayInfo(viewDate).all.filter((t) => !t.custom);
}

function testSummary(id) {
  const r = state.tests[id];
  if (!r) return `<p>Not taken yet.</p><button class="primary inline" data-act="start-test" data-test="${id}">Start the test</button>`;
  const pct = Math.round((r.score / r.total) * 100);
  return `<p>Taken on ${short(r.date)}: <strong>${r.score} / ${r.total} (${pct}%)</strong></p>
    <button class="ghost inline" data-act="start-test" data-test="${id}">Retake the test</button>`;
}

function sectionHtml(s) {
  let body = '';
  if (s.text) body = `<p>${esc(s.text)}</p>`;
  if (s.list) body = `<ul>${s.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  if (s.mistake) body = `<div class="mistake"><div class="bad">✗ ${esc(s.mistake[0])}</div><div class="good">✓ ${esc(s.mistake[1])}</div></div>`;
  if (s.link) body = `<a class="pod-link" href="${s.link.url}" target="_blank"><strong>${esc(s.link.name)} ↗</strong><span>${esc(s.link.why)}</span></a>`;
  if (s.chips) {
    const saved = new Set(state.words.map((w) => w.word.toLowerCase()));
    body = `<div class="chips">${s.chips.map((w) => `<button class="chip ${saved.has(w.toLowerCase()) ? 'saved' : ''}" data-word="${esc(w)}">${saved.has(w.toLowerCase()) ? '✓ ' : ''}${esc(w)}</button>`).join('')}</div>`;
  }
  if (s.phrasal) {
    const [v, m, ex] = s.phrasal;
    body = `<p><button class="chip" data-word="${esc(v)}" data-meaning="${esc(m)}" data-example="${esc(ex)}">+ ${esc(v)}</button> &nbsp;${esc(m)}</p><p class="muted"><em>${esc(ex)}</em></p>`;
  }
  if (s.reviews) {
    body = s.reviews.map((r) => `<details class="rv"><summary><span class="muted small">${esc(r.title)}</span><span class="rv-bad">✗ ${esc(r.wrong)}</span></summary><div class="rv-good">✓ ${esc(r.right)}</div></details>`).join('');
  }
  if (s.due) {
    const n = dueWords().length;
    body = n
      ? `<p><strong>${n}</strong> word${n > 1 ? 's' : ''} due for review today.</p><button class="primary inline" data-act="review">Start review</button>`
      : '<p>Nothing to review today ✓</p>';
  }
  if (s.test) body = testSummary(s.test);
  return `<h3>${esc(s.h)}</h3>${body}`;
}

function setFooter({ prev = true, next = true, label, done = false }) {
  $('dPrev').style.visibility = prev ? '' : 'hidden';
  $('dNext').style.visibility = next ? '' : 'hidden';
  $('dDone').textContent = label;
  $('dDone').classList.toggle('is-done', done);
}

function openDetail(id) {
  const tasks = plannedTasks();
  const t = tasks.find((x) => x.id === id);
  if (!t || !t.detail) return;
  detailId = id;
  testMode = null;
  const info = dayInfo(viewDate);
  $('dTag').className = `tag ${t.cat}`;
  $('dTag').textContent = t.cat;
  $('dMeta').textContent = `${t.min} min · Day ${info.n} · ${short(viewDate)}`;
  $('dTitle').textContent = t.detail.title;
  $('dBody').innerHTML = t.detail.sections.map(sectionHtml).join('');
  $('dBody').scrollTop = 0;
  const i = tasks.indexOf(t);
  setFooter({ prev: i > 0, next: i < tasks.length - 1, label: t.done ? '✓ Done — click to undo' : 'Mark as done', done: t.done });
  $('detailOverlay').hidden = false;
}

function closeDetail() { $('detailOverlay').hidden = true; detailId = null; testMode = null; }

function stepDetail(dir) {
  if (testMode) return;
  const tasks = plannedTasks();
  const i = tasks.findIndex((x) => x.id === detailId) + dir;
  if (tasks[i]) openDetail(tasks[i].id);
}

// ---------- TESTS ----------
function startTest(id) {
  const qs = testQuestions(id);
  testMode = { id, qs };
  $('dTag').className = 'tag Test';
  $('dTag').textContent = 'Test';
  $('dMeta').textContent = `${qs.length} questions · about ${TESTS[id].min} min`;
  $('dTitle').textContent = TESTS[id].name;
  $('dBody').innerHTML = '<p class="muted">Choose one answer for each question, then press "Submit answers". No dictionary!</p>'
    + qs.map((x, i) => `<div class="q"><p><b>${i + 1}.</b> ${esc(x.q[0])}</p><div class="opts">${x.q[1].map((o, j) => `<label class="opt"><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join('')}</div></div>`).join('');
  $('dBody').scrollTop = 0;
  setFooter({ prev: false, next: false, label: 'Submit answers' });
  $('detailOverlay').hidden = false;
}

function submitTest() {
  const { id, qs } = testMode;
  const answers = qs.map((_, i) => { const c = document.querySelector(`input[name="q${i}"]:checked`); return c ? Number(c.value) : -1; });
  const missing = answers.filter((a) => a < 0).length;
  if (missing) { toast(`${missing} question${missing > 1 ? 's' : ''} not answered yet`); return; }

  const weeks = {};
  const wrong = [];
  let score = 0;
  qs.forEach((x, i) => {
    weeks[x.w] ||= [0, 0];
    weeks[x.w][1]++;
    if (answers[i] === x.q[2]) { weeks[x.w][0]++; score++; } else wrong.push({ w: x.w, l: x.l, i, chosen: answers[i] });
  });
  state.tests[id] = { date: todayIso(), score, total: qs.length, weeks, wrong };
  if (id !== 'diag') wrong.forEach((x) => { state.stars[`${x.w}-${x.l}`] = true; });
  const info = dayInfo(viewDate);
  if (info.planned && info.planned.testId === id) {
    const list = state.done[viewDate] || [];
    if (!list.includes('test')) state.done[viewDate] = [...list, 'test'];
  }
  save();
  renderToday();
  showTestResult(id, answers);
}

function showTestResult(id, answers) {
  const r = state.tests[id];
  const { qs } = testMode;
  testMode.result = true;
  const pct = Math.round((r.score / r.total) * 100);
  const rows = Object.keys(r.weeks).map((w) => {
    const [c, t] = r.weeks[w];
    const label = id === 'diag' ? (c === t ? '<span class="badge skim">Skim</span>' : c === 0 ? '<span class="badge focus">Focus</span>' : '') : '';
    return `<tr><td>Week ${Number(w) + 1}</td><td>${esc(PLAN[w].title)}</td><td>${c} / ${t}</td><td>${label}</td></tr>`;
  }).join('');
  const wrongHtml = r.wrong.map((x) => {
    const q = qs[x.i].q;
    return `<div class="q"><p><b>${x.i + 1}.</b> ${esc(q[0])}</p><div class="mistake"><div class="bad">✗ ${esc(q[1][x.chosen])}</div><div class="good">✓ ${esc(q[1][q[2]])}</div></div></div>`;
  }).join('');
  const note = id === 'diag'
    ? 'Skim weeks now have 10-minute grammar days; focus weeks are marked so you take your time.'
    : 'Every lesson you got wrong has been starred in the Grammar tab - revise them on your next review day.';
  $('dBody').innerHTML = `
    <div class="score"><strong>${r.score} / ${r.total}</strong><span>${pct}%</span></div>
    <p>${note}</p>
    <h3>Result by week</h3>
    <table class="table"><tbody>${rows}</tbody></table>
    ${wrongHtml ? `<h3>Your mistakes</h3>${wrongHtml}` : '<p>No mistakes - excellent!</p>'}`;
  $('dBody').scrollTop = 0;
  setFooter({ prev: false, next: false, label: 'Close', done: true });
}

$('dClose').onclick = closeDetail;
$('dPrev').onclick = () => stepDetail(-1);
$('dNext').onclick = () => stepDetail(1);
$('dDone').onclick = () => {
  if (testMode && !testMode.result) return submitTest();
  if (testMode) return closeDetail();
  togglePlanned(detailId);
  openDetail(detailId);
};
$('detailOverlay').addEventListener('click', (e) => { if (e.target.id === 'detailOverlay') closeDetail(); });
document.addEventListener('keydown', (e) => {
  if ($('detailOverlay').hidden) return;
  if (e.key === 'Escape') closeDetail();
  if (e.key === 'ArrowRight') stepDetail(1);
  if (e.key === 'ArrowLeft') stepDetail(-1);
});

$('dBody').addEventListener('click', (e) => {
  const act = e.target.closest('[data-act]');
  if (act && act.dataset.act === 'start-test') { startTest(act.dataset.test); return; }
  if (act && act.dataset.act === 'review') { closeDetail(); showView('vocab'); nextQuiz(); return; }
  const chip = e.target.closest('.chip');
  if (!chip) return;
  closeDetail();
  showView('vocab');
  $('wWord').value = chip.dataset.word;
  $('wMeaning').value = chip.dataset.meaning || '';
  $('wExample').value = chip.dataset.example || '';
  (chip.dataset.meaning ? $('wExample') : $('wMeaning')).focus();
});

// ---------- GRAMMAR ----------
function renderGrammar() {
  const s = schedule();
  const todayP = planPos(todayIso());
  let ok = 0;
  $('grammarWeeks').innerHTML = PLAN.map((w, wi) => {
    const items = w.lessons.map((l, li) => {
      const n = wi * 7 + li + 1;
      const done = n in s.doneAt;
      if (done) ok++;
      const key = `${wi}-${li}`;
      const status = done ? 'Done' : (n === todayP ? 'Today' : '');
      return `<li class="${done ? 'ok' : ''}">
        <span class="num">Day ${n}</span><span class="name">${esc(l)}</span>
        <span class="status">${status}</span>
        <button class="star ${state.stars[key] ? 'on' : ''}" data-key="${key}" title="Revise again">★</button>
      </li>`;
    }).join('');
    const lvl = weekLevel(wi);
    const badge = lvl ? ` <span class="badge ${lvl}">${lvl === 'skim' ? 'Skim' : 'Focus'}</span>` : '';
    return `<div class="card week-card"><h2>Week ${wi + 1} · ${esc(w.title)} <small>${esc(w.level)}${badge}</small></h2><ul class="lessons">${items}</ul></div>`;
  }).join('');
  const total = PLAN.length * 6;
  $('grammarFill').style.width = `${(ok / total) * 100}%`;
  const starred = Object.values(state.stars).filter(Boolean).length;
  $('grammarText').textContent = `${ok} of ${total} lessons completed · ${starred} starred for revision`;

  const at = { diag: 0, cp1: 28, cp2: 56, final: 84 };
  $('testCards').innerHTML = Object.keys(TESTS).map((id) => {
    const r = state.tests[id];
    const res = r ? `<strong>${r.score} / ${r.total}</strong> <span class="muted small">(${Math.round((r.score / r.total) * 100)}%, ${short(r.date)})</span>` : `<span class="muted small">Day ${at[id]}</span>`;
    return `<div class="test-card"><span>${esc(TESTS[id].name)}</span>${res}</div>`;
  }).join('');
}

$('grammarWeeks').addEventListener('click', (e) => {
  const b = e.target.closest('.star');
  if (!b) return;
  state.stars[b.dataset.key] = !state.stars[b.dataset.key];
  save(); renderGrammar();
});

// ---------- VOCABULARY (spaced repetition: 1, 3, 7, 21 days) ----------
const dueDate = (w) => w.due || addDays(w.date, 1);
const dueWords = () => state.words.filter((w) => !w.known && dueDate(w) <= todayIso());
const newToday = () => state.words.filter((w) => w.date === todayIso()).length;

function maybeTickVocab() {
  const info = dayInfo(todayIso());
  const v = info.all.find((t) => t.id === 'vocab');
  if (!v || v.done) return;
  const needNew = info.planned.kind === 'lesson' ? 7 : 0;
  if (newToday() >= needNew && dueWords().length === 0) tickToday('vocab', 'Vocabulary task ticked ✓');
}

function renderVocab() {
  const q = $('wordSearch').value.trim().toLowerCase();
  const f = $('wordFilter').value;
  const today = todayIso();
  const list = state.words
    .filter((w) => f === 'all' || (f === 'known' ? w.known : f === 'due' ? (!w.known && dueDate(w) <= today) : !w.known))
    .filter((w) => !q || `${w.word} ${w.meaning} ${w.example}`.toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date));

  $('wordRows').innerHTML = list.map((w) => {
    const next = w.known ? 'Known' : dueDate(w) <= today ? '<span class="badge focus">Due</span>' : short(dueDate(w));
    return `<tr class="${w.known ? 'known' : ''}" data-id="${w.id}">
      <td class="w">${esc(w.word)}</td><td>${esc(w.meaning)}</td><td class="muted">${esc(w.example)}</td>
      <td class="muted small">${short(w.date)}</td><td class="small">${next}</td>
      <td><div class="row"><button class="ghost" data-act="known">${w.known ? 'Unmark' : 'Known'}</button><button class="del" data-act="del" title="Delete">×</button></div></td>
    </tr>`;
  }).join('');
  $('wordEmpty').hidden = list.length > 0;

  const due = dueWords().length;
  const known = state.words.filter((w) => w.known).length;
  $('vocabSummary').textContent = `${state.words.length} words · ${known} known · ${due} due for review · ${newToday()}/7 new today`;
  $('quizBtn').textContent = due ? `Review due words (${due})` : 'Practice';
}

$('wordForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.words.push({ id: uid(), word: $('wWord').value.trim(), meaning: $('wMeaning').value.trim(), example: $('wExample').value.trim(), date: todayIso(), known: false, level: 0, due: addDays(todayIso(), 1) });
  ['wWord', 'wMeaning', 'wExample'].forEach((id) => { $(id).value = ''; });
  $('wWord').focus();
  save();
  maybeTickVocab();
  renderVocab();
});

$('wordRows').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const id = b.closest('tr').dataset.id;
  if (b.dataset.act === 'del') state.words = state.words.filter((w) => w.id !== id);
  else state.words.forEach((w) => { if (w.id === id) w.known = !w.known; });
  save(); renderVocab();
});
$('wordSearch').addEventListener('input', renderVocab);
$('wordFilter').addEventListener('change', renderVocab);

// review / practice card
const INTERVALS = [1, 3, 7, 21];
let quizWord = null;
let quizDue = false;
function nextQuiz() {
  const due = dueWords();
  quizDue = due.length > 0;
  let src = due;
  if (!quizDue) { src = state.words.filter((w) => !w.known); if (!src.length) src = state.words; }
  if (!src.length) { toast('Add some words first'); $('quizCard').hidden = true; return; }
  quizWord = quizDue ? src[0] : src[Math.floor(Math.random() * src.length)];
  $('quizMode').textContent = quizDue ? `Review · ${due.length} due today` : 'Practice · nothing due today';
  $('quizWord').textContent = quizWord.word;
  $('quizAnswer').innerHTML = `${esc(quizWord.meaning)}${quizWord.example ? `<br><em>${esc(quizWord.example)}</em>` : ''}`;
  $('quizAnswer').hidden = true;
  $('quizCard').hidden = false;
}
function answerQuiz(knew) {
  const w = quizWord;
  if (!w) return;
  if (quizDue) {
    if (knew) {
      w.level = (w.level || 0) + 1;
      if (w.level >= INTERVALS.length) w.known = true;
      else w.due = addDays(todayIso(), INTERVALS[w.level]);
    } else {
      w.level = 0;
      w.due = addDays(todayIso(), 1);
    }
    save();
    maybeTickVocab();
    renderVocab();
    if (!dueWords().length) { toast('Reviews done for today ✓'); $('quizCard').hidden = true; return; }
  }
  nextQuiz();
}
$('quizBtn').onclick = nextQuiz;
$('quizReveal').onclick = () => { $('quizAnswer').hidden = false; };
$('quizKnew').onclick = () => answerQuiz(true);
$('quizMiss').onclick = () => answerQuiz(false);
$('quizClose').onclick = () => { $('quizCard').hidden = true; };

// ---------- PODCASTS ----------
function renderPodcasts() {
  $('podList').innerHTML = PODCASTS.map((p) => `<option value="${esc(p.name)}">`).join('');
  $('podRecs').innerHTML = PODCASTS.map((p) => `<li><a href="${p.url}" target="_blank">${esc(p.name)}</a><p>${esc(p.why)}</p></li>`).join('');
  const list = [...state.podcasts].sort((a, b) => b.date.localeCompare(a.date));
  $('podHistory').innerHTML = list.map((p) => `
    <li data-id="${p.id}"><span class="mins">${Number(p.minutes)} min</span>
      <div class="h-body"><strong>${esc(p.show)}</strong>${p.episode ? ` — ${esc(p.episode)}` : ''} <span class="muted small">· ${short(p.date)}</span>
      ${p.notes ? `<p>${esc(p.notes)}</p>` : ''}</div>
      <button class="del" title="Delete">×</button></li>`).join('');
  $('podEmpty').hidden = list.length > 0;
  const total = state.podcasts.reduce((a, p) => a + Number(p.minutes || 0), 0);
  const weekAgo = addDays(todayIso(), -6);
  const week = state.podcasts.filter((p) => p.date >= weekAgo).reduce((a, p) => a + Number(p.minutes || 0), 0);
  $('podSummary').textContent = `${state.podcasts.length} episodes · ${total} minutes total · ${week} minutes in the last 7 days (goal: 90)`;
}

$('podForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.podcasts.push({ id: uid(), show: $('pShow').value.trim(), episode: $('pEpisode').value.trim(), minutes: Number($('pMinutes').value), notes: $('pNotes').value.trim(), date: todayIso() });
  ['pShow', 'pEpisode', 'pMinutes', 'pNotes'].forEach((id) => { $(id).value = ''; });
  save();
  tickToday('podcast', 'Episode saved — podcast task ticked ✓');
  renderPodcasts();
});
$('podHistory').addEventListener('click', (e) => {
  if (!e.target.classList.contains('del')) return;
  const id = e.target.closest('li').dataset.id;
  state.podcasts = state.podcasts.filter((p) => p.id !== id);
  save(); renderPodcasts();
});

// ---------- PLAN ----------
function renderPlan() {
  const todayP = planPos(todayIso());
  const cur = todayP >= 1 ? Math.floor((Math.min(todayP, TOTAL_DAYS) - 1) / 7) : -1;
  $('planRows').innerHTML = PLAN.map((w, i) => `
    <tr class="${i === cur ? 'current' : ''}"><td><strong>${i + 1}</strong><br><span class="muted small">${short(dateOfPos(i * 7 + 1))}</span></td>
    <td><strong>${esc(w.title)}</strong><br><span class="muted small">${w.lessons.map(esc).join(' · ')}</span></td>
    <td>${esc(w.level)}</td><td>${esc(w.theme)}</td></tr>`).join('');
}

// ---------- SETTINGS & REMINDERS ----------
function renderSettings() {
  const list = [...state.reminders].sort((a, b) => a.time.localeCompare(b.time));
  $('reminderList').innerHTML = list.map((r) => `
    <li class="${r.on ? '' : 'off'}" data-id="${r.id}"><span class="time">${esc(r.time)}</span><span class="label">${esc(r.label)}</span>
      <button class="ghost" data-act="toggle">${r.on ? 'Pause' : 'Resume'}</button><button class="del" data-act="del" title="Delete">×</button></li>`).join('')
    || '<p class="empty">No reminders.</p>';
  $('startDate').value = state.startDate;
  window.desktop?.getStartup().then((on) => { $('startup').checked = on; }).catch(() => {});
}

$('reminderList').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const id = b.closest('li').dataset.id;
  if (b.dataset.act === 'del') state.reminders = state.reminders.filter((r) => r.id !== id);
  else state.reminders.forEach((r) => { if (r.id === id) r.on = !r.on; });
  save(); renderSettings();
});
$('reminderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.reminders.push({ id: uid(), time: $('rTime').value, label: $('rLabel').value.trim() || 'Time for English!', on: true });
  $('rTime').value = ''; $('rLabel').value = '';
  save(); renderSettings();
});
$('startDate').addEventListener('change', (e) => {
  if (!e.target.value) return;
  state.startDate = e.target.value;
  save(); toast('Start date updated');
});
$('startup').addEventListener('change', (e) => window.desktop?.setStartup(e.target.checked));
$('testNotif').onclick = () => notify('This is how your reminders will look.');

$('exportBtn').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  a.download = `english-journey-backup-${todayIso()}.json`;
  a.click();
};
$('importBtn').onclick = () => $('importFile').click();
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data.startDate) throw new Error('bad file');
    state = Object.assign(defaults(), data);
    save(); render(); toast('Backup imported');
  } catch { toast('This file is not a valid backup'); }
  e.target.value = '';
});

function notify(body) {
  const n = new Notification('English Journey', { body, icon: '../assets/icon.png' });
  n.onclick = () => window.desktop?.showWindow();
}

function checkReminders() {
  const now = new Date();
  const hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const today = todayIso();
  state.reminders.forEach((r) => {
    if (r.on && r.time === hm && state.fired[r.id] !== today) {
      state.fired[r.id] = today;
      const info = dayInfo(today);
      const left = info.all.length - info.finished;
      notify(`${r.label}${left ? ` · ${left} task${left > 1 ? 's' : ''} left today (${info.pct}% done)` : ' · everything done today ✓'}`);
      save();
    }
  });
}
setInterval(checkReminders, 20000);

// ---------- misc ----------
let toastTimer;
function toast(msg) {
  $('toast').textContent = msg;
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2200);
}

function render() {
  const view = document.querySelector('.view.active').id.replace('view-', '');
  ({ today: renderToday, grammar: renderGrammar, vocab: renderVocab, podcasts: renderPodcasts, plan: renderPlan, settings: renderSettings })[view]();
  renderToday(); // keeps sidebar streak up to date
}

// Refresh "today" after midnight if the app stays open.
let lastDay = todayIso();
setInterval(() => {
  if (todayIso() !== lastDay) { if (viewDate === lastDay) viewDate = todayIso(); lastDay = todayIso(); render(); }
}, 60000);

render();
