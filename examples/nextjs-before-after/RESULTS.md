# Benchmark results

## 2026-10-18 · Claude Code 2.1.302 · `claude-opus-5-5` · 3 runs per cell

Full table: [`benchmarks/2026-10-18-claude-opus-5-5/summary.md`](benchmarks/2026-10-18-claude-opus-5-5/summary.md). Every run's diff, final message and score are in the same folder.

### Short version

On this app, **Opus 5.5 already does well without Shipwright.** Both variants found the root cause, fixed the duplicate bug in CSV import, and put auth and ownership checks in the new server action in 3 of 3 runs. Shipwright didn't change correctness here.

The differences show up in process, and they're small:

| Task 2: Mark as paid | Without | With |
|---|---|---|
| Added tests for the new action | 0/3 | 2/3 |
| Ran build / typecheck before finishing | 2/3 | 3/3 |
| Avg. turns | 5 | 10 |
| Avg. cost | $0.23 | $0.29 |

With 3 runs per cell, these are signals, not proof.

### What we learned

1. **The skills were usually not triggered.** The agent could see all 14 Shipwright skills in every *with* run, but it loaded one (`nextjs-app-router`) in only 2 of 6 runs. It never loaded `systematic-debugging` on the bug-fix task. A skill that never loads can't help. Improving how descriptions trigger is the next piece of work.
2. **The "fixed `deleteInvoice` too" check was too strict.** All 6 task 2 runs, with and without skills, spotted that the existing `deleteInvoice` has no ownership check and reported it to the user. None of them changed it without being asked, which is reasonable scoping. The grader counts that as a fail. We're reporting it as it scored rather than changing the rules after the fact.
3. **The traps are too easy for a frontier model.** The buggy app was designed to catch shortcut fixes, and Opus 5.5 didn't take them. Harder tasks are needed to show a difference, along with weaker or faster models (for example `--model claude-haiku-5-5`) and Codex.

### Reproduce

```bash
cd examples/nextjs-before-after
./run.sh --runs 3 --model claude-opus-5-5
```

Results vary from run to run. If yours differ, please open a PR adding them here, including runs where Shipwright didn't help.
