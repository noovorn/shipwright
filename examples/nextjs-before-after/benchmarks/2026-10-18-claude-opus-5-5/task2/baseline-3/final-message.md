The invoice page now has a "Mark as paid" button. The typecheck passes and the 3 existing tests pass, but nothing tests the new action and I didn't run the app to click the button.

- **`app/invoices/actions.ts`**: `markInvoicePaid(formData)` reads `id` from the form and checks that the signed-in user owns that invoice. If so, it sets the status to `"paid"` and refreshes the invoice page and the dashboard. Anyone can call a server action directly, not just through the button, so the action checks ownership itself rather than trusting the page. If the user isn't signed in, the invoice doesn't exist, or it belongs to someone else, it returns a 404.
- **`app/invoices/[id]/page.tsx`**: the button posts the hidden `id` field to that action. It only shows while the invoice isn't paid yet.

**Security issue in existing code:** `deleteInvoice` has no ownership check. Any visitor, even one who isn't signed in, can delete any invoice by posting its id to the action. I left it alone because it's outside this task. The fix is the same ownership check `markInvoicePaid` uses, and I can add it if you'd like.
