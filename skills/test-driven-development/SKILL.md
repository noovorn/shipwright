---
name: test-driven-development
description: Use when implementing a new feature, fixing a bug, or changing behavior in a codebase that has (or should have) tests. Drives work through red → green → refactor with a test written and seen failing before any production code.
---

# Test-Driven Development

## The loop

1. **Red** — Write ONE test for the next small behavior. Run it. Watch it fail, and confirm it fails *for the right reason* (assertion failure, not import error or typo).
2. **Green** — Write the minimum production code to pass. Hard-coding is allowed at this step if the next test will force generalization.
3. **Refactor** — With tests green, remove duplication and improve names. Re-run tests after every change.
4. Repeat. Commit at each green if the user wants granular history.

A test you never saw fail proves nothing. If a new test passes immediately, either the behavior already exists or the test is wrong — find out which.

## Before the first test

- Find the project's test command (check `package.json` scripts, `Makefile`, `pyproject.toml`, `Cargo.toml`, CI config). Run it once to get a baseline. Note pre-existing failures so you do not blame yourself or hide them.
- Find an existing test near the code you will touch and copy its style: framework, fixtures, naming, file location.

## What to test

- **Behavior through the public interface**, not private helpers or implementation details.
- One reason to fail per test. Name tests as sentences: `rejects_expired_token`, `returns_empty_list_when_no_matches`.
- Cover: the happy path, each boundary (0, 1, many, max, empty, null), and each error the caller must handle.
- For bug fixes: the first test reproduces the bug exactly as reported.

## Mocks

- Mock at system boundaries only: network, clock, filesystem, randomness, third-party APIs.
- Never mock the unit under test. Prefer real collaborators when they are fast and deterministic.
- If a test needs five mocks, the design is telling you something — mention it.

## Anti-patterns to refuse

- Writing production code first and "adding tests after" while calling it TDD.
- Editing a test's expected value to match buggy output.
- `skip`, `xfail`, `.only`, or commented-out tests left in the diff.
- Tests that assert a mock was called with whatever the implementation happens to pass.
- Snapshot tests used to avoid thinking about what the output should be.

## Done means

- All new behavior has a test that was seen red then green.
- Full suite passes (or only pre-existing failures remain, listed explicitly).
- No focused/skipped tests introduced.
