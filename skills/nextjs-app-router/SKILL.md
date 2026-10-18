---
name: nextjs-app-router
description: Use when building, debugging, or reviewing a Next.js app (files like next.config.*, app/, page.tsx, layout.tsx, route.ts, server actions, middleware or proxy). Applies version-correct App Router patterns for server/client components, data fetching, caching, server actions, and performance.
---

# Next.js (App Router)

## 0. Detect the version first

Read `package.json` → `next` version, and `next.config.*`. Conventions changed across majors; follow the installed version, not memory.

- **14**: `params`/`searchParams` are plain objects; `fetch` cached by default.
- **15+**: `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are **async** — `await` them. `fetch` and GET route handlers are **not** cached by default.
- **16+**: `middleware.ts` is renamed `proxy.ts` (exported function `proxy`); Turbopack is the default bundler; Cache Components (`"use cache"`) available when enabled in config.

If the project uses `pages/`, it is the Pages Router — do not mix in App Router APIs unless migrating deliberately.

## 1. Server vs client components

- Everything in `app/` is a **Server Component** by default. Keep it that way.
- Add `"use client"` only for: state/effects, event handlers, browser APIs, client-only libraries. Put it on the **smallest leaf** component, not on the page or layout.
- Pass Server Components into Client Components as `children`/props instead of importing them inside client files.
- Props crossing the server→client boundary must be serializable (no functions except server actions, no class instances, Dates become strings).
- Mark server-only modules with `import "server-only"` (DB clients, secrets). Never import them from client files.
- Only `NEXT_PUBLIC_*` env vars reach the browser. Anything else used in a client component is `undefined` — and a secret must never be prefixed.

## 2. Data fetching

- Fetch in Server Components, directly (DB/ORM or `fetch`). No `useEffect` + API route for initial data.
- Avoid waterfalls: start independent requests together with `Promise.all`, or split into components wrapped in `<Suspense>` so they stream.
- Deduplicate per-request DB calls with React `cache()`.
- Add `loading.tsx` and `error.tsx` (client component, with `reset`) per meaningful segment; `not-found.tsx` + `notFound()` for missing resources.

## 3. Caching & revalidation

- Decide per route: static, ISR (`export const revalidate = N` or `fetch(url, { next: { revalidate: N } })`), or dynamic.
- Tag data (`next: { tags: ["posts"] }` or the version's cache-tag API) and invalidate with `revalidateTag` / `revalidatePath` after mutations.
- Using `cookies()`, `headers()`, or `searchParams` makes a route dynamic — that is often the hidden reason a page "isn't cached".
- When debugging stale data, check: build output (static ○ vs dynamic ƒ), fetch cache options, route segment config, and whether revalidation is called after the write.

## 4. Mutations: server actions & route handlers

- Prefer **server actions** (`"use server"`) for form mutations from your own UI; route handlers (`app/api/**/route.ts`) for webhooks, third-party callers, and non-React clients.
- Treat every server action as a **public endpoint**: validate input (e.g. Zod), check authentication **and** authorization inside the action. Never trust hidden form fields or client-provided IDs.
- After mutating: `revalidatePath`/`revalidateTag`, then `redirect()` if needed (call `redirect` outside `try/catch` — it throws by design).
- Use `useActionState` / `useFormStatus` for pending and error UI.

## 5. Auth & proxy/middleware

- Middleware/proxy is for cheap, optimistic checks (redirect if no session cookie). **Do real authorization next to the data** — in the server component, action, or route handler. Never rely on middleware alone.
- Keep the `matcher` tight; exclude `_next/static`, images, and public assets.

## 6. Performance & SEO

- `next/image` with explicit `width`/`height` or `fill` + `sizes`; `priority` only for the LCP image.
- `next/font` for fonts; `next/link` for navigation; `next/dynamic` for heavy client-only widgets.
- Metadata via `export const metadata` or `generateMetadata`; `generateStaticParams` for known dynamic routes.
- Check bundle impact of every new client dependency; keep large libraries on the server.

## 7. Common bugs to check first

- Hydration mismatch → `Date.now()`, `Math.random()`, `window`, locale formatting, or invalid HTML nesting rendered on the server.
- "Functions cannot be passed to Client Components" → non-serializable prop across the boundary.
- `useRouter` from `next/router` in App Router → should be `next/navigation`.
- Works in dev, broken in prod → caching/static rendering; reproduce with `next build && next start`.

## 8. Verify

Run, and show results: `next build` (zero type errors; review the route table for ○/ƒ as intended), lint, tests, and load the affected page with `next start`.
