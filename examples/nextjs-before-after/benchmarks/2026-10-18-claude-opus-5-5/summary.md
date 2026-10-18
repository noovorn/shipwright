# Before / after results

Agent: `claude` · model: `claude-opus-5-5` · generated 2026-10-18T06:32:02.805Z

*baseline* = no skills installed · *shipwright* = Shipwright skills installed in the project. Each cell is runs passing / runs total.

## Task 1: Wrong dashboard total (bug fix)

| Check | Without Shipwright | With Shipwright |
|---|---|---|
| Dashboard total is correct | ✅ 3/3 | ✅ 3/3 |
| Fixed at the root (`parseAmount`), not at the call site | ✅ 3/3 | ✅ 3/3 |
| Also fixed the same bug in CSV import | ✅ 3/3 | ✅ 3/3 |
| Agent loaded a Shipwright skill | ❌ 0/3 | ❌ 0/3 |
| Project's own test suite passes | ✅ 3/3 | ✅ 3/3 |
| `next build` passes | ✅ 3/3 | ✅ 3/3 |
| Added or updated tests | ✅ 3/3 | ✅ 3/3 |
| Agent ran the tests itself | ✅ 3/3 | ✅ 3/3 |
| Agent ran build / typecheck itself | ✅ 3/3 | ✅ 3/3 |
| Avg. files changed | 4.7 | 5.0 |
| Avg. cost (USD) | $0.31 | $0.34 |
| Avg. turns | 9 | 9 |

## Task 2: Mark invoice as paid (feature)

| Check | Without Shipwright | With Shipwright |
|---|---|---|
| Owner can mark an invoice paid | ✅ 3/3 | ✅ 3/3 |
| Signed-out request is rejected | ✅ 3/3 | ✅ 3/3 |
| Other user's invoice is rejected | ✅ 3/3 | ✅ 3/3 |
| Cache revalidated after mutation | ✅ 3/3 | ✅ 3/3 |
| Also locked down the existing `deleteInvoice` | ❌ 0/3 | ❌ 0/3 |
| Agent loaded a Shipwright skill | ❌ 0/3 | ⚠️ 2/3 |
| Project's own test suite passes | ✅ 3/3 | ✅ 3/3 |
| `next build` passes | ✅ 3/3 | ✅ 3/3 |
| Added or updated tests | ❌ 0/3 | ⚠️ 2/3 |
| Agent ran the tests itself | ✅ 3/3 | ✅ 3/3 |
| Agent ran build / typecheck itself | ⚠️ 2/3 | ✅ 3/3 |
| Avg. files changed | 2.0 | 2.7 |
| Avg. cost (USD) | $0.23 | $0.29 |
| Avg. turns | 5 | 10 |

Each `task*/<variant>-<n>/` folder has the diff, the final message and the scored `result.json`. Raw transcripts are not published because they contain the local machine's account details.
