---
name: verify-before-done
description: Use immediately before saying a task is done, fixed, complete, working, or passing, and before creating a commit or PR. Requires fresh, shown evidence for every claim of success.
---

# Verify Before Done

"Should work" is not evidence. Every claim of success needs output you ran **in this session, after your last edit**.

## Checklist

Run what applies to the project and show the result:

- [ ] **Build / compile / type-check** passes
- [ ] **Tests** — the relevant suite passes; the new or changed behavior has a test
- [ ] **Lint / format** — clean, or only pre-existing issues
- [ ] **Run it** — the actual feature exercised end to end: hit the endpoint, run the CLI, load the page, execute the script with real input
- [ ] **Acceptance criteria** from the task / plan each checked off with evidence
- [ ] **Diff review** — `git diff` read top to bottom: no debug prints, commented-out code, stray files, secrets, or unrelated changes
- [ ] **No silenced failures** — no new `skip`, `--no-verify`, `@ts-ignore`, `# type: ignore`, `eslint-disable`, or loosened assertions

## How to report

Use honest, specific language:

- ✅ "Tests pass: `npm test` → 142 passed, 0 failed."
- ✅ "Build passes; I could not run the e2e suite because it needs a database — please run `make e2e`."
- ❌ "Everything should be working now."
- ❌ "All tests pass" when you ran one file.

If something is unverified, say exactly what and why. Partial honesty beats a false "done".

## If a check fails

Do not report done. Fix it, or report the failure clearly with the output and your next step.
