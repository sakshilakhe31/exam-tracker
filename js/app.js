/* ============================================================
   PREP SHEET — Exam Readiness Tracker
   Runs a real SQLite database entirely in the browser via sql.js
   (SQLite compiled to WebAssembly). No backend required.
   Data persists to localStorage as an exported SQLite binary.

   Mock tests can come from two sources:
   - The built-in QUESTION_BANK (questionBank.js) — always available.
   - Optional AI-generated fresh questions via Gemini (needs a free key).
   ============================================================ */

const SECTIONS = [
  { key: 'quant', label: 'Quantitative Aptitude' },
  { key: 'reasoning', label: 'Reasoning' },
  { key: 'english', label: 'English' },
  { key: 'gk', label: 'General Awareness' },
];

let db = null;
const DB_STORAGE_KEY = 'prepSheetDB_v1';
const API_KEY_STORAGE = 'prepSheetGeminiKey';

/* ---------------- DB init ---------------- */
async function initDB() {
  const SQL = await initSqlJs({
    locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`,
  });

  const saved = localStorage.getItem(DB_STORAGE_KEY);
  if (saved) {
    try {
      const binary = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
      db = new SQL.Database(binary);
    } catch (e) {
      console.error('Failed to load saved database, starting fresh:', e);
      db = new SQL.Database();
      createSchema();
    }
  } else {
    db = new SQL.Database();
    createSchema();
  }
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS mocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_date TEXT NOT NULL,
      exam_type TEXT NOT NULL,
      quant INTEGER, quant_total INTEGER,
      reasoning INTEGER, reasoning_total INTEGER,
      english INTEGER, english_total INTEGER,
      gk INTEGER, gk_total INTEGER,
      notes TEXT
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      candidate_name TEXT,
      candidate_id TEXT,
      target_exam TEXT,
      target_date TEXT
    );
  `);
}

function persist() {
  try {
    const data = db.export();
    let binary = '';
    for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
    localStorage.setItem(DB_STORAGE_KEY, btoa(binary));
  } catch (e) {
    console.error('Failed to save database:', e);
  }
}

/* ---------------- Query helpers ---------------- */
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

/* ---------------- Profile (hall ticket) ---------------- */
function generateCandidateId(name) {
  const clean = (name || 'ASP').replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = clean.slice(0, 2) || 'AS';
  const year = new Date().getFullYear().toString().slice(-2);
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const digits = (hash % 90000 + 10000).toString();
  return `${prefix}${year}-${digits}`;
}

function loadProfile() {
  const p = queryOne(`SELECT * FROM profile WHERE id = 1`);
  const nameInput = document.getElementById('candidateName');
  const idField = document.getElementById('candidateId');
  const examSelect = document.getElementById('targetExam');
  const dateInput = document.getElementById('targetDate');
  const initials = document.getElementById('ticketInitials');

  if (p) {
    nameInput.value = p.candidate_name || nameInput.value;
    idField.textContent = p.candidate_id || '— generated on save —';
    examSelect.value = p.target_exam || 'SSC CGL';
    dateInput.value = p.target_date || '';
  }
  updateInitials();
  updateCountdown();
}

function updateInitials() {
  const name = document.getElementById('candidateName').value.trim();
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '??';
  document.getElementById('ticketInitials').textContent = initials;
}

function updateCountdown() {
  const dateVal = document.getElementById('targetDate').value;
  const el = document.getElementById('daysRemaining');
  if (!dateVal) { el.textContent = '—'; return; }
  const target = new Date(dateVal + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((target - today) / 86400000);
  if (diffDays < 0) el.textContent = 'Passed';
  else if (diffDays === 0) el.textContent = 'Today';
  else el.textContent = `${diffDays} days`;
}

function saveProfile() {
  const name = document.getElementById('candidateName').value.trim() || 'Aspirant';
  const existing = queryOne(`SELECT candidate_id FROM profile WHERE id = 1`);
  const candidateId = existing && existing.candidate_id ? existing.candidate_id : generateCandidateId(name);
  const targetExam = document.getElementById('targetExam').value;
  const targetDate = document.getElementById('targetDate').value;

  db.run(
    `INSERT INTO profile (id, candidate_name, candidate_id, target_exam, target_date)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       candidate_name = excluded.candidate_name,
       candidate_id = excluded.candidate_id,
       target_exam = excluded.target_exam,
       target_date = excluded.target_date`,
    [name, candidateId, targetExam, targetDate]
  );
  persist();
  document.getElementById('candidateId').textContent = candidateId;
  updateInitials();
  updateCountdown();
}

/* ---------------- Mock test form ---------------- */
function buildSectionInputs() {
  const container = document.getElementById('sectionInputs');
  container.innerHTML = SECTIONS.map(s => `
    <div class="section-row">
      <label>${s.label}</label>
      <input type="number" min="0" step="0.5" id="score_${s.key}" placeholder="Obtained" required>
      <span class="slash">/</span>
      <input type="number" min="1" step="0.5" id="total_${s.key}" placeholder="Total" required>
    </div>
  `).join('');
}

function handleMockSubmit(e) {
  e.preventDefault();
  const testDate = document.getElementById('testDate').value;
  const examType = document.getElementById('mockExamType').value;
  const notes = document.getElementById('mockNotes').value.trim();

  const values = { test_date: testDate, exam_type: examType, notes };
  for (const s of SECTIONS) {
    values[s.key] = parseFloat(document.getElementById(`score_${s.key}`).value) || 0;
    values[`${s.key}_total`] = parseFloat(document.getElementById(`total_${s.key}`).value) || 0;
  }

  db.run(
    `INSERT INTO mocks
      (test_date, exam_type, quant, quant_total, reasoning, reasoning_total, english, english_total, gk, gk_total, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [values.test_date, values.exam_type,
     values.quant, values.quant_total,
     values.reasoning, values.reasoning_total,
     values.english, values.english_total,
     values.gk, values.gk_total,
     values.notes]
  );
  persist();
  e.target.reset();
  buildSectionInputs();
  document.getElementById('testDate').value = '';
  renderAll();
}

function deleteMock(id) {
  db.run(`DELETE FROM mocks WHERE id = ?`, [id]);
  persist();
  renderAll();
}

/* ---------------- Dashboard rendering ---------------- */
function getSectionStats() {
  const selectParts = SECTIONS.map(s =>
    `AVG(CASE WHEN ${s.key}_total > 0 THEN ${s.key}*100.0/${s.key}_total END) as ${s.key}_pct`
  ).join(', ');
  const row = queryOne(`SELECT ${selectParts}, COUNT(*) as total FROM mocks`);
  return row;
}

function getTrend(sectionKey, limit = 8) {
  const rows = queryAll(
    `SELECT test_date, CASE WHEN ${sectionKey}_total > 0 THEN ${sectionKey}*100.0/${sectionKey}_total ELSE NULL END as pct
     FROM mocks WHERE ${sectionKey}_total > 0 ORDER BY test_date ASC`
  );
  return rows.slice(-limit).map(r => r.pct);
}

function renderSparkline(values) {
  if (values.length < 2) return '<div style="height:32px"></div>';
  const w = 200, h = 32, pad = 3;
  const max = Math.max(...values, 100);
  const min = Math.min(...values, 0);
  const range = (max - min) || 1;
  const step = (w - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const lastPoint = points.split(' ').pop().split(',');
  return `
    <svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <polyline points="${points}" />
      <circle cx="${lastPoint[0]}" cy="${lastPoint[1]}" r="2.5" />
    </svg>`;
}

function renderOmrRow(pct, weak) {
  const filled = Math.round((pct || 0) / 10);
  let html = '';
  for (let i = 0; i < 10; i++) {
    const isFilled = i < filled;
    html += `<div class="omr-bubble ${isFilled ? 'filled' : ''} ${isFilled && weak ? 'weak' : ''}"></div>`;
  }
  return `<div class="omr-row">${html}</div>`;
}

function renderDashboard() {
  const stats = getSectionStats();
  const total = stats.total || 0;
  document.getElementById('mockCount').textContent = `${total} test${total === 1 ? '' : 's'} logged`;

  const grid = document.getElementById('statsGrid');
  const empty = document.getElementById('emptyDashboard');
  const priorityBanner = document.getElementById('priorityBanner');

  if (total === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    priorityBanner.style.display = 'none';
    return;
  }
  empty.style.display = 'none';

  // Find weakest section
  let weakestKey = null, weakestPct = 101;
  SECTIONS.forEach(s => {
    const pct = stats[`${s.key}_pct`];
    if (pct !== null && pct !== undefined && pct < weakestPct) {
      weakestPct = pct;
      weakestKey = s.key;
    }
  });

  if (weakestKey) {
    const label = SECTIONS.find(s => s.key === weakestKey).label;
    priorityBanner.style.display = 'flex';
    document.getElementById('priorityText').textContent =
      `${label} is your lowest-scoring section at ${weakestPct.toFixed(0)}% average. Focus here next.`;
  } else {
    priorityBanner.style.display = 'none';
  }

  grid.innerHTML = SECTIONS.map(s => {
    const pct = stats[`${s.key}_pct`];
    const isWeak = s.key === weakestKey;
    const trend = getTrend(s.key);
    return `
      <div class="section-stat">
        <div class="section-stat-top">
          <span class="section-stat-name">${s.label}</span>
          <span class="section-stat-pct mono">${pct !== null && pct !== undefined ? pct.toFixed(0) + '%' : '—'}</span>
        </div>
        ${renderOmrRow(pct, isWeak)}
        ${renderSparkline(trend)}
      </div>`;
  }).join('');
}

function renderHistory() {
  const rows = queryAll(`SELECT * FROM mocks ORDER BY test_date DESC, id DESC`);
  const tbody = document.getElementById('historyBody');

  if (rows.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">No tests logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const totalObtained = SECTIONS.reduce((sum, s) => sum + (r[s.key] || 0), 0);
    const totalMax = SECTIONS.reduce((sum, s) => sum + (r[`${s.key}_total`] || 0), 0);
    const overall = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(0) + '%' : '—';
    return `
      <tr>
        <td class="mono-cell">${r.test_date}</td>
        <td>${r.exam_type}</td>
        <td class="mono-cell">${r.quant}/${r.quant_total}</td>
        <td class="mono-cell">${r.reasoning}/${r.reasoning_total}</td>
        <td class="mono-cell">${r.english}/${r.english_total}</td>
        <td class="mono-cell">${r.gk}/${r.gk_total}</td>
        <td class="mono-cell"><strong>${overall}</strong></td>
        <td><button class="row-delete" data-id="${r.id}" title="Delete">✕</button></td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('.row-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this test entry?')) deleteMock(parseInt(btn.dataset.id, 10));
    });
  });
}

