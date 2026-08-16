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

## How it works 

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



