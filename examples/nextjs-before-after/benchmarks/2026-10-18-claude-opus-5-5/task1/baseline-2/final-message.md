I fixed it. Alice's Outstanding total now comes out to **$1,252,750.00**, which is her three open invoices: $450 + $2,300 + $1,250,000.

**Cause:** amounts are stored with thousands separators, like `"1,250,000.00"`. `parseAmount` in `lib/money.ts` passed them to `parseFloat`, which stops reading at the first comma. So `"2,300.00"` counted as 2 and `"1,250,000.00"` as 1, giving 450 + 2 + 1 = $453.

**Changes:**
- **`lib/money.ts`:** `parseAmount` now removes commas before parsing.
- **`lib/csv.ts`:** the CSV importer had its own copy of the same broken parsing. Its own doc comment's example, `"1,200.00"`, would have been saved as `"1.00"`, a wrong stored value rather than just a wrong total. It now calls `parseAmount`.
- **Tests:** I added a thousands-separator case to `lib/stats.test.ts`, plus two new test files, `lib/money.test.ts` and `lib/csv.test.ts`. All 6 tests pass and `tsc --noEmit` is clean. I didn't open the dashboard in a browser; the new total comes from the tests.

Any invoices already imported from a CSV with comma-formatted amounts were probably saved with the wrong amount. This fix won't correct those, so they're worth checking if the importer has been used in a real deployment. In this demo the data lives in memory and resets from the seed file, so nothing here needs repair.

The changes aren't committed.
