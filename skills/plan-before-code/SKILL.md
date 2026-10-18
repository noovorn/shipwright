---
name: plan-before-code
description: Use before any multi-file change, new feature, migration, or task that will take more than ~15 minutes of edits. Explores the codebase, surfaces unknowns, and writes a short verifiable plan before touching code.
---

# Plan Before Code

Ten minutes of reading saves an hour of rework. Do not edit files during this skill.

## 1. Restate the goal

Write the goal in one sentence plus explicit **acceptance criteria** — observable checks that will prove it is done (a command that passes, an endpoint that returns X, a UI state). If you cannot write them, ask the user.

## 2. Explore

- Locate the entry points: `grep -rn` for route names, CLI commands, component names, error strings from the task.
- Read the files you will change in full, plus one level of callers and callees.
- Find the existing pattern for this kind of change (an earlier similar feature, migration, or endpoint) and plan to follow it.
- Read project conventions: `README`, `CONTRIBUTING`, `CLAUDE.md` / `AGENTS.md`, lint and formatter config.

## 3. Surface unknowns

List anything that could change the plan: ambiguous requirements, missing credentials, unclear ownership, behaviors you could not confirm. Ask the user about the ones that block; make and **state** an assumption for the rest.

## 4. Write the plan

```
Goal: <one sentence>
Acceptance criteria:
- [ ] <observable check>
Approach: <2–4 sentences, and why this over the obvious alternative>
Steps:
1. <small, independently verifiable step> — verify: <how>
2. ...
Files touched: <list>
Risks / rollback: <what could break, how to undo>
Out of scope: <what you will deliberately NOT do>
```

Rules for steps:
- Each step leaves the code compiling and tests passing.
- Order so the riskiest unknown is resolved first.
- Prefer 3–8 steps. More means the task should be split.

## 5. Execute the plan

Follow the steps in order. After each, run its verification. If reality diverges from the plan, stop, update the plan, and tell the user what changed and why — do not silently improvise.
