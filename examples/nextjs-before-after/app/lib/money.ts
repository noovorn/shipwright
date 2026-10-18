/** Parse a user-entered amount like "450.00" or "$1,250.00" into a number. */
export function parseAmount(input: string): number {
  return parseFloat(input.trim().replace(/^\$/, ""));
}

export function formatMoney(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
