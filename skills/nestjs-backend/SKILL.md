---
name: nestjs-backend
description: Use when building, debugging, testing, or reviewing a NestJS application (files like *.module.ts, *.controller.ts, *.service.ts, main.ts with NestFactory, @nestjs/* packages). Applies idiomatic module structure, DI, validation, guards, error handling, persistence, and testing patterns.
---

# NestJS Backend

## 0. Orient

- Read `package.json` (`@nestjs/core` version, ORM: TypeORM / Prisma / MikroORM / Mongoose / Drizzle), `main.ts` (global pipes, filters, prefix, versioning, CORS), and `app.module.ts`.
- Find one existing feature module and copy its structure exactly. Consistency beats your preferences.

## 1. Module structure

```
src/<feature>/
  <feature>.module.ts
  <feature>.controller.ts     # HTTP only: routing, DTOs, status codes
  <feature>.service.ts        # business logic
  dto/create-<feature>.dto.ts
  entities/ or schemas/
  <feature>.service.spec.ts
```

- Controllers stay thin: parse → call service → return. No DB access, no business rules.
- Export from a module only what other modules need. Avoid circular imports; if `forwardRef` seems necessary, the boundary is usually wrong — extract a shared module or use events.
- Config through `@nestjs/config` with schema validation at startup (Joi or Zod). Never read `process.env` scattered across services.

## 2. Validation & DTOs

- Global `ValidationPipe` with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`. Verify it exists in `main.ts`; add it if not.
- Every input — body, query, params — has a DTO with `class-validator` decorators. Use `ParseIntPipe` / `ParseUUIDPipe` for params.
- Use `PartialType` / `PickType` / `OmitType` (from `@nestjs/mapped-types` or `@nestjs/swagger`) instead of duplicating DTOs.
- Never return entities with secrets directly; use response DTOs / `ClassSerializerInterceptor` with `@Exclude()`.

## 3. Request pipeline — put logic in the right place

| Concern | Use |
|---|---|
| Authentication / authorization | Guard (`CanActivate`) + custom decorators (`@Roles()`, `@Public()`) |
| Input transform/validate | Pipe |
| Logging, timing, response mapping, caching | Interceptor |
| Error → HTTP response | Exception filter |

- Apply auth guards globally (`APP_GUARD`) and opt out with `@Public()` — safer than remembering to add guards per route.
- Check ownership (user can act on *this* resource) in the service, not just role in the guard.

## 4. Errors

- Throw Nest's HTTP exceptions (`NotFoundException`, `ConflictException`…) from services or map domain errors in a filter. Never leak stack traces or ORM errors to clients.
- Map known DB errors (unique violation → 409, FK violation → 400/409) explicitly.
- Use the built-in `Logger` (or the project's logger) with context; no `console.log`.

## 5. Persistence

- Wrap multi-write operations in a transaction (TypeORM `DataSource.transaction`, Prisma `$transaction`).
- Watch for N+1: eager-load relations deliberately, paginate every list endpoint.
- Schema changes go through migrations, never `synchronize: true` outside local dev.

## 6. Async & lifecycle

- Always `await` or return promises; floating promises swallow errors.
- Long-running work → queue (`@nestjs/bullmq`) or `@nestjs/schedule`, not inside the request.
- Enable `app.enableShutdownHooks()` when using DB/queue connections.

## 7. Testing

- Unit: `Test.createTestingModule` with real service + mocked repositories/clients via `useValue`. Test behavior, not that a mock was called.
- E2E: boot the app with `supertest`, apply the **same global pipes/guards as `main.ts`** (extract a `configureApp(app)` function shared by both), use a real test database or container.
- For a bug: write the failing e2e/unit test first.

## 8. Common bugs to check first

- "Nest can't resolve dependencies of X" → provider not in module `providers`, not exported from its module, or importing module missing from `imports`.
- Validation silently not running → no global `ValidationPipe`, DTO is an interface/type instead of a class, or missing `@Type(() => Nested)` with `@ValidateNested()`.
- Query params arrive as strings → `transform: true` or explicit pipes.
- Request-scoped provider making everything slow → scope bubbles up the dependency chain.

## 9. Verify

`npm run build` (tsc clean), lint, `npm test`, `npm run test:e2e`, and hit the changed endpoint once (curl or Swagger) showing status and body.
