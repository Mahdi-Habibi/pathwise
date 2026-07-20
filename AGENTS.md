# AGENTS.md

## Cursor Cloud specific instructions

Pathwise is a pnpm monorepo (Node `>=22.13`, pnpm `11.13.0` via Corepack) with three workspace packages:

- `apps/web` — Next.js 15 frontend (port `3000`; proxies `/api` → API).
- `apps/api` — NestJS 11 backend + Prisma (port `3001`, base path `/api`).
- `packages/shared` — shared TypeScript library consumed by both apps.

Standard commands live in the root `package.json` scripts and `README.md` ("Local full stack"). Lint/typecheck/test/build: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Run dev stack: `pnpm dev` (web + api via `concurrently`).

### Non-obvious setup/run caveats

- PostgreSQL 16 is required and is NOT started by the update script or `pnpm dev`. Docker is not available in this VM; a local Postgres 16 cluster is used instead. Start it with `sudo pg_ctlcluster 16 main start` (ignore `pnpm docker:db`, which needs Docker). The `pathwise` role/`pathwise` DB match the default `DATABASE_URL` in `apps/api/.env.example`.
- The `pathwise` DB role needs `CREATEDB` (already granted) because `pnpm db:migrate` (`prisma migrate dev`) creates a shadow database. Without it you get Prisma error `P3014`.
- Build order matters: `packages/shared` must be built (`pnpm --filter @pathwise/shared build`) before `pnpm db:seed` and before the api build, because seed and api import from `@pathwise/shared/dist`. A fresh clone that only ran `pnpm install` will fail `pnpm db:seed` with a `MODULE_NOT_FOUND` for `@pathwise/shared/dist/index.js` until shared is built. `pnpm build` handles this order itself.
- Env files are git-ignored and must be created from examples: `cp apps/api/.env.example apps/api/.env` and `cp apps/web/.env.example apps/web/.env.local`. Defaults work out of the box against the local Postgres.
- Stripe and SMTP are optional: without `STRIPE_*`, checkout auto-completes in dev; without `SMTP_*`, emails are logged to console + the `EmailLog` table.
- Seeded accounts (from `pnpm db:seed`): learner `alex@pathwise.dev` / `Pathwise123!`, admin `admin@pathwise.dev` / `Pathwise123!`.
- E2E (`pnpm test:e2e`, Playwright) needs a one-time browser install: `pnpm --filter @pathwise/web exec playwright install chromium`. Playwright starts its own dev server.
