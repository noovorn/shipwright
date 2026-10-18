import { NextResponse, type NextRequest } from "next/server";
import { USERS } from "@/lib/session";

export function GET(request: NextRequest) {
  const as = request.nextUrl.searchParams.get("as") ?? "";
  const res = NextResponse.redirect(new URL("/", request.url));
  if ((USERS as readonly string[]).includes(as)) {
    res.cookies.set("uid", as, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  return res;
}
