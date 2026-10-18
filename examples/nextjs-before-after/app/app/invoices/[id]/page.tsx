import { notFound } from "next/navigation";
import { deleteInvoice } from "@/app/invoices/actions";
import { getCurrentUserId } from "@/lib/session";
import { getInvoice } from "@/lib/store";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const invoice = getInvoice(id);
  if (!invoice || invoice.ownerId !== userId) notFound();

  return (
    <>
      <h1>{invoice.customer}</h1>
      <dl>
        <dt>Amount</dt>
        <dd>${invoice.amount}</dd>
        <dt>Status</dt>
        <dd>{invoice.status}</dd>
        <dt>Due</dt>
        <dd>{invoice.dueDate}</dd>
      </dl>
      <form action={deleteInvoice}>
        <input type="hidden" name="id" value={invoice.id} />
        <button type="submit">Delete invoice</button>
      </form>
    </>
  );
}
