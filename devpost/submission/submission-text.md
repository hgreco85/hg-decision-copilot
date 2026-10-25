# Devpost submission text

**Project name:** HG Decision Copilot

**Tagline:** Paste your AI agents' messy task lists and see the duplicated work first. It runs 100% offline in one web page.

## Inspiration
When several AI coding agents work in parallel (Codex, Claude, Cursor, Gemini, Devin), their task lists drift. The same job gets assigned twice in different words, sometimes in different languages, and older tasks get quietly abandoned. I wanted a zero-cost tool that makes that overlap visible without sending my task lists anywhere.

## What it does
- Paste tasks one per line, in any rough format. Agent, date, status, urgency, value and impact are optional and get detected when present (for example `[Codex]`, `@devin`, `Claude:`, `2026-10-20`, `20/10/2026`, `urgencia: alta`).
- **Duplicates across agents (the core):** groups reworded copies of the same task and marks groups that span two or more agents. Each group shows a similarity score and the shared words as evidence.
- **Priorities:** a 0–100 score from value, urgency, age and impact, weighted equally. Missing criteria are excluded and shown as "no data", so nothing is invented.
- **Abandoned tasks:** flags tasks inactive for more than N days (default 7, adjustable). Undated tasks are listed as "no information".
- Exports results to JSON and CSV. Saving the input in the browser's localStorage is optional.

## How we built it
I planned it with the Devpost *Build With AI: Basics* Learn Skill Pack (scope → PRD → spec → build checklist), then built it in plain HTML, CSS and vanilla JavaScript, with no dependencies and no build step. The modules are a parser, a duplicate detector (normalized-token Jaccard plus union-find grouping), a prioritizer, an abandonment checker, an exporter and a renderer. Tests use Node's built-in `node --test`.

## Challenges we ran into
The first sanity run on the sample missed real duplicates written in Spanish by one agent and English by another (scores of 0.50 and 0.57 against a 0.6 threshold). Lowering the threshold would have let near misses like "fix login bug" vs "fix logout bug" through. Instead I added a small fixed Spanish→English word map and kept the threshold, with negative tests to hold the line. Chrome also blocks ES-module imports from `file://`, so the code uses classic scripts, which still run in Node tests.

## Accomplishments that we're proud of
- It works fully offline at USD 0, with no external services.
- Every duplicate group explains itself with its matched words.
- Missing data is never scored as if it existed.
- 24 passing tests, including negative cases.

## What we learned
Write the negative tests before tuning a matcher. They showed which fix was safe.

## What's next
- Let users mark a group as "not a duplicate".
- Make the ES↔EN word list editable.
- Support multi-line task blocks.

## Built with
HTML, CSS, JavaScript (vanilla), Node.js test runner (`node:test`), localStorage, Devpost Learn Skill Pack.

**Links:** https://github.com/hgreco85/hg-decision-copilot
