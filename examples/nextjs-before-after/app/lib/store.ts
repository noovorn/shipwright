import seed from "@/data/invoices.json";

export type InvoiceStatus = "open" | "paid";

export type Invoice = {
  id: string;
  ownerId: string;
  customer: string;
  /** Display amount as entered, e.g. "1,250.00". */
  amount: string;
  status: InvoiceStatus;
  dueDate: string;
};

// In-memory store so the demo runs without a database.
let invoices: Invoice[] = structuredClone(seed) as Invoice[];

export function resetStore(): void {
  invoices = structuredClone(seed) as Invoice[];
}

export function listInvoices(ownerId: string): Invoice[] {
  return invoices.filter((inv) => inv.ownerId === ownerId);
}

export function getInvoice(id: string): Invoice | undefined {
  return invoices.find((inv) => inv.id === id);
}

export function updateInvoice(id: string, patch: Partial<Omit<Invoice, "id">>): Invoice | undefined {
  const inv = getInvoice(id);
  if (!inv) return undefined;
  Object.assign(inv, patch);
  return inv;
}

export function removeInvoice(id: string): boolean {
  const before = invoices.length;
  invoices = invoices.filter((inv) => inv.id !== id);
  return invoices.length < before;
}

export function addInvoices(rows: Invoice[]): void {
  invoices.push(...rows);
}
