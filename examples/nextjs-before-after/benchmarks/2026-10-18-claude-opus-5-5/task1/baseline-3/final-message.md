I fixed it. Alice's Outstanding total now comes to **$1,252,750.00**: 450.00 + 2,300.00 + 1,250,000.00 across her three open invoices. All 6 tests pass and the type check is clean. I haven't checked it in the running app.

**Cause:** Amounts are stored as text with commas in them (like `"2,300.00"`). `parseAmount` in `lib/money.ts` turned that text into a number with `parseFloat`, which stops reading at the first comma. So `"2,300.00"` became 2 and `"1,250,000.00"` became 1. That's where 450 + 2 + 1 = $453 came from. The function's own comment says it handles `"$1,250.00"`, but it didn't.

**Changes:**
- `lib/money.ts`: `parseAmount` now strips commas before converting the text.
- `lib/csv.ts`: the CSV importer had the same bug, with one difference: it **saved** the wrong value. An imported `"1,200.00"` was stored as `"1.00"`. It now uses `parseAmount`, so new imports come in correctly.
- Tests: a new `lib/money.test.ts` and a case in `lib/stats.test.ts` that cover comma-formatted amounts.

Invoices that were already imported from CSV with comma amounts were saved with the wrong value, and this fix doesn't correct them. In this demo the store lives in memory and resets from the seed data, so nothing lasting was lost here. If real data went through that importer, those invoices would need to be re-imported.

I haven't committed the changes.