function renderAll() {
  renderDashboard();
  renderHistory();
}

/* ---------------- CSV export ---------------- */
function exportCSV() {
  const rows = queryAll(`SELECT * FROM mocks ORDER BY test_date ASC`);
  if (rows.length === 0) { alert('No data to export yet.'); return; }
  const headers = ['test_date', 'exam_type', 'quant', 'quant_total', 'reasoning', 'reasoning_total', 'english', 'english_total', 'gk', 'gk_total', 'notes'];
  const csvLines = [headers.join(',')];
  rows.forEach(r => {
    csvLines.push(headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
  });
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'prep-sheet-history.csv';
  a.click();
}

/* ---------------- API key modal (for optional AI question generation) ---------------- */
function getApiKey() { return localStorage.getItem(API_KEY_STORAGE) || ''; }
function setApiKey(k) { localStorage.setItem(API_KEY_STORAGE, k); }

function setupApiKeyModal() {
  const backdrop = document.getElementById('modalBackdrop');
  const input = document.getElementById('apiKeyInput');
  document.getElementById('keyCancel').addEventListener('click', () => backdrop.classList.remove('show'));
  document.getElementById('keySave').addEventListener('click', () => {
    setApiKey(input.value.trim());
    backdrop.classList.remove('show');
    if (pendingAiStart) { pendingAiStart(); pendingAiStart = null; }
  });
}
function openApiKeyModal() {
  document.getElementById('apiKeyInput').value = getApiKey();
  document.getElementById('modalBackdrop').classList.add('show');
}
let pendingAiStart = null;

/* ---------------- Mode tabs (Take test / Log score) ---------------- */
function setupModeTabs() {
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('mode-take').style.display = tab.dataset.mode === 'take' ? 'block' : 'none';
      document.getElementById('mode-log').style.display = tab.dataset.mode === 'log' ? 'block' : 'none';
    });
  });
}

