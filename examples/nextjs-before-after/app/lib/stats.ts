import { parseAmount } from "@/lib/money";
import type { Invoice } from "@/lib/store";

export function totalOutstanding(invoices: Invoice[]): number {
  return invoices
    .filter((inv) => inv.status === "open")
    .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
}

export function countByStatus(invoices: Invoice[]): Record<Invoice["status"], number> {
  const counts = { open: 0, paid: 0 };
  for (const inv of invoices) counts[inv.status]++;
  return counts;
}
