<div align="center">

# ⚓ Shipwright

**Senior-engineer discipline for AI coding agents.**
Fourteen battle-tested skills that make Claude Code and Codex debug with evidence, write tests first, review like a staff engineer — and never say "done" without proof.

[![validate](https://github.com/OWNER/shipwright/actions/workflows/validate.yml/badge.svg)](https://github.com/OWNER/shipwright/actions/workflows/validate.yml)
![skills](https://img.shields.io/badge/skills-14-blue)
![Claude Code](https://img.shields.io/badge/Claude_Code-ready-d97757)
![Codex](https://img.shields.io/badge/Codex-ready-10a37f)
![license](https://img.shields.io/badge/license-MIT-green)

</div>

---

## The problem

AI agents are fast, but left alone they:

- 🎲 **patch symptoms** with guess-and-check instead of finding root causes
- 🙈 **write code first**, tests never (or tests that can't fail)
- ✅ **claim "it works"** without running anything
- 🧨 `git add -A`, `--force`, `--no-verify` their way out of trouble

## The fix

Shipwright installs skills — small, focused playbooks the agent loads **automatically** when the situation calls for it. No prompting required.

```bash
git clone https://github.com/OWNER/shipwright && cd shipwright && ./install.sh
```

That's it. Restart your agent.

## Before / after

<table>
<tr><th>Without Shipwright</th><th>With Shipwright</th></tr>
<tr><td>

> I added a null check on line 42. That should fix the crash! ✅

</td><td>

> **Root cause:** `parseDate` returns `undefined` for ISO strings with offsets, proven by the failing test `parses_offset_dates`.
> **Fix:** handle `±HH:MM` in the parser, not at the call site.
> **Verified:** `npm test` → 212 passed, 0 failed. Found and fixed the same bug in `formatRange`.

</td></tr>
</table>

## Skills

| Skill | Triggers when… | What it enforces |
|---|---|---|
| 🔍 [`systematic-debugging`](skills/systematic-debugging/SKILL.md) | bug, failing test, unknown error | reproduce → hypothesize → isolate → fix at root; three-strikes rule |
| 🧪 [`test-driven-development`](skills/test-driven-development/SKILL.md) | new feature or bug fix | red → green → refactor; every test seen failing first |
| 👀 [`code-review`](skills/code-review/SKILL.md) | reviewing a PR / diff | prioritized findings with `file:line`, correctness & security first |
| 🗺️ [`plan-before-code`](skills/plan-before-code/SKILL.md) | multi-file change | acceptance criteria + small verifiable steps before editing |
| 🔧 [`safe-refactor`](skills/safe-refactor/SKILL.md) | restructuring code | characterization tests, one mechanical step at a time |
| ✅ [`verify-before-done`](skills/verify-before-done/SKILL.md) | about to say "done" | fresh evidence for every success claim |
| 🌿 [`git-workflow`](skills/git-workflow/SKILL.md) | commits, PRs, conflicts | atomic Conventional Commits, no history destruction |
| 🧭 [`codebase-onboarding`](skills/codebase-onboarding/SKILL.md) | new repo / write AGENTS.md | map built from evidence; never invents commands |

### Stack skills

| Skill | Triggers when… | What it enforces |
|---|---|---|
| ▲ [`nextjs-app-router`](skills/nextjs-app-router/SKILL.md) | Next.js App Router work | version-aware async APIs, server/client boundaries, caching, secure server actions |
| 🐈 [`nestjs-backend`](skills/nestjs-backend/SKILL.md) | NestJS modules, controllers, services | thin controllers, global validation, guards, transactions, DI debugging |
| 🔴 [`laravel-backend`](skills/laravel-backend/SKILL.md) | Laravel apps | Form Requests, Policies, N+1 prevention, safe migrations, Pest feature tests |
| 🔷 [`prisma-orm`](skills/prisma-orm/SKILL.md) | Prisma schema, migrations, queries | migration SQL review, no data-loss renames, N+1-free queries, safe raw SQL |

### Ops & security

| Skill | Triggers when… | What it enforces |
|---|---|---|
| 🐳 [`docker-deploy`](skills/docker-deploy/SKILL.md) | Dockerfile, compose, container deploys | multi-stage, pinned, non-root, health-checked images; no baked-in secrets |
| 🛡️ [`security-audit`](skills/security-audit/SKILL.md) | audits, hardening, auth/payments/uploads | OWASP-guided review, proven findings, severity-ranked report, test-first fixes |

They compose: **onboard → plan → TDD → debug → refactor → review → verify → commit.**

## Install options

```bash
./install.sh                    # all skills, Claude Code + Codex, user-level
./install.sh --project          # into this repo's .claude/skills + .codex/skills (share with team)
./install.sh --agent codex      # Codex only (claude | codex | all)
./install.sh --link             # symlink, so `git pull` updates skills
./install.sh debug review       # only matching skills
./install.sh --uninstall
```

| Agent | User-level | Project-level |
|---|---|---|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Codex | `~/.codex/skills/` | `.codex/skills/` |

Manual install: copy any `skills/<name>/` folder into one of the paths above.

## Design principles

1. **One skill, one job.** Focused skills trigger reliably; mega-prompts don't.
2. **Descriptions are triggers.** Every `description` starts with "Use when…" and names concrete situations.
3. **Procedures, not platitudes.** Steps, commands, checklists, and output formats — not "write clean code."
4. **Evidence over vibes.** Every skill ends with a verifiable check.
5. **Small context footprint.** Each SKILL.md is a few hundred lines at most.

## Contributing

PRs welcome — new skills, sharper checklists, stack-specific variants. See [CONTRIBUTING.md](CONTRIBUTING.md). CI validates every skill's format.

If Shipwright saved you a debugging session, a ⭐ helps other devs find it.

## License

MIT
