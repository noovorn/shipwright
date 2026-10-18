I've fixed it. With alice's seed data, the Outstanding total now comes to **$1,252,750.00** instead of $453.00.

**Cause:** amounts are stored as text with commas, like `"2,300.00"`. `parseAmount` in `lib/money.ts` used `parseFloat`, which stops reading at the first comma. So `"2,300.00"` became 2 and `"1,250,000.00"` became 1. Alice's open invoices were added up as 450 + 2 + 1 = $453.

**Fix:** `parseAmount` now removes commas before parsing (`lib/money.ts:3`).

**Same bug in CSV import:** `lib/csv.ts` had its own copy of the broken parsing. An imported amount like `"1,200.00"` would have been saved as `"1.00"`. It now uses the fixed `parseAmount`. Any invoices already imported from a CSV with commas in the amounts were saved with the wrong value, and this fix doesn't change them. Those records need to be checked and re-imported or corrected.

**Tests:** I added tests for comma-formatted amounts in `lib/money.test.ts`, `lib/csv.test.ts` and `lib/stats.test.ts`. Before the fix they failed and reproduced the $453; now all 8 tests pass and the type check is clean. I didn't open the dashboard in a browser.

Nothing is committed yet. Tell me if you want a commit or PR.
