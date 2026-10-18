---
name: docker-deploy
description: Use when writing or fixing a Dockerfile, docker-compose / compose.yaml, .dockerignore, container image build, or a deployment pipeline that ships containers. Produces small, secure, reproducible multi-stage images with health checks, non-root users, and no baked-in secrets.
---

# Docker & Deploy

## 1. Before writing

- Detect the stack and its real build/start commands from the manifest and CI (`package.json` scripts, `composer.json`, `go.mod`, etc.).
- Check the target: plain Docker host, Compose, Kubernetes, Fly/Render/Railway, ECS, Cloud Run. Port, health check, and env conventions depend on it.
- Look for an existing Dockerfile pattern in the org/repo and match it.

## 2. Dockerfile rules

- **Multi-stage**: `deps` → `build` → minimal `runtime`. Build tools and dev dependencies never reach the final image.
- **Pin base images** to a specific version (`node:22-alpine`, `php:8.3-fpm-alpine`, `python:3.12-slim`), and for production by digest if the team does that. Never `latest`.
- **Layer order for cache**: copy lockfiles → install deps → copy source → build. Use BuildKit cache mounts (`RUN --mount=type=cache,target=...`) for package managers.
- **Reproducible installs**: `npm ci` / `pnpm install --frozen-lockfile` / `composer install --no-dev --prefer-dist --optimize-autoloader` / `pip install --no-cache-dir -r requirements.txt`.
- **Non-root**: create or use an unprivileged user and `USER` it in the runtime stage. Files the app writes to are owned by that user.
- **One process per container**; use an exec-form `CMD ["node", "server.js"]` so signals reach the app. Use `tini`/`--init` if the app does not handle `SIGTERM`.
- `EXPOSE` the port the app listens on; the app binds `0.0.0.0`, not `localhost`.
- `HEALTHCHECK` (or the platform's health probe) hitting a cheap `/health` endpoint.
- Set `NODE_ENV=production` / `APP_ENV=production` etc. in the runtime stage.

## 3. Secrets — never in the image

- No secrets in `ENV`, `ARG`, copied `.env` files, or committed config. `ARG` values persist in image history.
- Build-time secrets (private registry tokens): `RUN --mount=type=secret,id=npmrc ...`.
- Runtime secrets come from the orchestrator (env injection, secret manager, Docker/Compose secrets).
- `.dockerignore` must exclude at least: `.git`, `.env*`, `node_modules`, `vendor` (if built in image), build output, logs, `*.pem`, local DB files, test artifacts, IDE folders.

## 4. Stack notes

- **Next.js**: set `output: "standalone"` in `next.config`, copy `.next/standalone`, `.next/static`, and `public` into the runtime image; run `node server.js`. `NEXT_PUBLIC_*` vars are inlined **at build time** — pass them as build args, not only at runtime.
- **NestJS / Node API**: build with `tsc`/`nest build`, then `npm ci --omit=dev` (or prune) in a separate stage; copy `dist` + production `node_modules`. Run `prisma generate` during build if Prisma is used, and `prisma migrate deploy` as a release step, not on every container start in multi-replica setups.
- **Laravel**: PHP-FPM + Nginx (two containers or a supervisor image per team convention), or FrankenPHP/Octane if the project uses it. Run `composer install --no-dev`, build front-end assets in a Node stage, then `php artisan config:cache route:cache view:cache` at start (after env is available). Storage and cache dirs writable by the app user. Run migrations as a one-off release job.

## 5. Compose (local / small deploys)

- Use `compose.yaml` with named volumes for data, `depends_on` with `condition: service_healthy`, and health checks on DB/cache services.
- Env via `env_file` that is gitignored; commit a `.env.example`.
- Don't publish DB ports to the host in production compose files.

## 6. Deploy pipeline

1. Build with BuildKit, tag with the **git SHA** (plus semver/`main` tags as needed).
2. Scan the image (`docker scout cves`, `trivy image`) and fail on critical vulnerabilities per team policy.
3. Push to the registry.
4. Run migrations as a separate, single release step.
5. Roll out with health checks; keep the previous tag for rollback. Document the rollback command.

## 7. Debugging

- Build fails → reproduce locally with `docker build --progress=plain --no-cache .`.
- Container exits immediately → `docker logs <c>`, then `docker run -it --entrypoint sh <image>` to inspect files and env.
- Works locally, not in container → binding to `localhost`, missing env var, wrong working dir, file permissions for the non-root user, or architecture mismatch (`--platform linux/amd64` vs arm64).
- Image too big → `docker history <image>` / `dive` to find the heavy layers.

## 8. Verify

Show: `docker build` succeeds; final image size (`docker images`); `docker run` starts and the health endpoint returns 200; container runs as non-root (`docker run --rm <image> id`); no secrets in `docker history --no-trunc`; image scan results.
