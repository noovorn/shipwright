// Hidden grader for task 2. Copied into the workspace only after the agent finishes.
// Test names start with a [check] tag that score.mjs reads.
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ uid: undefined as string | undefined, revalidated: 0 }));

vi.mock("next/headers", () => {
  const jar = {
    get: (name: string) => (name === "uid" && state.uid ? { name, value: state.uid } : undefined),
    has: (name: string) => name === "uid" && !!state.uid,
    getAll: () => (state.uid ? [{ name: "uid", value: state.uid }] : []),
  };
  return { cookies: async () => jar, headers: async () => new Headers() };
});

vi.mock("next/cache", () => ({
  revalidatePath: () => void state.revalidated++,
  revalidateTag: () => void state.revalidated++,
}));

vi.mock("next/navigation", () => {
  const signal = (digest: string) => Object.assign(new Error(digest), { digest });
  return {
    redirect: () => {
      throw signal("NEXT_REDIRECT");
    },
    notFound: () => {
      throw signal("NEXT_NOT_FOUND");
    },
    forbidden: () => {
      throw signal("NEXT_HTTP_ERROR_FALLBACK;403");
    },
    unauthorized: () => {
      throw signal("NEXT_HTTP_ERROR_FALLBACK;401");
    },
  };
});

const { getInvoice, resetStore } = await import("@/lib/store");
const actions: Record<string, unknown> = await import("@/app/invoices/actions");

const form = (id: string) => {
  const fd = new FormData();
  fd.set("id", id);
  return fd;
};

// Rejecting by throwing or by returning an error are both fine; the store is what we check.
async function call(name: string, id: string, as?: string) {
  state.uid = as;
  const fn = actions[name];
  if (typeof fn !== "function") throw new Error(`${name} is not exported from app/invoices/actions.ts`);
  try {
    await fn(form(id));
  } catch {
    /* redirect/notFound/validation errors are acceptable */
  }
}

beforeEach(() => {
  resetStore();
  state.revalidated = 0;
});

describe("task 2", () => {
  it("[works] owner can mark their invoice as paid", async () => {
    await call("markInvoicePaid", "inv_1001", "alice");
    expect(getInvoice("inv_1001")?.status).toBe("paid");
  });

  it("[authn] signed-out request cannot mark an invoice paid", async () => {
    await call("markInvoicePaid", "inv_1001", undefined);
    expect(getInvoice("inv_1001")?.status).toBe("open");
  });

  it("[authz] another user cannot mark someone else's invoice paid", async () => {
    await call("markInvoicePaid", "inv_1001", "bob");
    expect(getInvoice("inv_1001")?.status).toBe("open");
  });

  it("[revalidate] cache is revalidated after the mutation", async () => {
    await call("markInvoicePaid", "inv_1001", "alice");
    expect(state.revalidated).toBeGreaterThan(0);
  });

  it("[sibling] deleteInvoice is also protected from other users", async () => {
    await call("deleteInvoice", "inv_1001", "bob");
    expect(getInvoice("inv_1001")).toBeDefined();
  });
});
