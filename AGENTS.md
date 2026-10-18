# Shipwright — agent entry point

This repo is a pack of engineering skills. Each skill lives in `skills/<name>/SKILL.md`.

When working in a project where these skills are installed, apply them automatically:

| Situation | Skill |
|---|---|
| Unfamiliar repo / write AGENTS.md | `codebase-onboarding` |
| Multi-file feature or migration | `plan-before-code` |
| New behavior or bug fix | `test-driven-development` |
| Bug, failing test, unknown error | `systematic-debugging` |
| Restructure without behavior change | `safe-refactor` |
| Reviewing a diff / PR | `code-review` |
| About to say "done" | `verify-before-done` |
| Commit, branch, PR, conflicts | `git-workflow` |
| Next.js project | `nextjs-app-router` |
| NestJS project | `nestjs-backend` |
| Laravel project | `laravel-backend` |
| Prisma schema / queries | `prisma-orm` |
| Dockerfile, compose, deploy | `docker-deploy` |
| Security review / hardening | `security-audit` |

## Working on this repo

- Validate: `python scripts/validate.py`
- Every `description` starts with "Use when…" and states the trigger concretely.
- Keep each SKILL.md under 500 lines; put long material in `skills/<name>/references/`.