/* ---------------- Question source toggle ---------------- */
function setupSourceToggle() {
  document.querySelectorAll('.source-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('aiCountField').style.display = btn.dataset.source === 'ai' ? 'block' : 'none';
    });
  });
}
function getSelectedSource() {
  const active = document.querySelector('.source-btn.active');
  return active ? active.dataset.source : 'bank';
}

/* ---------------- Quiz state ---------------- */
let quizState = null; // { examType, questions: [{section, q, options, answer}], answers: [], index, timerInterval, secondsLeft }

function buildQuizFromBank() {
  const questions = [];
  SECTIONS.forEach(s => {
    QUESTION_BANK[s.key].forEach(item => {
      questions.push({ section: s.key, q: item.q, options: item.options, answer: item.answer });
    });
  });
  return questions;
}

async function buildQuizFromAI(examType, countPerSection) {
  const apiKey = getApiKey();
  const schema = {
    type: "OBJECT",
    properties: Object.fromEntries(SECTIONS.map(s => [s.key, {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          correctIndex: { type: "INTEGER" },
        },
        required: ["question", "options", "correctIndex"],
      },
    }])),
    required: SECTIONS.map(s => s.key),
  };

  const prompt = `Generate ${countPerSection} fresh multiple-choice practice questions for EACH of these sections, in the style of Indian competitive exams (${examType}): Quantitative Aptitude, Reasoning, English, General Awareness.
Each question must have exactly 4 options and one correct answer (correctIndex 0-3).
Keep questions at a standard prelims difficulty level. Ensure all factual questions (especially General Awareness) are accurate and unambiguous.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from the model.');
  const parsed = JSON.parse(text);

  const questions = [];
  SECTIONS.forEach(s => {
    (parsed[s.key] || []).forEach(item => {
      questions.push({ section: s.key, q: item.question, options: item.options, answer: item.correctIndex });
    });
  });
  return questions;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function startQuiz() {
  const examType = document.getElementById('quizExamType').value;
  const source = getSelectedSource();
  const statusEl = document.getElementById('quizStatus');
  const timerMinutes = parseInt(document.getElementById('quizTimer').value, 10);

  if (source === 'ai' && !getApiKey()) {
    pendingAiStart = startQuiz;
    openApiKeyModal();
    return;
  }

  document.getElementById('startQuizBtn').disabled = true;
  statusEl.textContent = source === 'ai' ? 'Generating fresh questions with AI…' : 'Loading questions…';

  let questions;
  try {
    if (source === 'ai') {
      const count = parseInt(document.getElementById('aiQuestionCount').value, 10);
      questions = await buildQuizFromAI(examType, count);
    } else {
      questions = buildQuizFromBank();
    }
  } catch (err) {
    statusEl.textContent = `Couldn't generate questions: ${err.message}. Try the built-in bank instead.`;
    document.getElementById('startQuizBtn').disabled = false;
    return;
  }

  if (!questions || questions.length === 0) {
    statusEl.textContent = 'No questions available. Try the built-in bank instead.';
    document.getElementById('startQuizBtn').disabled = false;
    return;
  }

  quizState = {
    examType,
    questions,
    answers: new Array(questions.length).fill(null),
    index: 0,
    secondsLeft: timerMinutes > 0 ? timerMinutes * 60 : null,
    timerInterval: null,
  };

  document.getElementById('startQuizBtn').disabled = false;
  statusEl.textContent = '';
  document.getElementById('quizSetup').style.display = 'none';
  document.getElementById('quizResults').style.display = 'none';
  document.getElementById('quizActive').style.display = 'block';

  if (quizState.secondsLeft) {
    quizState.timerInterval = setInterval(tickTimer, 1000);
  }
  renderQuizQuestion();
}

