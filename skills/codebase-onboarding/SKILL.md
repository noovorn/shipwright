---
name: codebase-onboarding
description: Use when starting work in an unfamiliar repository, when asked to explain how a codebase works, or when asked to create or update CLAUDE.md / AGENTS.md. Builds an accurate map of architecture, commands, and conventions from the code itself.
---

# Codebase Onboarding

Build a mental model from **evidence in the repo**, not from what projects like this usually look like.

## 1. Inventory (fast)

- `git ls-files | head -200` and `git ls-files | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30` for the shape.
- Manifests: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `Gemfile`, `composer.json`, `*.csproj`.
- Tooling: CI config (`.github/workflows`, `.gitlab-ci.yml`), `Makefile`, `Dockerfile`, `docker-compose.yml`, lint/format config.
- Docs: `README`, `CONTRIBUTING`, `docs/`, ADRs, existing `CLAUDE.md` / `AGENTS.md`.
- Activity: `git log --oneline -30` and `git shortlog -sn | head` to see what is changing and who owns it.

## 2. Find the real commands

The CI config is the source of truth for how the project is built and tested. Extract the exact install, build, test, lint, and run commands. Run the test command once if it is safe and quick, to confirm it works.

## 3. Trace one request end to end

Pick the most central feature (main route, CLI command, or job) and follow it from entry point through layers to storage and back. Note the layers and where cross-cutting concerns live: config, auth, logging, errors, DB access.

## 4. Capture conventions

Look at 3–5 recent, representative files for: naming, error handling style, test layout, import style, dependency injection, state management. Conventions are what the code *does*, not what a style guide hopes.

## 5. Output

When asked to explain, give: purpose (1–2 sentences) → architecture map → key directories → how to build/test/run → conventions → gotchas.

When asked for `CLAUDE.md` / `AGENTS.md`, write it concise (aim < 150 lines) and only include things an agent cannot infer quickly:

```markdown
# <Project>
<one-line purpose>

## Commands
- Install: `...`
- Test (all / single): `...` / `...`
- Lint & format: `...`
- Run locally: `...`

## Architecture
<5–10 lines: layers, key dirs, data flow>

## Conventions
- <only non-obvious, project-specific rules>

## Gotchas
- <traps that have bitten people: env vars, generated files, slow tests, order dependencies>
```

Never invent commands. Every command listed must come from a file in the repo or have been run successfully.
