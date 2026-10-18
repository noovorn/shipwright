The invoice page now has a "Mark as paid" button. The type check and the existing tests pass, but I didn't run the app or click the button, and I added no tests for the new action.

- **`app/invoices/actions.ts`:** `markInvoicePaid(formData: FormData)` reads the invoice id from the `id` field and sets the invoice's status to `"paid"`. It then refreshes the invoice page and the dashboard so the new status and the outstanding total update straight away.
- **Ownership check:** before changing anything, the action checks that someone is signed in and owns the invoice. If not, it returns a 404. The page's own check isn't enough, because anyone who knows an invoice id can call a server action directly.
- **`app/invoices/[id]/page.tsx`:** the new form sends the id in a hidden field, the same way the delete form does. The button only appears while the invoice is unpaid.

**Security issue in existing code:** `deleteInvoice` doesn't check who is signed in or who owns the invoice. Anyone who knows an invoice id can delete someone else's invoice, even without signing in. I left it alone because it's outside this task, but the same check would fix it. Want me to add it?
