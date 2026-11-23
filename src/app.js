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
    words: [],       // [{ id, word, meaning, example, date, known }]
    podcasts: [],    // [{ id, show, episode, minutes, notes, date }]
    stars: {},       // { 'w-l': true } lessons to revise
    reminders: [
      { id: 'r1', time: '08:00', label: "Grammar time - today's lesson is waiting", on: true },
      { id: 'r2', time: '13:00', label: 'Podcast break - 20 minutes of listening', on: true },
      { id: 'r3', time: '21:00', label: 'Check your progress bar before bed', on: true },
    ],
    fired: {},       // { reminderId: 'YYYY-MM-DD' }
  };
}

let state;
try { state = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
catch { state = defaults(); }
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
save();

const uid = () => Math.random().toString(36).slice(2, 10);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let viewDate = todayIso();

// ---------- day logic ----------
const dayNumber = (date) => diffDays(state.startDate, date) + 1;
const dateForDay = (n) => addDays(state.startDate, n - 1);

function dayInfo(date) {
  const n = dayNumber(date);
  const planned = n >= 1 ? tasksForDay(n) : null;
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
  while (dayNumber(d) >= 1 && dayInfo(d).pct === 100) { s++; d = addDays(d, -1); }
  return s;
}

const TIPS = [
  'Write your example sentences about YOUR life. Personal sentences are remembered 3x better than textbook ones.',
  'Review yesterday\'s words before learning new ones. Spaced repetition is what moves words into long-term memory.',
  'Listen to the podcast twice: first without the transcript for the general idea, then with it for the details.',
  'When you make a grammar mistake, don\'t just correct it - write the correct sentence 3 times.',
  'Even on a busy day, do 10 minutes. The habit matters more than the amount.',
  'Read your sentences out loud. Grammar you can say is grammar you really own.',
  'Star the lessons that feel shaky and revise them on Sunday. Honest stars = fast progress.',
];

// ---------- navigation ----------
document.querySelectorAll('nav button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('nav button').forEach((x) => x.classList.toggle('active', x === b));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${b.dataset.view}`));
  render();
}));

