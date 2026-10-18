---
name: security-audit
description: Use when asked to audit, harden, or security-review a codebase, feature, PR, or dependency set, or before shipping auth, payments, file upload, or anything that handles user data. Performs an OWASP-guided defensive review with evidence-backed, severity-ranked findings and concrete fixes.
---

# Security Audit

Defensive review of code the user owns or is authorized to assess. Goal: find and fix weaknesses, with proof, prioritized by real risk.

## 1. Scope & threat model (5 minutes)

- What is in scope: whole repo, a feature, a PR diff?
- Assets: user data, credentials, money, admin functions, infrastructure.
- Entry points: HTTP routes, server actions, GraphQL resolvers, webhooks, queues, file uploads, CLI, cron.
- Actors: anonymous, authenticated user, other tenant, admin, internal service.
- Write a 5-line threat model. It decides what to check first.

## 2. Automated baseline

Run whatever applies and is available; record results, don't paste raw noise:
- Dependencies: `npm audit --omit=dev`, `pnpm audit`, `composer audit`, `pip-audit`, `osv-scanner`.
- Secrets in code and history: `gitleaks detect` or `trufflehog git file://.`.
- Static analysis: `semgrep --config auto` (or the project's config), language linters with security rules.
- Images: `trivy fs .` / `trivy image`.

Triage each finding: reachable in this app? exploitable? Discard false positives with a one-line reason.

## 3. Manual review checklist (highest value first)

**Access control (most common critical bug)**
- Every route/action/resolver checks authentication **and** authorization server-side.
- Object-level checks: can user A read/modify user B's record by changing an ID (IDOR)? Queries scoped by owner/tenant.
- Admin and internal endpoints not reachable by normal users; no "hidden" routes relying on obscurity.
- Mass assignment: users cannot set `role`, `isAdmin`, `ownerId`, `price` via request body.

**Injection**
- SQL: parameterized queries only; grep for string-built SQL and raw/unsafe ORM methods.
- OS command: no shell with user input (`exec`, `system`, `shell_exec`, `child_process.exec`); use arg arrays.
- Path traversal: user input in file paths normalized and confined to a base dir.
- Template/XSS: output encoded by default; audit every `dangerouslySetInnerHTML`, `v-html`, `{!! !!}`, `innerHTML`, `|safe`.
- SSRF: server-side fetches of user-supplied URLs restricted (allowlist, block internal ranges and metadata IPs).
- Deserialization: no `unserialize`, `pickle.loads`, or YAML full-load on untrusted data.

**Authentication & sessions**
- Passwords hashed with bcrypt/argon2/scrypt; never MD5/SHA1/plain.
- Login, reset, OTP endpoints rate-limited; reset tokens random, single-use, expiring.
- Session cookies `HttpOnly`, `Secure`, `SameSite`; session rotated on login; logout invalidates server-side.
- JWT: algorithm pinned, signature verified, expiry enforced, secrets strong and not in code.
- CSRF protection on cookie-authenticated state-changing requests.

**Data protection**
- Secrets only from env/secret manager; none in repo, logs, error messages, or client bundles (check `NEXT_PUBLIC_*`, `VITE_*`).
- Sensitive fields excluded from API responses and logs (passwords, tokens, full card numbers, national IDs).
- HTTPS enforced; security headers set (CSP, HSTS, `X-Content-Type-Options`, frame-ancestors).
- CORS: no `*` with credentials; origins explicitly allowlisted.

**File upload**
- Type validated by content, size limited, stored outside web root or in object storage with generated names, never executed.

**Business logic & abuse**
- Race conditions on balances/inventory/coupons (use transactions/atomic updates).
- Webhooks verify signatures; payment amounts computed server-side.
- Rate limiting on expensive and enumeration-prone endpoints.

**Infrastructure & config**
- Debug mode off in production; stack traces not shown to users.
- Containers non-root; least-privilege DB and cloud credentials.

## 4. Prove before you report

- For each finding, show the vulnerable code (`file:line`), the request or input that triggers it, and the impact. Demonstrate with a failing test or local request where safe.
- Do not test against production or third-party systems without explicit authorization. Do not write weaponized exploits; a minimal proof (e.g. a test showing user A reads user B's record) is enough.

## 5. Report

```
## Security Audit — <scope>, <date>
Summary: <overall posture, counts by severity>

### [CRITICAL] IDOR on GET /api/invoices/:id
Location: src/invoices/invoices.controller.ts:31
Issue: invoice fetched by id without ownership check.
Proof: test `user_cannot_read_other_users_invoice` fails — user B receives user A's invoice.
Impact: any authenticated user can read all invoices (PII, amounts).
Fix: scope query by `userId: currentUser.id`; add the test.

### [HIGH] ...
```

Severity: **Critical** (remote, unauthenticated or cross-tenant data/money impact) → **High** → **Medium** → **Low** → **Info**. Rank by exploitability × impact, not by scanner label.

## 6. Fix mode

When asked to fix: write a failing security test first (e.g. "user B gets 403"), fix at the root (central authz helper, parameterized query), check sibling endpoints for the same pattern, and re-run the automated baseline.
