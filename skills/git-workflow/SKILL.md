---
name: git-workflow
description: Use when creating commits, branches, or pull requests, writing commit messages or PR descriptions, or resolving merge conflicts. Produces atomic Conventional Commits and reviewer-friendly PRs, and never rewrites shared history without asking.
---

# Git Workflow

## Safety first

- Never `push --force` to `main`/`master` or a shared branch. On your own branch use `--force-with-lease`.
- Never `reset --hard`, `clean -fd`, `checkout -- .`, or delete branches with unpushed work without the user's explicit OK.
- Never use `--no-verify` to bypass hooks. If a hook fails, fix the cause.
- Run `git status` before and after every operation that changes state.

## Branches

`<type>/<short-kebab-description>` — e.g. `feat/oauth-login`, `fix/null-cart-total`. Branch from an up-to-date base.

## Commits

- **Atomic**: one logical change per commit; the build passes at every commit.
- Stage deliberately: `git add -p` or explicit paths. Never blindly `git add -A` — check for secrets, `.env`, build output, large binaries.
- **Conventional Commits**:
  ```
  <type>(<scope>): <imperative summary, ≤72 chars, no period>

  <body: WHY this change, what it affects, any trade-off. Wrap at 72.>

  <footer: Closes #123 / BREAKING CHANGE: ...>
  ```
  Types: `feat` `fix` `refactor` `perf` `test` `docs` `build` `ci` `chore` `revert`.
- Write the summary as "this commit will…": `fix(cart): handle empty discount code`, not `fixed stuff`.
- Follow the repo's existing style if it differs (check `git log --oneline -20`).

## Pull requests

Title in commit format. Body:

```
## What
<1–3 bullets>

## Why
<problem / issue link>

## How
<key decisions, anything non-obvious>

## Testing
<commands run + results; manual steps>

## Risk
<blast radius, rollback plan, migrations, feature flags>
```

Keep PRs small (aim < 400 changed lines). If larger, suggest a split.

## Merge conflicts

1. Understand both sides: `git log --merge -p <file>`.
2. Resolve to preserve the **intent** of both changes, not just to make markers disappear.
3. Re-run build and tests after resolving. Never commit with conflict markers (`grep -rn '^<<<<<<<\|^>>>>>>>' .`).
