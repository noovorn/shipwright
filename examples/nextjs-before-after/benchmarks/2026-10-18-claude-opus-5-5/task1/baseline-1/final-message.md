I fixed it. Alice's Outstanding total will now show **$1,252,750.00** (450 + 2,300 + 1,250,000) instead of $453.00. The new tests and the type check pass, but I didn't start the app and look at the dashboard in a browser.

**Cause:** amounts are stored as text with commas, like `"2,300.00"`. The function that turns them into numbers (`parseAmount` in `lib/money.ts`) stopped reading at the first comma. So `"2,300.00"` counted as 2 and `"1,250,000.00"` counted as 1, giving 450 + 2 + 1 = $453.

**Fix:** `parseAmount` now removes commas before converting.

**Same bug in CSV import:** `lib/csv.ts` had its own copy of the broken conversion, so importing a quoted `"1,200.00"` would have saved the invoice as `1.00`. It now uses the fixed `parseAmount`. Any invoices already imported with a comma in the amount were saved with the wrong value and won't be corrected by this change, so they may be worth checking.

**Tests:** I added one test for the total with comma amounts (`lib/stats.test.ts`) and two new test files, `lib/money.test.ts` and `lib/csv.test.ts`. I haven't committed anything.
