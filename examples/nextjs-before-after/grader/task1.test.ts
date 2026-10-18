// Hidden grader for task 1. Copied into the workspace only after the agent finishes.
// Test names start with a [check] tag that score.mjs reads.
import { beforeEach, describe, expect, it } from "vitest";
import { importCsv } from "@/lib/csv";
import { parseAmount } from "@/lib/money";
import { totalOutstanding } from "@/lib/stats";
import { listInvoices, resetStore } from "@/lib/store";

beforeEach(() => resetStore());

describe("task 1", () => {
  it("[fixed] dashboard total for alice is $1,252,750.00", () => {
    expect(totalOutstanding(listInvoices("alice"))).toBe(1_252_750);
  });

  it("[root-cause] parseAmount handles thousands separators itself", () => {
    expect(parseAmount("2,300.00")).toBe(2300);
    expect(parseAmount("1,250,000.00")).toBe(1_250_000);
    expect(parseAmount("$12,345,678.90")).toBe(12_345_678.9);
    expect(parseAmount("450")).toBe(450);
  });

  it("[sibling] CSV import parses quoted amounts with commas", () => {
    const [row] = importCsv('customer,amount,dueDate\nAcme,"1,200.00",2026-12-01', "alice");
    expect(row.amount).toBe("1200.00");
  });
});
