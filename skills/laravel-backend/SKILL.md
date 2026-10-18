---
name: laravel-backend
description: Use when building, debugging, testing, or reviewing a Laravel application (files like artisan, composer.json with laravel/framework, app/Http, routes/web.php, routes/api.php, Eloquent models, Blade, Livewire or Inertia). Applies version-correct Laravel conventions for routing, validation, authorization, Eloquent performance, queues, and Pest/PHPUnit tests.
---

# Laravel Backend

## 0. Orient

- `composer.json` → `laravel/framework` version and PHP version; `php artisan about` for the full picture.
- **Laravel 11+** uses the slim skeleton: middleware, exceptions, and routing are configured in `bootstrap/app.php` (no `Http/Kernel.php`); `routes/api.php` exists only after `php artisan install:api`. Older versions use `app/Http/Kernel.php`. Follow what the project actually has.
- Front end: Blade, Livewire, Inertia (Vue/React), or API-only? Check `composer.json`/`package.json` and match existing patterns.
- Tests: Pest (`tests/Pest.php`) or PHPUnit. Use whichever the project uses.

## 1. Generate, don't hand-write boilerplate

Use `php artisan make:*` with flags: `make:model Post -mfsc` (migration, factory, seeder, controller), `make:request`, `make:policy --model=Post`, `make:resource`, `make:job`, `make:test --pest`. This keeps namespaces and conventions right.

## 2. Thin controllers

- Controller: authorize → validate (Form Request) → call action/service → return response/resource.
- Validation lives in **Form Requests** (`rules()`, `authorize()`); use `$request->validated()` — never `$request->all()` into `create()`.
- Business logic that spans models goes in an Action/Service class. Do not grow fat models or fat controllers.
- API responses through **API Resources**, so models (and hidden fields) are never serialized directly.
- Use route model binding and resource routes; scope nested bindings with `->scoped()`.

## 3. Authorization & security

- Every write and every resource read is authorized via **Policies/Gates** (`$this->authorize()`, `Gate::authorize()`, `can` middleware, or `authorize()` in the Form Request).
- Mass assignment: define `$fillable` (or the project's chosen approach); never `$guarded = []` with unvalidated input.
- Raw SQL only with bindings: `DB::select('... where id = ?', [$id])`, `whereRaw('x = ?', [$v])`. Never interpolate.
- Blade: `{{ }}` escapes; `{!! !!}` only for trusted, sanitized HTML.
- Secrets in `.env`, read via `config()` — never call `env()` outside `config/` files (it returns `null` once config is cached).

## 4. Eloquent performance

- Prevent N+1: eager load with `with()` / `load()`; enable `Model::preventLazyLoading(! app()->isProduction())` in `AppServiceProvider`.
- Select only needed columns for large tables; paginate every list (`paginate()`/`cursorPaginate()`); `chunkById()` / `lazyById()` for batch work.
- Add indexes in migrations for foreign keys and columns used in `where`/`orderBy`.
- Wrap multi-step writes in `DB::transaction()`.
- Use `withCount`/`withSum` instead of loading relations to count them.

## 5. Migrations

- Never edit a migration that has run in a shared environment — write a new one.
- Every migration has a working `down()` (or the team's documented convention).
- Large-table changes: think about locks; add nullable columns first, backfill in a job, then enforce constraints.

## 6. Queues, events, scheduling

- Slow work (mail, external APIs, file processing) → queued jobs (`ShouldQueue`), with `$tries`, `backoff()`, and idempotent `handle()`.
- Dispatch after commit when the job depends on just-written data (`afterCommit()`).
- Scheduled tasks in `routes/console.php` (11+) or `Console/Kernel.php` (older); use `withoutOverlapping()` for long tasks.

## 7. Testing

- Feature tests over unit tests for HTTP behavior: `$this->actingAs($user)->postJson(...)->assertCreated()->assertJsonPath(...)`.
- Use `RefreshDatabase` (or `LazilyRefreshDatabase`) and factories with states; no reliance on seeded data.
- Fake side effects: `Mail::fake()`, `Queue::fake()`, `Event::fake()`, `Http::fake()`, `Storage::fake()`, `Notification::fake()` — then assert on them.
- Test authorization: the wrong user gets 403, guest gets 401/redirect.
- For a bug: write the failing test first.

## 8. Common bugs to check first

- Config/route changes not taking effect → cached: `php artisan optimize:clear`.
- `env()` returns null in production → called outside config files with config cached.
- 419 on POST → missing `@csrf` or session/cookie domain misconfiguration.
- Lazy loading violation / slow page → missing eager load.
- Job runs with stale or missing data → dispatched before the transaction committed.
- Timezone bugs → check `config/app.php` timezone vs DB vs Carbon usage.

## 9. Verify

Run and show: `php artisan test` (or `vendor/bin/pest`), static analysis if configured (`vendor/bin/phpstan` / Larastan), code style (`vendor/bin/pint --test`), `php artisan route:list --path=<changed>` for routing changes, and hit the changed endpoint or page once.
