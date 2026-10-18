The invoice page now has a "Mark as paid" button, backed by `markInvoicePaid(formData)` in `app/invoices/actions.ts`. Typecheck, the existing tests (3/3) and `next build` all pass, but I haven't clicked the button in a running app.

**What I changed:**
- **`app/invoices/actions.ts`:** `markInvoicePaid` reads `id` from the form, checks it is a string, and checks the signed-in user owns that invoice. Then it sets the status to `paid` and refreshes both the invoice page and the dashboard so the new status and totals show straight away.
- **`app/invoices/[id]/page.tsx`:** the new form sends a hidden `id` field, matching the delete form. The button only appears while the invoice is `open`.

**Security issue in existing code:** `deleteInvoice` doesn't check who is signed in or who owns the invoice. Server actions can be called directly, so anyone, even someone not logged in, could delete any user's invoice by sending its id. I left it alone because it's outside this task. The fix is the same ownership check `markInvoicePaid` now does. Want me to add it?
