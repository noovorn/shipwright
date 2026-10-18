---
name: code-review
description: Use when asked to review a PR, diff, branch, commit, or set of changes, or before declaring your own non-trivial change ready. Produces prioritized, evidence-backed findings (blocking / should-fix / nit) instead of style chatter.
---

# Code Review

Review like a senior engineer who will be paged at 3 a.m. if this breaks.

## 1. Get the full picture

- Get the diff: `git diff <base>...HEAD` (three dots = changes since merge-base). For a PR: `gh pr diff <n>` and `gh pr view <n>` for the description.
- Read the PR description / task. Review against **intent**, not just syntax.
- For every changed function, open the **whole file** and the callers (`grep -rn "<name>("`). Most serious bugs live in the interaction between the diff and code that did not change.

## 2. Check, in priority order

1. **Correctness** — Does it do what it claims? Off-by-one, inverted conditions, wrong variable, unhandled `null`/`undefined`/`None`, async without await, mutation of shared state, integer overflow, timezone and locale handling.
2. **Security** — Injection (SQL, shell, path, template), authz checks on every new endpoint, secrets in code or logs, unsafe deserialization, SSRF, missing input validation at trust boundaries.
3. **Data & compatibility** — Migrations reversible and safe on large tables? API/schema changes backward compatible? Breaking changes flagged?
4. **Failure modes** — What happens on timeout, partial failure, retry, duplicate delivery, empty input, huge input?
5. **Tests** — Do tests cover the new behavior and the bug being fixed? Would they fail if the change were reverted?
6. **Performance** — N+1 queries, unbounded loops/memory, work inside hot paths, missing indexes.
7. **Maintainability** — Names, dead code, duplication, misleading comments. Lowest priority.

## 3. Verify before you claim

- If you claim a bug, show the input that triggers it. Run it if you can.
- If you are unsure, phrase it as a question, not a finding.
- Do not flag style that a formatter or linter in the repo already enforces.

## 4. Output

```
## Summary
<2–3 sentences: what the change does and overall verdict: approve / approve with fixes / request changes>

## 🔴 Blocking
- `path/file.ts:42` — <problem>. <why it matters>. <suggested fix>.

## 🟡 Should fix
- ...

## 🟢 Nits (optional)
- ...

## ✅ Good
- <1–2 specific things done well>
```

Every finding has a `file:line`, a concrete reason, and a suggestion. No finding without a location. If there are no blocking issues, say so plainly.

## Self-review mode

When reviewing your own change before handing it over, run the same checklist on `git diff` and fix blocking items yourself instead of reporting them.
