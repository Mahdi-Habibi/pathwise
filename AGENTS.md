# AGENTS.md

## Cursor Cloud specific instructions

Pathwise is being rebuilt as **آکادمی کیا (Kia Academy)** — Persian-first. Architecture notes: `docs/REBUILD_ARCHITECTURE.md`.

### Services

- `apps/web` — Next.js (port `3000`), default locale `fa` (RTL)
- `apps/api` — NestJS + Prisma (port `3001`, `/api`)
- `packages/shared` — shared types/utils (build before seed/api)
- PostgreSQL 16 required (`sudo pg_ctlcluster 16 main start` in this VM; Docker may be unavailable)

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
- Email+password login remains for seeded admin (`admin@pathwise.dev` / `Pathwise123!`)

### Commands

See root `package.json` / `README.md`. Typical: `pnpm install`, `pnpm --filter @pathwise/shared build`, `pnpm db:migrate:deploy`, `pnpm db:seed`, `pnpm dev`.

Lint / typecheck / test: `pnpm lint`, `pnpm typecheck`, `pnpm test`.

### Payments

Default currency is **IRR**. Catalog prices live in `@pathwise/shared` `PRODUCT_PRICES`. Stripe remains optional; without it, checkout confirms in-dev as before.
