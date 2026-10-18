---
name: prisma-orm
description: Use when working with Prisma (schema.prisma, prisma.config.ts, @prisma/client, prisma migrate, PrismaClient queries) — designing schemas, writing migrations, fixing slow or failing queries, transactions, or seeding. Enforces safe migrations, N+1-free queries, and correct client lifecycle.
---

# Prisma ORM

## 0. Orient

- Read `package.json` → `prisma` and `@prisma/client` versions (they must match), `schema.prisma` (provider, generator, previewFeatures), and `prisma.config.ts` if present.
- Versions differ in generator name, client output location, config file, and driver adapters. Follow what the installed version and existing config use; check the project's imports of the client (`@prisma/client` vs a generated path) and keep them consistent.
- Find how the client is instantiated (usually `lib/prisma.ts` / `db.ts` / a NestJS `PrismaService`) and reuse it.

## 1. Client lifecycle

- **One PrismaClient per process.** In dev with hot reload (Next.js, Vite), cache it on `globalThis` to avoid "too many connections":
  ```ts
  const g = globalThis as unknown as { prisma?: PrismaClient };
  export const prisma = g.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") g.prisma = prisma;
  ```
- Serverless/edge: use a connection pooler (PgBouncer, Prisma Accelerate, provider pooler) and set `connection_limit` appropriately; use the driver adapter the platform requires.
- NestJS: wrap in a `PrismaService` that `extends PrismaClient implements OnModuleInit` and connects in `onModuleInit`.

## 2. Schema design

- Every model: `id` (`cuid()`/`uuid()`/`autoincrement()` per project convention), `createdAt @default(now())`, `updatedAt @updatedAt`.
- Add `@@index` for every foreign key and every column used in `where`/`orderBy` on large tables. (Postgres/MySQL do not always index FKs for you.)
- Use `@@unique` for business uniqueness (e.g. `[orgId, email]`) — never rely on app checks alone.
- Pick `onDelete` deliberately (`Cascade`, `Restrict`, `SetNull`) for every relation.
- Money: `Decimal`, never `Float`. Use enums for closed sets.
- Map to existing naming with `@map` / `@@map` instead of renaming tables.

## 3. Migrations — safety rules

- Dev: `prisma migrate dev --name <descriptive_name>`. Production/CI: `prisma migrate deploy` only. **Never** `migrate dev` or `db push` against production.
- **Read the generated SQL** in `prisma/migrations/*/migration.sql` before committing. Watch for `DROP COLUMN`, `DROP TABLE`, and column renames that Prisma turned into drop + add (data loss).
- For renames: edit the SQL to `ALTER TABLE ... RENAME COLUMN`, or use `migrate dev --create-only`, edit, then apply.
- Adding a required column to a populated table: add as optional (or with default) → backfill → make required in a second migration.
- Never edit a migration already applied in a shared environment. Never delete migration folders to "fix" drift — diagnose with `prisma migrate status` / `prisma migrate diff`.
- Run `prisma generate` after schema changes (often automatic with migrate dev; required in CI/Docker builds).

## 4. Query patterns

- **Select only what you need** (`select`) — especially never return `password`/tokens. Prefer `select` over broad `include` in APIs.
- **Avoid N+1**: never query inside a loop over results. Use `include`/nested `select`, `findMany({ where: { id: { in: ids } } })`, or `_count`.
- **Paginate** every list: cursor (`cursor`, `take`, `skip: 1`) for large/infinite lists; `skip/take` only for small offsets.
- Bulk work: `createMany`, `updateMany`, `deleteMany` — note they do not return records (except `createManyAndReturn` where supported) and do not run nested writes.
- Use `upsert` for idempotent writes keyed by a unique field.
- `$queryRaw` with tagged templates only (parameterized). **Never** `$queryRawUnsafe`/`$executeRawUnsafe` with user input.

## 5. Transactions

- Dependent writes → interactive `prisma.$transaction(async (tx) => { ... })`, and use `tx`, not `prisma`, inside.
- Independent writes that must all succeed → `prisma.$transaction([q1, q2])`.
- Keep transactions short: no HTTP calls or slow work inside. Set `timeout`/`maxWait` if needed.
- For concurrency (counters, inventory), use atomic updates (`{ increment: 1 }`) or optimistic locking with a `version` field.

## 6. Errors

Map `Prisma.PrismaClientKnownRequestError` codes to HTTP responses:
- `P2002` unique violation → 409
- `P2025` record not found → 404
- `P2003` foreign key violation → 400/409

Don't leak raw Prisma error messages to clients.

## 7. Seeding & testing

- Seed script configured in `package.json` (`prisma.seed`) or `prisma.config.ts`; make it idempotent (`upsert`).
- Tests: use a real database (Docker/Testcontainers) with `migrate deploy` + truncation between tests, or transaction rollback per test. Avoid mocking PrismaClient for anything beyond trivial unit tests.

## 8. Debugging

- Log queries: `new PrismaClient({ log: ["query", "warn", "error"] })` and look for repeated queries (N+1) and slow ones.
- Check the query plan with `EXPLAIN ANALYZE` via `$queryRaw` for slow queries; usually a missing index.
- "Client out of date" / type mismatch → run `prisma generate`; ensure `prisma` and `@prisma/client` versions match.

## 9. Verify

`prisma validate`, `prisma format --check` (if supported), `prisma migrate status`, review migration SQL, type-check, and run tests that touch the changed queries.
