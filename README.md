# Prep Sheet — Exam Readiness Tracker

A personal SSC/Banking exam prep tracker, designed to look like the two
objects every Indian competitive exam aspirant knows by heart: the
**admit card** and the **OMR answer sheet**. Log your mock test scores,
and it tracks your readiness section-by-section, flags your weakest
area, and shows your trend over time — using a real SQL database running
entirely in your browser.

## Why this project, and why it's different

Most "AI portfolio" projects on resumes right now are the same handful
of ideas: a chatbot wrapper, a document summarizer, a Titanic-dataset
analysis. This is deliberately not that. It solves a problem I actually
have — tracking my own SSC/banking prep — and it's built around the
specific visual language of Indian competitive exams, not a generic
dashboard template.

## How it works (the part worth explaining in an interview)

**This app runs a real SQLite database inside your browser** — not
JavaScript arrays pretending to be a database. It uses `sql.js`, which
compiles SQLite to WebAssembly, so every "save," "delete," and dashboard
calculation is an actual SQL query (`INSERT`, `DELETE`, `SELECT ...
AVG(...) GROUP BY`, `ON CONFLICT DO UPDATE`) — the same skill tested in
Data Analyst interviews, genuinely applied, not simulated.

**You can take a full mock test directly in the app** — no need to find
a score elsewhere and type it in. Answer via OMR-style bubbles (A/B/C/D),
with an optional timer, and it auto-grades and offers to save the result
straight into your SQL history with one click. Questions come from
either:
- A **built-in question bank** (`js/questionBank.js`) — 40 hand-written,
  verified questions across all four sections, always available, no
  internet or API key needed after the page loads.
- **AI-generated fresh questions** (optional) — calls the Gemini API
  with a structured-output schema to generate new practice questions on
  demand, so you're not limited to the same 40 questions every time.

```
Browser
  ├─ sql.js (SQLite compiled to WebAssembly)
  │    └─ mocks table   — every logged test, section-wise
  │    └─ profile table — your name, target exam, target date
  │
  ├─ On every change: db.export() → serialized to localStorage
  │    (so your data survives closing the tab, entirely on your device)
  │
  ├─ Quiz engine (js/app.js): builds a question set from either source,
  │    tracks answers question-by-question, auto-grades on submit,
  │    writes the result straight into the mocks table via SQL INSERT
  │
  └─ Dashboard renders from live SQL queries:
       - AVG(score%) per section → the OMR bubble fill level
       - MIN(section average) → the "Priority Section" flag
       - Chronological scores → the trend sparkline
```

No backend and no required API key — this project fully works offline
(after first load) with zero setup. The AI question generation is an
optional enhancement, not a dependency.

## Folder structure

```
exam-tracker/
├── index.html          # Hall-ticket header, quiz UI, dashboard, history table
├── css/
│   └── style.css        # Paper/ink visual system, OMR bubble styling
├── js/
│   ├── questionBank.js   # 40 built-in, verified practice questions
│   └── app.js             # SQLite setup, quiz engine, all SQL queries, rendering
└── README.md
```

## How to run it in VS Code

1. Open this folder in VS Code: **File → Open Folder** → select `exam-tracker`.
2. Install the **Live Server** extension (search it in Extensions, one click).
3. Right-click `index.html` → **"Open with Live Server."**
4. It opens in your browser and works immediately — no setup, no build step.

(You can also just double-click `index.html` directly — it works the
same way. Live Server just gives you auto-reload while editing.)

**Note:** the app loads the SQLite engine from a CDN on first load, so
you need an internet connection the first time you open it in a
browser session. After that, your logged data is stored locally on your
device and works offline.

## Using it

1. Fill in your name and target exam in the hall ticket header, click **Save**.
2. In Section A, choose **"Take a mock test"** — pick your exam type, question
   source (built-in bank or AI-generated), and a timer, then **Start test**.
3. Answer by clicking the A/B/C/D bubble for each question, then **Next**.
4. On finishing, see your section-wise score, then **Save this result to my
   tracker** — it's written straight into your SQL history, no manual typing.
5. Already took a test elsewhere (coaching app, printed paper)? Use the
   **"Log existing score"** tab instead to enter marks directly.
6. Watch the OMR bubbles in Section B fill in based on your average accuracy
   per section, with your weakest section flagged automatically.
7. Export your full history as a CSV any time from Section C.

## Design decisions worth explaining in an interview

- **The hall ticket / OMR concept** is the signature design choice —
  built specifically for this subject rather than reusing a generic
  dashboard look, because the objects are instantly recognizable to
  anyone who's taken one of these exams.
- **Real SQL, not mock data structures** — `db.run()` and `db.exec()`
  calls in `app.js` are genuine SQLite queries, including an `ON
  CONFLICT DO UPDATE` upsert for the profile table.
- **No AI/LLM dependency** — deliberately. This project exists to prove
  data modeling and SQL skill on its own, not to lean on a prompt again.
- **Data never leaves the device** — no server, no account, no tracking.
  Good practice to mention when asked about privacy-by-design.

## Honest limitations (good to know, good to mention if asked)

- Data is stored per-browser, per-device — it won't sync across devices
  unless you manually export/import the CSV.
- Currently tracks four fixed sections (Quant, Reasoning, English,
  General Awareness). A natural v2 improvement: add a fifth
  "Banking Awareness / Computer Knowledge" column for banking-specific
  prep, and a proper Import CSV feature to restore from backup.


