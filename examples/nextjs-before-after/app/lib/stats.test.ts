import { describe, expect, it } from "vitest";
import { countByStatus, totalOutstanding } from "@/lib/stats";
import type { Invoice } from "@/lib/store";

const inv = (amount: string, status: Invoice["status"] = "open"): Invoice => ({
  id: `inv_${amount}`,
  ownerId: "alice",
  customer: "Test",
  amount,
  status,
  dueDate: "2026-11-01",
});

describe("totalOutstanding", () => {
  it("sums open invoices", () => {
    expect(totalOutstanding([inv("100.00"), inv("250.50")])).toBe(350.5);
  });

  it("ignores paid invoices", () => {
    expect(totalOutstanding([inv("100.00"), inv("999.00", "paid")])).toBe(100);
  });
});

describe("countByStatus", () => {
  it("counts each status", () => {
    expect(countByStatus([inv("1"), inv("2", "paid"), inv("3")])).toEqual({ open: 2, paid: 1 });
  });
});
