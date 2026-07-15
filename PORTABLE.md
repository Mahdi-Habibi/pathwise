# Pathwise — setup on a new device

This repository is a portable copy of the monorepo (source + lockfile). It does **not** include
`node_modules`, build output, local databases, browser binaries, or local `.env` secrets.

## Requirements

- Node.js **20+**
- **pnpm** (`npm i -g pnpm`)
- **PostgreSQL 16+** _or_ Docker Desktop (for Postgres)

## First run

```bash
cd pathwise
pnpm install
pnpm approve-builds bcrypt @prisma/client prisma esbuild sharp   # if prompted
pnpm --filter @pathwise/shared build

# Create env files from templates
copy .env.example apps\api\.env
copy apps\web\.env.example apps\web\.env.local
```

On macOS/Linux use `cp` instead of `copy`.

Edit `apps/api/.env` so `DATABASE_URL` matches your machine:

```
DATABASE_URL=postgresql://pathwise:pathwise@localhost:5432/pathwise?schema=public
```

### Database once

Create role + DB (psql as superuser), **or** use Docker:

```bash
# Docker Postgres
pnpm docker:db

# Local Postgres (psql):
# CREATE ROLE pathwise LOGIN PASSWORD 'pathwise' CREATEDB;
# CREATE DATABASE pathwise OWNER pathwise;

pnpm db:migrate
pnpm db:seed
pnpm dev
```

- **Web:** http://localhost:3000
- **API:** http://localhost:3001/api
- **Health:** http://localhost:3001/api/health

## Demo logins

| Role    | Email                | Password       |
| ------- | -------------------- | -------------- |
| Learner | `alex@pathwise.dev`  | `Pathwise123!` |
| Admin   | `admin@pathwise.dev` | `Pathwise123!` |

## Notes

- Windows: if Docker Engine fails, use a local PostgreSQL install (same `DATABASE_URL` as above).
- C: drive full? Install PostgreSQL on another drive (e.g. `D:\Program Files\PostgreSQL\18`).
- Do not commit real `.env` files; recreate them from `.env.example` on each machine.
- After `pnpm install`, always run migrate + seed before first login.
- Git synchronizes code and database migrations, not live PostgreSQL data. Use the same hosted
  database from both systems if you need shared ongoing data.
