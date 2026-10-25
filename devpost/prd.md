---
doc: prd
status: approved
---
# HG Decision Copilot — Product Requirements

A single dark-mode browser screen where the learner (later, multi-agent teams) pastes messy tasks and gets duplicates across agents grouped with matching words, plus a simple prioritized list and abandoned-task alerts — every result with a brief explanation.
Source: `scope.md > The Unique Kernel`, `scope.md > What "Working" Looks Like`.

## The Core Journey
1. Open the page. One screen with a paste box and controls ("una sola pantalla").
2. Paste several messy lines at once ("Permitir pegar múltiples líneas juntas.").
3. Press Analyze.
4. See duplicate groups first (kernel), then the prioritized list, then abandoned alerts.
5. Each item shows a brief explanation with criteria and concrete matches.
6. Optionally adjust the abandonment threshold (default 7 days), export JSON/CSV, or save locally.

## Screens and Layout
One screen, no horizontal scroll at any width. Wide: input column left, results right. Narrow: stacked. Results order: Duplicates → Priorities → Abandoned.

## Look and Feel
Learner direction: "Diseño minimalista, profesional, claro, una sola pantalla, sin scroll horizontal, modo oscuro preferido." Dark background, restrained accent, system fonts, no decoration.

## Features and Behavior

### Pasting Messy Tasks
Source: `scope.md > The Core Loop`. Each line needs at minimum the task text. Optional per line: responsible agent, last-activity date, status, urgency, value (and impact, used by prioritization). "Si faltan datos, no inventarlos."
- [ ] A multi-line paste with mixed formats parses into one task per non-empty line.
- [ ] Fields not present are left empty and shown as missing, never guessed.
- [ ] A line with only text is still a valid task.

### Duplicate Groups (kernel)
Source: `scope.md > The Unique Kernel`. Deterministic comparison of normalized shared words, irrelevant words removed, with a similarity score and visible evidence.
- As the learner, I want tasks that mean the same thing grouped, so two agents don't do the same work.
  - [ ] Two differently worded tasks about the same thing appear in one group.
  - [ ] Each group shows the shared words and a similarity score.
  - [ ] Groups whose tasks belong to different agents are marked as cross-agent.
  - [ ] Near-miss tasks (sharing only generic or one word, e.g. login vs. logout bug) are NOT grouped.

### Prioritized List
Source: `scope.md > The POC Boundary`. Criteria: valor, urgencia, antigüedad, impacto, 25% each initially. Latest learner decision supersedes the earlier "esfuerzo".
- [ ] Tasks ordered by score, top first.
- [ ] Each shows per-criterion contribution; missing criteria shown as "no data" and excluded (weights renormalized over present criteria; coverage like "2/4 criteria" shown).
- [ ] A task with no criteria data shows "no data" rather than a score.

### Abandoned-Task Alerts
Source: `scope.md > The POC Boundary`.
- [ ] Tasks with last activity older than N days (default 7, user-configurable) are flagged with their days inactive.
- [ ] Tasks without a date are listed as "no information", not abandoned.
- [ ] Tasks with a done status are not flagged.

### Export and Local Save
Learner condition: "almacenamiento local opcional y exportación JSON/CSV."
- [ ] Export JSON and CSV of the analysis downloads a file.
- [ ] Optional "remember input" toggle keeps the pasted text in the browser only.

## States and Boundaries
- **Empty input** — a short prompt to paste tasks.
- **No duplicates found** — the section says so explicitly.
- **No date** — "no information" in abandoned section.
- **Persistence** — off by default; only when the user enables it, in this browser only.
- **Offline** — works with no network.

## Product Decisions
- Kernel = dedup between agents with matching words and brief explanation (2026-10-25 15:09).
- Flexible line input; missing data never invented.
- Abandoned = 7 days, configurable; no date → "sin información".
- Priority = valor, urgencia, antigüedad, impacto, 25% each; missing data gets no score.
- Deterministic normalized-word comparison with score and evidence; negative tests against false duplicates.
- Minimal, professional, one screen, no horizontal scroll, dark mode.
- 100% offline, no paid APIs, no mandatory dependencies, new code, optional local storage, JSON/CSV export.

## What We're Building
Paste → analyze → duplicate groups with evidence → prioritized list with per-criterion reasons → abandoned alerts → export / optional save.

## Deferred From the POC
- Team use with multiple people — "luego".
- Editing weights in the UI — weights are fixed at 25% for now (not requested).

## Possible Later Enhancements
- Marking a duplicate as merged; synonym lists across languages.

## Non-Goals
- Complex integrations, execution automation, paid services (learner cut).
- Any network call or AI model (learner: offline local rules).

## Open Questions
None blocking. (Effort was dropped in favour of antigüedad and impacto by the learner's latest answer.)
