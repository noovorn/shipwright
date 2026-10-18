I fixed it. Alice's Outstanding total will now show **$1,252,750.00**: her three open invoices are $450.00 + $2,300.00 + $1,250,000.00. Her $980.50 invoice is paid, so it's left out.

**Cause:** `parseAmount` in `lib/money.ts` used `parseFloat`, which stops reading at the first comma. Amounts are stored with thousands separators, so `"2,300.00"` became 2 and `"1,250,000.00"` became 1. That's how the dashboard got 450 + 2 + 1 = $453. Amounts under $1,000 were unaffected, which is why it went unnoticed.

**Changes:**
- `lib/money.ts`: `parseAmount` now removes commas before parsing.
- `lib/csv.ts`: the CSV importer had the same bug. Its own doc example, `"1,200.00"`, would have been saved as $1.00. It now uses `parseAmount` too.
- **Tests:** I added `lib/money.test.ts`, `lib/csv.test.ts` and a new case in `lib/stats.test.ts`. Before the fix, three of them failed, and one of those reproduced the exact $453. After the fix, all 8 tests pass and `tsc --noEmit` is clean.

I haven't committed anything or checked it in the running app. The tests run against the same amounts as alice's seed data.

Any invoices already imported from CSV with comma amounts were saved wrong, and this fix doesn't correct them. The store is in memory and reloads from the seed file, so the demo isn't affected, but in a real deployment those records would need re-importing.
