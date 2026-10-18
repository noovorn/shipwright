The invoice page now has a "Mark as paid" button, backed by `markInvoicePaid(formData)` in `app/invoices/actions.ts`. All 7 tests pass (4 of them new), and the typecheck and `next build` both succeed. I didn't open the page in a running app, so the button has been tested through the action but not clicked in a browser.

**What changed:**
- **The action** (`app/invoices/actions.ts`): it reads `id` from the form and sets that invoice's status to `paid`. It then refreshes both `/` and `/invoices/[id]`, so the dashboard totals and the invoice page show the change.
- **Ownership check:** anyone can call a server action directly with a POST request, so the action doesn't trust the form. It looks up the signed-in user and returns not found unless they own the invoice. It also returns not found if nobody is signed in or the id is missing or doesn't exist.
- **The button** (`app/invoices/[id]/page.tsx`): it's a form with a hidden `id` field, next to the delete form, and it only shows while the invoice is still `open`.
- **Tests** (`app/invoices/actions.test.ts`): they cover the owner marking their invoice paid, another user being refused, a signed-out request being refused, and an unknown or missing id. I ran them before writing the action and they failed as expected.

**A security issue I didn't fix:** the existing `deleteInvoice` action has no ownership check. Any signed-in or signed-out caller who knows or guesses an invoice id can delete someone else's invoice. It needs the same check as `markInvoicePaid` — I can add it if you want.

I haven't committed anything.