function tickTimer() {
  quizState.secondsLeft--;
  const display = document.getElementById('quizTimerDisplay');
  const mins = Math.floor(quizState.secondsLeft / 60);
  const secs = quizState.secondsLeft % 60;
  display.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  if (quizState.secondsLeft <= 60) display.classList.add('low-time');
  if (quizState.secondsLeft <= 0) {
    clearInterval(quizState.timerInterval);
    finishQuiz();
  }
}

function renderQuizQuestion() {
  const { questions, index, answers } = quizState;
  const item = questions[index];
  document.getElementById('quizProgress').textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById('quizSectionLabel').textContent = SECTIONS.find(s => s.key === item.section).label;
  document.getElementById('quizQuestion').textContent = item.q;

  const display = document.getElementById('quizTimerDisplay');
  if (quizState.secondsLeft !== null) {
    const mins = Math.floor(quizState.secondsLeft / 60);
    const secs = quizState.secondsLeft % 60;
    display.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  } else {
    display.textContent = 'No timer';
  }

  const optionsEl = document.getElementById('quizOptions');
  const letters = ['A', 'B', 'C', 'D'];
  optionsEl.innerHTML = item.options.map((opt, i) => `
    <div class="quiz-option ${answers[index] === i ? 'selected' : ''}" data-i="${i}">
      <div class="quiz-option-bubble">${letters[i]}</div>
      <div class="quiz-option-text">${opt}</div>
    </div>
  `).join('');

  optionsEl.querySelectorAll('.quiz-option').forEach(el => {
    el.addEventListener('click', () => {
      quizState.answers[index] = parseInt(el.dataset.i, 10);
      renderQuizQuestion();
    });
  });

  document.getElementById('quizPrevBtn').disabled = index === 0;
  document.getElementById('quizNextBtn').textContent = index === questions.length - 1 ? 'Finish test' : 'Next →';
}

