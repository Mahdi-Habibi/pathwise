# AGENTS.md

## Cursor Cloud specific instructions

Pathwise is being rebuilt as **آکادمی کیا (Kia Academy)** — Persian-first. Architecture notes: `docs/REBUILD_ARCHITECTURE.md`.

Monorepo: Node `>=22.13`, pnpm `11.13.0` via Corepack. Standard commands live in root `package.json` and `README.md`.

### Services

- `apps/web` — Next.js (port `3000`), default locale `fa` (RTL); proxies `/api` → API
- `apps/api` — NestJS + Prisma (port `3001`, `/api`)
- `packages/shared` — shared types/utils (must be built before seed/api)
- PostgreSQL 16 required

### Key routes

| Route | Purpose |
| --- | --- |
| `/` | Minimal Persian landing (Material + Education CTAs) |
| `/material` | Material Studio (ported, modular under `apps/web/src/features/material`) |
| `/education` | Iranian phone OTP → profile → assessment gate |
| `/assessment` | Wizard (requires complete profile) |
| `/learn/...` | Lesson player + video fullscreen + notes |

### Auth / OTP

- Phone-first OTP: `POST /api/auth/otp/request`, `POST /api/auth/otp/verify`, `POST /api/auth/profile`
- Iranian phone normalized to `09xxxxxxxxx`
- In non-production, OTP is returned as `devCode` and logged to the API console
- Email+password login remains for seeded admin (`admin@pathwise.dev` / `Pathwise123!`) and learner (`alex@pathwise.dev` / `Pathwise123!`)

### Commands

Typical: `pnpm install`, `pnpm --filter @pathwise/shared build`, `pnpm db:migrate:deploy`, `pnpm db:seed`, `pnpm dev`.

Lint / typecheck / test / build: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

### Payments

Default currency is **IRR**. Catalog prices live in `@pathwise/shared` `PRODUCT_PRICES`. Stripe remains optional; without it, checkout confirms in-dev as before. SMTP is also optional (emails log to console + `EmailLog`).

### Non-obvious Cloud VM caveats

- PostgreSQL is **not** started by the update script or `pnpm dev`. Docker is typically unavailable in Cloud Agent VMs — use a local Postgres 16 cluster: `sudo pg_ctlcluster 16 main start` (ignore `pnpm docker:db`). Role/DB `pathwise`/`pathwise` match `apps/api/.env.example`.
- The `pathwise` DB role needs `CREATEDB` because `pnpm db:migrate` (`prisma migrate dev`) creates a shadow database; without it you get Prisma `P3014`. Prefer `pnpm db:migrate:deploy` in non-interactive environments.
- Build order: `packages/shared` must be built before `pnpm db:seed` / api build, or seed fails with `MODULE_NOT_FOUND` for `@pathwise/shared/dist`. `pnpm build` handles this order itself.
- Env files are git-ignored — create from examples: `cp apps/api/.env.example apps/api/.env` and `cp apps/web/.env.example apps/web/.env.local`.
- E2E (`pnpm test:e2e`) needs a one-time browser install: `pnpm --filter @pathwise/web exec playwright install chromium`.
