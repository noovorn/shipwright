The invoice page now has a "Mark as paid" button, backed by `markInvoicePaid(formData: FormData)` in `app/invoices/actions.ts`. Typecheck and the existing tests pass. I haven't run the app or clicked the button, and no test covers the new action.

**How it works:**
- **The action** reads `id` from the form and checks that the invoice exists and belongs to the signed-in user. It returns a 404 if either check fails. If both pass, it sets the status to `paid` and refreshes both the dashboard and the invoice page so they show the new status. The ownership check is needed because anyone can call a server action directly with any `id`, not just through the page's form.
- **The button** (`app/invoices/[id]/page.tsx`) is a form like the existing delete one, with a hidden `id` field. It only appears while the invoice is `open`.

**Problem in existing code:** `deleteInvoice` has no ownership check, so a signed-in user could delete someone else's invoice by sending its id. I left it alone because it's outside this change. The fix is the same few lines used in `markInvoicePaid`. Want me to add them?