function setupQuizNav() {
  document.getElementById('quizPrevBtn').addEventListener('click', () => {
    if (quizState.index > 0) { quizState.index--; renderQuizQuestion(); }
  });
  document.getElementById('quizNextBtn').addEventListener('click', () => {
    if (quizState.index < quizState.questions.length - 1) {
      quizState.index++;
      renderQuizQuestion();
    } else {
      finishQuiz();
    }
  });
}

function finishQuiz() {
  if (quizState.timerInterval) clearInterval(quizState.timerInterval);
  document.getElementById('quizActive').style.display = 'none';
  document.getElementById('quizResults').style.display = 'block';

  const sectionScores = {};
  SECTIONS.forEach(s => { sectionScores[s.key] = { correct: 0, total: 0 }; });

  quizState.questions.forEach((item, i) => {
    sectionScores[item.section].total++;
    if (quizState.answers[i] === item.answer) sectionScores[item.section].correct++;
  });

  const grid = document.getElementById('quizResultsGrid');
  grid.innerHTML = SECTIONS.map(s => {
    const sc = sectionScores[s.key];
    const pct = sc.total > 0 ? ((sc.correct / sc.total) * 100).toFixed(0) : '—';
    return `<div class="result-row"><span>${s.label}</span><span class="mono">${sc.correct}/${sc.total} (${pct}%)</span></div>`;
  }).join('');

  quizState.sectionScores = sectionScores;
}

function saveQuizResult() {
  const today = new Date().toISOString().slice(0, 10);
  const s = quizState.sectionScores;
  db.run(
    `INSERT INTO mocks
      (test_date, exam_type, quant, quant_total, reasoning, reasoning_total, english, english_total, gk, gk_total, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [today, quizState.examType,
     s.quant.correct, s.quant.total,
     s.reasoning.correct, s.reasoning.total,
     s.english.correct, s.english.total,
     s.gk.correct, s.gk.total,
     'Taken in-app']
  );
  persist();
  renderAll();
  resetQuizToSetup();
}

function resetQuizToSetup() {
  quizState = null;
  document.getElementById('quizResults').style.display = 'none';
  document.getElementById('quizActive').style.display = 'none';
  document.getElementById('quizSetup').style.display = 'block';
  document.getElementById('quizTimerDisplay').classList.remove('low-time');
}

/* ---------------- Init ---------------- */
async function main() {
  await initDB();
  buildSectionInputs();
  loadProfile();
  renderAll();

  document.getElementById('mockForm').addEventListener('submit', handleMockSubmit);
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  document.getElementById('candidateName').addEventListener('input', updateInitials);
  document.getElementById('targetDate').addEventListener('change', updateCountdown);
  document.getElementById('exportBtn').addEventListener('click', exportCSV);

  setupApiKeyModal();
  setupModeTabs();
  setupSourceToggle();
  setupQuizNav();
  document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
  document.getElementById('saveQuizResultBtn').addEventListener('click', saveQuizResult);
  document.getElementById('retakeQuizBtn').addEventListener('click', resetQuizToSetup);
}

main();
