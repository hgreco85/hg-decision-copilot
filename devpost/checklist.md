---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Paste messy tasks and see cross-agent duplicate groups with evidence**
  Becomes usable: Pasted lines become tasks, and reworded copies of the same work from different agents are grouped with a similarity score and the shared words.
  Why now: Duplicate detection is the kernel; proving it first on realistic messy text de-risks everything else.
  PRD ref: `prd.md > Pasting Messy Tasks`, `prd.md > Duplicate Groups`
  Spec ref: `spec.md > Components` (Parser, Duplicate Detector), `spec.md > File Structure`
  Build: `src/parser.js`, `src/dedup.js`, `samples/messy-tasks.txt`, `tests/parser.test.js`, `tests/dedup.test.js`.
  Verify (mechanical): `node --test tests/` passes; the sample yields exactly groups 1+2, 3+4 and 11+12; login vs logout and other negatives are not grouped.
  Learner check: Read the three groups found in the sample and say whether each is really the same work.
  Commit: `Parse messy tasks and detect cross-agent duplicates`

- [x] **2. Priorities without invented data, abandoned alerts and export**
  Becomes usable: Each open task gets a 0–100 score from valor, urgencia, antigüedad and impacto, with missing criteria shown as "no data". Tasks inactive longer than N days are flagged, and the results can be exported as JSON or CSV.
  Why now: Thin, rule-based layers that depend on the parser's task shape.
  PRD ref: `prd.md > Prioritized List`, `prd.md > Abandoned-Task Alerts`, `prd.md > Export and Local Save`
  Spec ref: `spec.md > Components` (Prioritizer, Abandonment Checker, Exporter)
  Build: `src/prioritize.js`, `src/abandoned.js`, `src/export.js`, `tests/priority-abandoned.test.js`.
  Verify (mechanical): Tests cover renormalized weights, null score with 0 criteria, done tasks excluded, the 7-day exclusive boundary, a custom threshold, and CSV escaping.
  Learner check: Change "Abandoned after" to 3 and to 30 and confirm the list changes the way you expect.
  Commit: `Add rule-based priorities, abandoned alerts and JSON/CSV export`

- [x] **3. One dark offline screen that ties it together**
  Becomes usable: Opening `index.html` from disk lets you paste or load the sample, press Analyze, see Duplicates → Priorities → Abandoned, export, and optionally remember the input in this browser.
  Why now: Wires the verified logic into the single screen from the PRD.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components` (Renderer), `spec.md > Look and Feel`
  Build: `index.html`, `styles.css`, `src/app.js`, `src/sample.js`.
  Verify (mechanical): Headless Chrome at 1440 and 390 px with `index.html?demo=1` renders all three sections with no horizontal scroll (`evidence/desktop.png`, `evidence/mobile.png`).
  Learner check: Double-click `index.html`, press Load sample, and tell me whether the screen reads the way you pictured.
  Commit: `Add offline single-page UI with export and optional local save`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — shared final-review session (small build)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Focused alternative prepared, not yet done with the learner. Evidence: the sanity run found real duplicate pairs scoring 0.50 and 0.57, below the 0.6 threshold, while the login/logout near miss scored 0.14. Fixed with a fixed ES→EN word map instead of lowering the threshold. Locked in by `tests/dedup.test.js` (the sample test and the negative cases).
Route and stops: `src/parser.js > parseLine` → `src/dedup.js > tokenize / findDuplicates` → `src/prioritize.js > scoreTask` (reference route; not yet walked live).
Edit outcome: not applicable yet — suggested edit: change `threshold` in `findDuplicates` and re-run `node --test tests/`.
Reflection: not yet offered.
Activity mode: focused alternative (pending learner session)

## Revisions

- Added a small fixed ES→EN word map to dedup instead of lowering the threshold — the sample showed the same task written in Spanish and English scored only 0.50–0.57, and a lower threshold would have weakened the negatives.
- Trailing lowercase status after a dash (for example "— pendiente") is now parsed as a status — the sample showed it leaking into the task text.
- Added `index.html?demo=1` to auto-load the sample — headless screenshots cannot paste.
