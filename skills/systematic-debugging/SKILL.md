---
name: systematic-debugging
description: Use when facing a bug, failing test, crash, flaky behavior, or error whose root cause is not yet proven. Enforces reproduce → hypothesize → isolate → fix-at-root → verify, and forbids guess-and-check patching.
---

# Systematic Debugging

You are debugging. Your job is to find the **root cause with evidence**, not to make the symptom disappear.

## Iron rules

1. **No fix without a reproduction.** If you cannot reproduce it, you are not debugging yet — you are guessing.
2. **No fix without a stated root cause.** Before editing code, write one sentence: "The bug happens because X, proven by Y."
3. **One variable at a time.** Never change two things and re-run.
4. **Three strikes.** If three fix attempts fail, STOP. Your mental model is wrong. Go back to Phase 2 and question an assumption you have not yet tested.

## Phase 1 — Reproduce

- Get the exact failing command, input, and full error output (not a summary).
- Write the smallest reproduction you can: ideally a failing automated test.
- Confirm it fails for the reason reported, not a different one.
- If flaky: run it N times (e.g. `for i in $(seq 20); do <cmd> || echo FAIL $i; done`) and record the failure rate.

## Phase 2 — Hypothesize

- Read the stack trace bottom-up and top-down. Open every frame that is project code.
- Check what changed: `git log -p --since="1 week" -- <path>`, `git diff main...HEAD`, dependency lockfile diffs.
- List 2–4 competing hypotheses. For each, name the observation that would **disprove** it.

## Phase 3 — Isolate

- Test the hypothesis that is cheapest to disprove first.
- Tools, in order of preference: a targeted assertion or log line → a debugger breakpoint → `git bisect run <test-cmd>` for regressions → binary-search by commenting out / stubbing.
- Record each result. Eliminated hypotheses stay eliminated.
- Remove all temporary logging before finishing.

## Phase 4 — Fix at the root

- Fix where the wrong value is **created**, not where it is **noticed**.
- Ask: "Where else could this same mistake exist?" Grep for the pattern and fix siblings, or list them for the user.
- Do not add defensive `try/except`, null checks, or retries that hide the cause unless the cause is genuinely external and you say so.

## Phase 5 — Verify

- The reproduction from Phase 1 now passes.
- Run the full relevant test suite, not just the one test.
- For flaky bugs, re-run the loop and show 0 failures.

## Report format

```
Root cause: <one sentence>
Evidence: <what proved it>
Fix: <what changed and why there>
Verified by: <commands run + result>
Related risk: <siblings found / none>
```

## Red flags — stop if you catch yourself thinking

- "Let me just try…" → you have no hypothesis.
- "It works now" without knowing why → it is not fixed.
- "Probably a race condition / caching / environment" with no evidence → test it.
- Increasing a timeout or sleep to make a test pass.
