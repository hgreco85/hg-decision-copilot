---
doc: spec
status: approved
---
# HG Decision Copilot — Technical Spec

## How This Works, In Plain Language
One web page that runs entirely in your browser, offline. You paste text; small JavaScript files split it into tasks, compare their normalized words to find duplicates (with a similarity score and the shared words as evidence), score priority with simple rules (valor, urgencia, antigüedad, impacto, 25% each, skipping missing data), and flag tasks inactive longer than a threshold you set. No server, no AI service, no dependencies. The learner chose "Reglas locales y comparación de texto, gratis y offline."

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.
Paste → Parser builds task objects → Duplicate Detector compares every pair, groups matches and records shared words + score → Prioritizer computes per-criterion scores over present data → Abandonment Checker compares dates with today and the threshold → Renderer shows Duplicates, Priorities, Abandoned → Exporter builds JSON/CSV on demand; optional localStorage keeps the input.

## Stack
- Plain HTML + CSS + vanilla JavaScript, no framework, no build, no dependencies. Learner choice ("Web simple en el navegador", "sin dependencias externas obligatorias"). Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- Logic files are classic scripts that also export for Node (`module.exports` when present), so `index.html` opens directly from disk (`file://`) — ES modules are blocked on `file://` in Chrome.
- Similarity: Jaccard over normalized token sets (lowercase, accents stripped, ES/EN stopwords and generic task verbs removed, light plural trim, plus a small fixed ES→EN word map such as redactar→write, pasos→step, migrar→migrate, so the same work in two languages shares words). Duplicate if score ≥ 0.6 and ≥ 2 shared tokens. Learner agreed: "Comparación determinística por palabras normalizadas en común".
- Tests: Node built-in `node --test` (Node ≥ 18). Docs: https://nodejs.org/api/test.html
- All code new; no prior HG code.

## Where It Runs and How Someone Tries It
Browser only; double-click `index.html` (or `python3 -m http.server` and open http://localhost:8000). No keys. Tests: `node --test tests/`. Demo: open page → "Load sample" (or paste `samples/messy-tasks.txt`) → Analyze. Deployment optional, not planned (no Railway).

## Look and Feel
Dark mode (near-black background, light gray text, one teal accent, amber for warnings), system font stack, compact cards, single screen, `max-width:100%`, wrapping text, no horizontal scroll (verified at 390px). Minimal, professional, clear.

## Components

### Parser
`src/parser.js` → `parseTasks(text)`. Splits lines; strips bullets/numbering; extracts optional fields: agent (`@name`, `[Name]`, `agent:/agente:` or `Name:` prefix), date (ISO `YYYY-MM-DD`, `DD/MM/YYYY`, or `last:/última:`), status (`status:/estado:` or keywords todo/doing/done/hecho/bloqueado), urgency/value/impact (`urgencia:/urgency:`, `valor:/value:`, `impacto:/impact:` with alta/media/baja, high/medium/low or 1–5). Missing → `null`. PRD ref: `prd.md > Pasting Messy Tasks`.

### Duplicate Detector
`src/dedup.js` → `normalize`, `tokenize`, `similarity`, `findDuplicates(tasks, opts)`. Union-find grouping; each group keeps pairs with score and shared tokens; `crossAgent` true when ≥2 distinct agents. PRD ref: `prd.md > Duplicate Groups (kernel)`.

### Prioritizer
`src/prioritize.js` → `prioritize(tasks, {today})`. Criteria 0–1: valor, urgencia, impacto from levels; antigüedad from days since last activity (capped 30 days). Weight 25% each, renormalized over present criteria; `coverage` = present/4; tasks with 0 criteria get `score:null`, ranked last as "no data". Done tasks excluded. PRD ref: `prd.md > Prioritized List`.

### Abandonment Checker
`src/abandoned.js` → `checkAbandoned(tasks, {today, days=7})` → `{abandoned, noInfo}`. PRD ref: `prd.md > Abandoned-Task Alerts`.

### Exporter
`src/export.js` → `toJSON(result)`, `toCSV(result)`. PRD ref: `prd.md > Export and Local Save`.

### Renderer
`src/app.js` wires DOM: analyze, threshold input, sample loader, export buttons, optional localStorage toggle. PRD ref: `prd.md > Screens and Layout`, `prd.md > States and Boundaries`.

## Data Model
In memory: `Task {id, raw, text, agent, lastActivity (YYYY-MM-DD|null), status, urgency, value, impact}`; `Group {taskIds, pairs:[{a,b,score,shared}], crossAgent, agents}`; `Ranked {taskId, score|null, coverage, parts}`; `Abandoned {taskId, days}`. localStorage key `hgdc.input` only if the user enables "Remember input".

## File Structure
```
hg-decision-copilot/
├── index.html            # single screen
├── styles.css            # dark, minimal, no horizontal scroll
├── src/
│   ├── parser.js         # Parser
│   ├── dedup.js          # Duplicate Detector (kernel)
│   ├── prioritize.js     # Prioritizer
│   ├── abandoned.js      # Abandonment Checker
│   ├── export.js         # JSON/CSV
│   ├── sample.js         # embedded copy of the sample for the "Load sample" button
│   └── app.js            # Renderer + wiring
├── samples/messy-tasks.txt  # labeled sample data
├── tests/*.test.js       # node --test, includes negative cases
├── evidence/             # screenshots + test output
├── README.md, LICENSE (MIT)
└── devpost/              # planning docs, checklist, app map
```

## External Services and Dependencies
None. Cost USD 0.

## Important Failure Modes
- **Reworded duplicates with no shared words / cross-language synonyms** → not grouped; documented limit.
- **Generic shared words causing false duplicates** → stopwords + generic verbs removed, min 2 shared tokens, threshold 0.6; negative tests.
- **Ambiguous dates (DD/MM vs MM/DD)** → DD/MM assumed (Argentina); documented.

## What Was Simplified and Why
- **Token-overlap similarity** instead of embeddings — learner chose offline deterministic rules.
- **Fixed 25% weights** instead of UI-editable weights — not requested; constants in `src/prioritize.js`.

## Decisions and Open Issues
- Learner: browser (Q11), offline rules (Q12), and all four decisions of 2026-10-25 15:09 ART.
- Derived implementation details (agent): classic scripts for `file://`, threshold 0.6/min 2 shared, antigüedad cap 30 days.
- Learner uncertainty: none raised; the negative-case tests are the agreed evidence that dedup doesn't over-group.
- Open: none blocking.
