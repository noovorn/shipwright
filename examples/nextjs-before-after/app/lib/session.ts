import { cookies } from "next/headers";

export const USERS = ["alice", "bob"] as const;

/**
 * Demo auth: the signed-in user is the `uid` cookie (set via /login?as=alice).
 * Returns null when nobody is signed in.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const uid = (await cookies()).get("uid")?.value;
  return uid && (USERS as readonly string[]).includes(uid) ? uid : null;
}