// ---------- TODAY ----------
function renderToday() {
  const info = dayInfo(viewDate);
  const isToday = viewDate === todayIso();
  $('todayEyebrow').textContent = isToday ? 'Today' : (viewDate < todayIso() ? 'Past day' : 'Upcoming day');
  $('todayTitle').textContent = nice(viewDate);

  if (info.planned) {
    const w = info.planned.weekIdx + 1;
    const cycle = info.n > TOTAL_DAYS ? ' · second round' : '';
    $('todayLesson').textContent = `Day ${info.n} · Week ${w}: ${info.planned.week.title} (${info.planned.week.level})${cycle} — ${info.planned.lesson}`;
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
      <span class="tick">${t.done ? '✓' : ''}</span>
      <div class="t-body">
        <div class="t-meta"><span class="tag ${esc(t.cat)}">${esc(t.cat)}</span>${t.min ? `<span>${t.min} min</span>` : ''}</div>
        <div class="t-text">${esc(t.text)}</div>
      </div>
      ${t.custom ? '<button class="del" title="Delete task">×</button>' : ''}
    </li>`).join('');

  // stats
  const s = streak();
  $('statStreak').textContent = s;
  $('statWords').textContent = state.words.length;
  $('statMinutes').textContent = state.podcasts.reduce((a, p) => a + Number(p.minutes || 0), 0);
  $('sideStreak').innerHTML = `<b>🔥 ${s}</b>day streak`;

  const n = Math.min(Math.max(dayNumber(todayIso()), 0), TOTAL_DAYS);
  $('journeyFill').style.width = `${(n / TOTAL_DAYS) * 100}%`;
  $('journeyText').textContent = `Day ${n} of ${TOTAL_DAYS} · ${TOTAL_DAYS - n} days to go`;

  let dots = '';
  for (let i = 6; i >= 0; i--) {
    const d = addDays(todayIso(), -i);
    const p = dayInfo(d).pct;
    dots += `<div class="dot"><i><b class="${p === 100 ? 'full' : ''}" style="height:${p}%"></b></i>${parse(d).toLocaleDateString('en-GB', { weekday: 'short' })}</div>`;
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
  } else {
    const list = state.done[viewDate] || [];
    state.done[viewDate] = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }
  save();
  renderToday();
  if (dayInfo(viewDate).pct === 100) toast('Day complete! 🎉');
});

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

// ---------- GRAMMAR ----------
function renderGrammar() {
  let ok = 0;
  const todayN = dayNumber(todayIso());
  $('grammarWeeks').innerHTML = PLAN.map((w, wi) => {
    const items = w.lessons.map((l, li) => {
      const n = wi * 7 + li + 1;
      const done = (state.done[dateForDay(n)] || []).includes('grammar');
      if (done) ok++;
      const key = `${wi}-${li}`;
      const status = done ? 'Done' : (n === todayN ? 'Today' : (n < todayN ? 'Missed' : ''));
      return `<li class="${done ? 'ok' : ''}">
        <span class="num">Day ${n}</span><span class="name">${esc(l)}</span>
        <span class="status">${status}</span>
        <button class="star ${state.stars[key] ? 'on' : ''}" data-key="${key}" title="Revise again">★</button>
      </li>`;
    }).join('');
    return `<div class="card week-card"><h2>Week ${wi + 1} · ${esc(w.title)} <small>${esc(w.level)}</small></h2><ul class="lessons">${items}</ul></div>`;
  }).join('');
  const total = PLAN.length * 6;
  $('grammarFill').style.width = `${(ok / total) * 100}%`;
  const starred = Object.values(state.stars).filter(Boolean).length;
  $('grammarText').textContent = `${ok} of ${total} lessons completed · ${starred} starred for revision`;
}

$('grammarWeeks').addEventListener('click', (e) => {
  const b = e.target.closest('.star');
  if (!b) return;
  state.stars[b.dataset.key] = !state.stars[b.dataset.key];
  save(); renderGrammar();
});

// ---------- VOCABULARY ----------
function renderVocab() {
  const q = $('wordSearch').value.trim().toLowerCase();
  const f = $('wordFilter').value;
  const list = state.words
    .filter((w) => f === 'all' || (f === 'known' ? w.known : !w.known))
    .filter((w) => !q || `${w.word} ${w.meaning} ${w.example}`.toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date));

  $('wordRows').innerHTML = list.map((w) => `
    <tr class="${w.known ? 'known' : ''}" data-id="${w.id}">
      <td class="w">${esc(w.word)}</td><td>${esc(w.meaning)}</td><td class="muted">${esc(w.example)}</td>
      <td class="muted small">${short(w.date)}</td>
      <td><div class="row"><button class="ghost" data-act="known">${w.known ? 'Unmark' : 'Known'}</button><button class="del" data-act="del" title="Delete">×</button></div></td>
    </tr>`).join('');
  $('wordEmpty').hidden = list.length > 0;

  const today = state.words.filter((w) => w.date === todayIso()).length;
  const known = state.words.filter((w) => w.known).length;
  $('vocabSummary').textContent = `${state.words.length} words · ${known} known · ${today}/10 added today`;
}

$('wordForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.words.push({ id: uid(), word: $('wWord').value.trim(), meaning: $('wMeaning').value.trim(), example: $('wExample').value.trim(), date: todayIso(), known: false });
  ['wWord', 'wMeaning', 'wExample'].forEach((id) => { $(id).value = ''; });
  $('wWord').focus();
  const n = state.words.filter((w) => w.date === todayIso()).length;
  if (n === 10) {
    const list = state.done[todayIso()] || [];
    if (!list.includes('vocab')) state.done[todayIso()] = [...list, 'vocab'];
    toast('10 words today — vocabulary task ticked ✓');
  }
  save(); renderVocab();
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

// quiz
let quizWord = null;
function nextQuiz() {
  const pool = state.words.filter((w) => !w.known);
  const src = pool.length ? pool : state.words;
  if (!src.length) { toast('Add some words first'); $('quizCard').hidden = true; return; }
  quizWord = src[Math.floor(Math.random() * src.length)];
  $('quizWord').textContent = quizWord.word;
  $('quizAnswer').innerHTML = `${esc(quizWord.meaning)}${quizWord.example ? `<br><em>${esc(quizWord.example)}</em>` : ''}`;
  $('quizAnswer').hidden = true;
  $('quizCard').hidden = false;
}
$('quizBtn').onclick = nextQuiz;
$('quizNext').onclick = nextQuiz;
$('quizReveal').onclick = () => { $('quizAnswer').hidden = false; };
$('quizKnew').onclick = () => { if (quizWord) { quizWord.known = true; save(); renderVocab(); } nextQuiz(); };
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
  $('podSummary').textContent = `${state.podcasts.length} episodes · ${total} minutes total · ${week} minutes in the last 7 days (goal: 140)`;
}

$('podForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.podcasts.push({ id: uid(), show: $('pShow').value.trim(), episode: $('pEpisode').value.trim(), minutes: Number($('pMinutes').value), notes: $('pNotes').value.trim(), date: todayIso() });
  const list = state.done[todayIso()] || [];
  if (!list.includes('podcast')) state.done[todayIso()] = [...list, 'podcast'];
  ['pShow', 'pEpisode', 'pMinutes', 'pNotes'].forEach((id) => { $(id).value = ''; });
  save(); renderPodcasts();
  toast('Episode saved — podcast task ticked ✓');
});
$('podHistory').addEventListener('click', (e) => {
  if (!e.target.classList.contains('del')) return;
  const id = e.target.closest('li').dataset.id;
  state.podcasts = state.podcasts.filter((p) => p.id !== id);
  save(); renderPodcasts();
});

// ---------- PLAN ----------
function renderPlan() {
  const cur = Math.floor((dayNumber(todayIso()) - 1) / 7);
  $('planRows').innerHTML = PLAN.map((w, i) => `
    <tr class="${i === cur ? 'current' : ''}"><td><strong>${i + 1}</strong><br><span class="muted small">${short(dateForDay(i * 7 + 1))}</span></td>
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
  window.desktop?.getStartup().then((on) => { $('startup').checked = on; });
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
