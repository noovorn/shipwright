import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { getCurrentUserId } from "@/lib/session";
import { countByStatus, totalOutstanding } from "@/lib/stats";
import { listInvoices } from "@/lib/store";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return <p>Sign in to see your invoices.</p>;
  }

  const invoices = listInvoices(userId);
  const counts = countByStatus(invoices);

  return (
    <>
      <h1>Dashboard</h1>
      <p>
        Outstanding: <strong>{formatMoney(totalOutstanding(invoices))}</strong> · {counts.open} open ·{" "}
        {counts.paid} paid
      </p>
      <table cellPadding={6}>
        <thead>
          <tr>
            <th align="left">Customer</th>
            <th align="right">Amount</th>
            <th align="left">Status</th>
            <th align="left">Due</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>
                <Link href={`/invoices/${inv.id}`}>{inv.customer}</Link>
              </td>
              <td align="right">${inv.amount}</td>
              <td>{inv.status}</td>
              <td>{inv.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
