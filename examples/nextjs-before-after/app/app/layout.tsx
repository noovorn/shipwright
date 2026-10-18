import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ledgerly",
  description: "Tiny invoicing demo for the Shipwright before/after comparison.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 760, margin: "2rem auto", padding: "0 1rem" }}>
        <header style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}>
          <Link href="/">
            <strong>Ledgerly</strong>
          </Link>
          <span style={{ marginLeft: "auto" }}>
            Sign in as <Link href="/login?as=alice">alice</Link> · <Link href="/login?as=bob">bob</Link>
          </span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
