# How the Skill Pack was used

I installed the Devpost *Build With AI: Basics* Learn Skill Pack (`challengepost/learn-ai-basics`) into the repo with `npx`. It is pinned in `skills-lock.json` and lives in `.agents/skills/`. I followed its stages in order, 1-start → 2-scope → 3-prd → 4-spec → 5-build → 6-ship:

- **Interview:** I answered the stage interviews in batches. The pack turned the answers into `devpost/scope.md`, `devpost/prd.md` and `devpost/spec.md`, and I approved each one.
- **Build:** I chose the pack's fast build mode. `devpost/checklist.md` tracks three thin slices: duplicate detection (the core), then priorities, abandonment and export, then the single offline screen. Each slice has a mechanical check and its own commit, and revisions are logged in the checklist.
- **Wrap-up:** at the end the pack produced `devpost/app-map.html`, a standalone map of the code with a reusable practice.
