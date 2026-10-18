---
name: safe-refactor
description: Use when restructuring, renaming, extracting, splitting, or cleaning up code without intending to change behavior. Guarantees behavior preservation through characterization tests and small, separately verified steps.
---

# Safe Refactor

A refactor changes structure, never behavior. If behavior changes, it is not a refactor — split it into a separate change.

## 1. Lock behavior first

- Run the existing tests for the area. If coverage is thin, write **characterization tests** that pin current behavior — including behavior that looks wrong. (Note suspected bugs for the user; do not fix them mid-refactor.)
- For pure functions, consider a quick table of input → current output.

## 2. Move in small steps

One mechanical transformation at a time:
- rename → run tests
- extract function → run tests
- move file and update imports → run tests
- inline / delete dead code (confirm zero references with grep and the type checker) → run tests

Never combine a refactor step with a behavior change, a dependency upgrade, or formatting of unrelated code.

## 3. Use the tools, not regex

- Prefer language-aware tooling: IDE/LSP rename, `tsc --noEmit`, `mypy`/`pyright`, `go vet`, `cargo check`, codemods (`jscodeshift`, `ast-grep`, `comby`).
- When you must use text search-and-replace, grep afterwards for leftovers in strings, comments, docs, configs, and dynamic lookups (reflection, `getattr`, string-built imports).

## 4. Check public surface

Anything exported, serialized, used over the network, stored in a DB, or referenced in config is a contract. Renaming it is a breaking change — keep a deprecated alias or flag it to the user.

## 5. Finish

- Full test suite + type checker + linter pass.
- Diff contains no behavior changes (re-read it with that question only).
- Summarize: what moved where, and any suspected bugs you pinned but did not fix.
