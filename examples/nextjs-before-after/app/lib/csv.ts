import type { Invoice } from "@/lib/store";

/**
 * Import invoices from CSV with header: customer,amount,dueDate
 * Amounts may be quoted, e.g. `Acme,"1,200.00",2026-12-01`.
 */
export function importCsv(text: string, ownerId: string): Invoice[] {
  const [, ...lines] = text.trim().split(/\r?\n/);
  return lines.map((line, i) => {
    const [customer, rawAmount, dueDate] = splitCsvLine(line);
    const amount = Number.parseFloat(rawAmount.replace(/^\$/, ""));
    if (Number.isNaN(amount)) throw new Error(`Row ${i + 2}: invalid amount "${rawAmount}"`);
    return {
      id: `inv_import_${Date.now()}_${i}`,
      ownerId,
      customer,
      amount: amount.toFixed(2),
      status: "open" as const,
      dueDate,
    };
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}
