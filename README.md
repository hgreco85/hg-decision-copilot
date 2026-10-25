# HG Decision Copilot

Paste the messy task lists your AI coding agents leave behind (Codex, Claude, Cursor, Gemini, Devin…). The app shows, on one screen:

1. **Duplicates across agents.** Reworded copies of the same work, with a similarity score and the shared words as evidence.
2. **Priorities.** A 0–100 score from *valor, urgencia, antigüedad, impacto*, 25% each. Missing criteria are excluded and shown as "no data". Scores are never invented.
3. **Abandoned tasks.** Tasks inactive for more than N days (default 7, configurable). Tasks with no date are listed as "no information".

It runs 100% offline. There are no APIs, no server, no dependencies, and no build step. Input stays in your browser. Saving it to `localStorage` is optional, and you can export the results as JSON or CSV.

## Run

- Double-click `index.html`, or run `python3 -m http.server` and open http://localhost:8000.
- Press **Load sample** to try `samples/messy-tasks.txt`. All sample data is fictional.
- Open `index.html?demo=1` to auto-load the sample.
- `index.html` loads its sibling `styles.css` and `src/*.js`, so keep the folder together. For a single self-contained file, use `dist/hg-decision-copilot.html`, rebuilt with `node tools/build-standalone.js`.

## Input format

Use one task per line. Every field is optional:

- **Agent:** `[Codex]`, `(Claude)`, `@devin`, `Gemini:` or `agent: X`.
- **Date:** `2026-10-20` or `20/10/2026`.
- **Fields:** `estado:`, `urgencia:`, `valor:` and `impacto:`. Values can be `alta/media/baja`, `high/med/low` or `1–5`.

Separate fields with `|` or `;`.

## How duplicates are found

Detection is deterministic and needs no AI:

1. Words are lowercased and accents are stripped.
2. ES/EN stopwords and generic verbs (fix, add, revisar…) are removed, and light plurals are trimmed.
3. A small fixed ES→EN word map is applied.
4. Each pair of tasks gets a Jaccard similarity score.

A pair counts as a duplicate when the score is at least 0.6 and the tasks share at least 2 words.

## Tests

```
node --test tests/
```

There are 24 tests, including negative cases such as login vs logout bug, same verb with a different object, and single-word overlap. The last output is in `evidence/test-output.txt`.

## Project layout

`src/parser.js` · `src/dedup.js` · `src/prioritize.js` · `src/abandoned.js` · `src/export.js` · `src/app.js` · `index.html` · `styles.css` · `tests/` · `samples/` · `evidence/` · `devpost/` (planning docs and app map)

## Limits

- Matching is word-based, so true synonyms outside the small map are missed.
- Each line is treated as one task.
- "Today" is your device's date.

## Third-party

`.agents/`, `.claude/`, `agent/` and `skills-lock.json` contain the Devpost *Build With AI: Basics* Learn Skill Pack (`challengepost/learn-ai-basics`, MIT). It was used to plan and build this project. It is not part of the app.

## License

MIT, see `LICENSE`.
