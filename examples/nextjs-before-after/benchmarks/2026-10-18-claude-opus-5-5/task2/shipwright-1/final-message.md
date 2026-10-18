The invoice page now has a "Mark as paid" button, backed by `markInvoicePaid(formData: FormData)` in `app/invoices/actions.ts`. The 4 new tests pass along with the existing 3, and typecheck and `next build` are clean. I didn't try the button in a running browser; the tests call the action directly.

**How it works**
- **Button** (`app/invoices/[id]/page.tsx`): only shows when the invoice is `open`. It's a small form that sends the invoice id in a hidden field named `id`, the same way the existing delete form does.
- **Action** (`app/invoices/actions.ts`): it doesn't trust the id from the form. It looks up the signed-in user and returns not-found unless that user owns the invoice. That covers being signed out, an unknown id, and someone else's invoice. If the check passes, it sets the status to `paid` and refreshes both the dashboard and the invoice page so the new status and the outstanding total show up straight away.
- **Tests** (`app/invoices/actions.test.ts`): cover the owner marking their invoice paid, and the action refusing another user, a signed-out request, and an unknown id.

**Security problem in the existing code:** `deleteInvoice` has no ownership check. Any visitor, even one who isn't signed in, can delete any invoice by posting its id. I left it alone because you didn't ask me to change it, but it can be fixed with the same check `markInvoicePaid` uses. Want me to do that?
