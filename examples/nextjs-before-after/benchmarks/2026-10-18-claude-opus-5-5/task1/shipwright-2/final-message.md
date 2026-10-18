I fixed it. With alice's seed data the dashboard now shows **$1,252,750.00** instead of $453.00, and bob's shows $7,920.25. All 10 tests pass, including the new ones, and the type check is clean.

**Cause:** `parseAmount` in `lib/money.ts` used `parseFloat`, which stops reading at the first comma. Amounts are stored the way they were entered, with thousands separators:
- `"450.00"` → 450
- `"2,300.00"` → **2**
- `"1,250,000.00"` → **1**

That adds up to exactly $453.00.

**Changes:**
- **`lib/money.ts`:** `parseAmount` now removes commas along with the leading `$` and surrounding spaces. It also rejects anything that isn't a valid number and returns `NaN`, where before it silently took a partial number (e.g. 12 from `"12abc"`).
- **`lib/csv.ts`:** the CSV importer had its own copy of the same bug, so `"1,200.00"` would have been saved as `1.00`, which permanently corrupts the stored amount. It now uses `parseAmount`.
- **Tests:** I added `lib/money.test.ts`, `lib/csv.test.ts` and a check in `lib/stats.test.ts` for amounts with commas. They failed before the fix (showing 453) and pass now.

Any invoices already imported from CSV with commas in the amount were saved with the wrong value, and this fix doesn't correct them. The demo only uses an in-memory store loaded from seed data, so there's nothing to clean up here, but the same logic in production would need a data fix. I haven't committed anything; tell me if you want a commit or PR.
