# Before / after: Shipwright on a real Next.js app

Don't take our word for it. This folder runs your own agent on the same tasks **twice**, once without skills and once with Shipwright installed, then scores both with hidden tests the agent never sees.

```bash
cd examples/nextjs-before-after
./run.sh --runs 3            # Claude Code
./run.sh --runs 3 --agent codex
```

Results land in `results/<timestamp>/summary.md`, with every transcript, diff and final message saved next to it.

## The app

**Ledgerly** is a tiny invoicing app built with Next.js 15 (App Router), React 19 and Vitest. It has two users (`alice`, `bob`), an in-memory store, and a passing test suite. It also has traps that look a lot like real codebases:

- Amounts are stored as strings like `"1,250,000.00"`, and `parseAmount` uses `parseFloat`, which stops at the first comma.
- The existing tests only use amounts under 1,000, so they pass with the bug in place.
- The same parsing mistake is duplicated in `lib/csv.ts`.
- The existing `deleteInvoice` server action trusts the `id` from the form and never checks who is asking. It's a pattern that's easy to copy.

## The tasks

The prompts are short, the way people actually write them. They're in [`tasks/`](tasks/).

| # | Prompt (summary) | What a careful engineer does | Skills it exercises |
|---|---|---|---|
| 1 | "Dashboard total shows $453 instead of ~$1.25M, fix it" | Reproduces it with a failing test, fixes `parseAmount` at the root, finds the same bug in CSV import | `systematic-debugging`, `test-driven-development`, `verify-before-done` |
| 2 | "Add a Mark as paid button backed by `markInvoicePaid`" | Authenticates and checks ownership inside the action, revalidates, tests it, and notices `deleteInvoice` has the same hole | `nextjs-app-router`, `security-audit`, `test-driven-development` |

## How it's scored

After the agent finishes, [`grader/`](grader/) tests are copied into its workspace and run, followed by `next build`. Nothing is judged by an LLM.

| Task 1 checks | Task 2 checks |
|---|---|
| Dashboard total is correct | Owner can mark an invoice paid |
| Fixed at the root (`parseAmount`), not at the call site | Signed-out request is rejected |
| Also fixed the CSV import | Another user's invoice is rejected |
| | Cache revalidated after the mutation |
| | Existing `deleteInvoice` locked down too |

Every run is also scored on: the project's own tests pass, `next build` passes, tests were added, and whether the agent ran tests and build itself (read from the transcript). Cost and turns are reported too, since skills aren't free.

### Are the graders fair?

`./selftest.sh` checks that the untouched app **fails** every check and the reference fixes in [`reference/`](reference/) **pass** every one. CI runs it on every push. A typical quick fix, like stripping commas at the call site or copying the `deleteInvoice` pattern, still passes "it works" but fails the root-cause and security checks. Those are the gaps the skills exist to close.

## Running it fairly

- Agents are random, so use `--runs 3` or more. One run proves nothing.
- Each run happens in a fresh temp copy with its own `git` history, outside this repo, so the agent can't read the graders or reference fixes.
- The *shipwright* variant installs skills with `install.sh --project`. The *baseline* gets nothing. `run.sh` refuses to start if Shipwright is installed user-wide, since the baseline would load it too.
- Your global `CLAUDE.md` / `AGENTS.md` applies to both variants equally. For the cleanest numbers, run without one.
- Permission prompts are skipped (`--dangerously-skip-permissions` / `--full-auto`) because the workspaces are throwaway copies.

Requirements: bash (Git Bash works on Windows), Node 20+, git, and the `claude` or `codex` CLI signed in.

## Publishing your numbers

`results/` is git-ignored. To share a run, copy its `summary.md` here as `RESULTS.md`, and include the agent, model and number of runs. Please publish the runs where Shipwright didn't help too.
