# Pathwise — Adaptive Learning Platform

> **Business model** (from `education tech Prompt.docx`): Pathwise sells educational courses through personalized roadmaps. A **free goal-discovery assessment** shapes each learner's path. A **paid programming readiness test** (5 modules including English) unlocks advanced content. Learners buy courses individually or purchase a discounted roadmap bundle with mentor support. **Bootcamp challenges** award scores and unlock bonus content.

Full-stack monorepo: **Next.js 15** (frontend) + **NestJS 11** (backend) + **Prisma** (PostgreSQL).

**Live frontend (GitHub Pages):** https://mahdi-habibi.github.io/pathwise/

## GitHub Pages

The web app can be statically exported and served from this repository’s GitHub Pages project site
(`basePath` `/pathwise`). GitHub Pages hosts **only the frontend**. Auth, courses, and other API
features need a separately hosted NestJS + PostgreSQL backend.

### One-time GitHub setup

1. Repo **Settings → Pages → Build and deployment → Source**: **GitHub Actions**
2. Merge to `main` (or run **Deploy GitHub Pages** via Actions → workflow_dispatch)
3. Optional — connect a hosted API:
   - Repo **Settings → Variables → Actions**: `NEXT_PUBLIC_API_URL` = your API origin (no trailing slash)
   - On the API host set `CORS_ORIGIN=https://mahdi-habibi.github.io` (or the full Pages URL your CORS stack expects)

### Local static build

```bash
pnpm build:pages
# Output: apps/web/out  (serve with any static host; paths expect /pathwise/)
```

## Use on another device

The repository contains everything needed to recreate the project: application source, workspace
configuration, the exact pnpm lockfile, Prisma schema and migrations, seed data, Docker files,
tests, and safe environment templates. Dependencies, build output, local databases, Playwright
browsers, and secret `.env` files are intentionally not committed.

After cloning from GitHub:

```bash
git clone <your-github-repository-url>
cd pathwise
corepack enable
corepack prepare pnpm@11.13.0 --activate
pnpm install --frozen-lockfile

# Windows
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env.local

# macOS/Linux
# cp apps/api/.env.example apps/api/.env
# cp apps/web/.env.example apps/web/.env.local

pnpm docker:db
pnpm db:migrate
pnpm db:seed
pnpm dev
```

For browser tests on a new device, install the browser once:

```bash
pnpm --filter @pathwise/web exec playwright install chromium
pnpm test:e2e
```

Git synchronizes code and reproducible setup files, not live PostgreSQL data or secrets. Use
`pnpm db:seed` for the same development baseline on each device. If both devices must share
ongoing user/course data, point both installations at the same hosted PostgreSQL database and keep
its credentials in each device's ignored `apps/api/.env`.

## Quick start

### Option A — Local Postgres (recommended when Docker Engine won’t start)

If PostgreSQL is already installed on Windows (e.g. on `D:\Program Files\PostgreSQL\18`):

```bash
cd pathwise
pnpm install
pnpm --filter @pathwise/shared build
# apps/api/.env should use:
# DATABASE_URL=postgresql://pathwise:pathwise@localhost:5432/pathwise?schema=public
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### Option B — Local dev with Docker Postgres

Uses Docker for PostgreSQL only; run web + API with hot reload via pnpm.

```bash
cd pathwise
pnpm install
pnpm approve-builds bcrypt @prisma/client prisma esbuild sharp   # if prompted
pnpm docker:db                # start PostgreSQL container
cp .env.example apps/api/.env # DATABASE_URL uses localhost:5432
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @pathwise/shared build
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### Option C — Full Docker stack

Runs PostgreSQL, API, and web entirely in containers (production-like).

```bash
cd pathwise
pnpm docker:setup             # creates .env.docker from .env.docker.example
pnpm docker:up                # build images + start all services
```

- **Web:** http://localhost:3000
- **API:** http://localhost:3001/api
- **Health:** http://localhost:3001/api/health

> **Schema reset:** `pnpm docker:db:reset` then `pnpm db:migrate && pnpm db:seed` (local dev), or `pnpm docker:down && pnpm docker:up` with `SEED_DATABASE=true` (full stack).

**Demo account:** `alex@pathwise.dev` / `Pathwise123!`  
**Admin account:** `admin@pathwise.dev` / `Pathwise123!`

## Docker

| File                       | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `Dockerfile`               | Multi-stage build targets: `api`, `web`             |
| `docker-compose.yml`       | `postgres` (default) + `api`/`web` (`full` profile) |
| `docker/api-entrypoint.sh` | Wait for DB, migrate, optional seed, start API      |
| `.env.docker.example`      | Environment template for full Docker stack          |
| `.dockerignore`            | Build context exclusions                            |

### Docker commands

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `pnpm docker:db`       | Start PostgreSQL only (port 5432)       |
| `pnpm docker:db:down`  | Stop PostgreSQL                         |
| `pnpm docker:db:reset` | Wipe DB volume and restart PostgreSQL   |
| `pnpm docker:setup`    | Create `.env.docker` from example       |
| `pnpm docker:build`    | Build API + web images                  |
| `pnpm docker:up`       | Start full stack (postgres + api + web) |
| `pnpm docker:down`     | Stop full stack                         |
| `pnpm docker:logs`     | Tail logs for all services              |

### Networking

| Context                | `DATABASE_URL` host       | Web API calls                                            | Cookie note                                                      |
| ---------------------- | ------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| GitHub Pages           | n/a (API hosted elsewhere)| `NEXT_PUBLIC_API_URL` absolute origin                    | Set API `CORS_ORIGIN` to Pages origin; cookies use `SameSite=None` when CORS points at `github.io` |
| Local dev (`pnpm dev`) | `localhost`               | same-origin `/api` via Next rewrite (`API_PROXY_TARGET`) | Refresh cookie shared via same-origin `/api` proxy |
| Docker full stack      | `postgres` (service name) | same-origin `/api`; web container proxies to `api:3001`  | Keep web and API behind the same public host/domain              |

The API container connects to Postgres via the Docker network (`postgres:5432`). In local/Docker the browser calls the web origin; Next rewrites `/api/*` to Nest so auth cookies stay first-party. On GitHub Pages there is no rewrite — set `NEXT_PUBLIC_API_URL` to the API origin and configure CORS accordingly.

**Auth cookies:** the API sets an HttpOnly `refreshToken` cookie with `path=/`. Protected routes use client-side `RequireAuth` (static export cannot use Next.js middleware). For a separate API host + GitHub Pages frontend, ensure CORS allows credentials and the API cookie uses `SameSite=None` (enabled automatically when `CORS_ORIGIN` contains `github.io`).

### Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine + Compose v2 (Linux)
- Node.js 20+ and pnpm (for local dev workflow)
- **Windows:** CPU virtualization (Intel VT-x / AMD-V) must be **enabled in BIOS/UEFI**. Docker Desktop will not start without it.

### Troubleshooting: “virtualisation support wasn’t detected”

This is a firmware setting, not a Docker app bug. Check first:

```powershell
pnpm docker:check
# or: powershell -ExecutionPolicy Bypass -File scripts/check-docker-prereqs.ps1
```

If the script reports **Virtualization Enabled In Firmware = No**:

1. Restart the PC and enter BIOS (**Del** or **F2** — AMI BIOS on many desktops).
2. Open **Advanced** → **CPU Configuration** (or **Processor**).
3. Enable **Intel Virtualization Technology** (also labeled VT-x / Virtualization).
4. **Save & Exit** (often **F10**), boot Windows.
5. In an **elevated** PowerShell, enable WSL prerequisites, then reboot once:

```powershell
dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
wsl --update
wsl --set-default-version 2
```

6. Start **Docker Desktop**, wait until it is running, then:

```bash
pnpm docker:db
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Pathwise v2

| Feature     | Description                                                                          |
| ----------- | ------------------------------------------------------------------------------------ |
| PostgreSQL  | Docker Compose Postgres replaces SQLite for production-ready dev                     |
| Stripe      | Real Checkout Sessions when `STRIPE_SECRET_KEY` is set; dev mode completes instantly |
| Email       | Welcome, payment receipt, and readiness result emails via SMTP (or logged in dev)    |
| Admin panel | `/admin` — courses, lessons, challenges, users, platform stats (ADMIN role)          |
| E2E tests   | Playwright learner journey tests via `pnpm test:e2e`                                 |

### v2 environment variables

See `.env.example` for Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`), SMTP, and `APP_URL` (Stripe return URLs).

### v2 routes

| Route               | Description                     |
| ------------------- | ------------------------------- |
| `/admin`            | Admin stats dashboard           |
| `/admin/courses`    | Course CRUD + lesson management |
| `/admin/challenges` | Bootcamp challenge management   |
| `/admin/users`      | User list and role toggle       |
| `/checkout/success` | Stripe success return URL       |
| `/checkout/cancel`  | Stripe cancel return URL        |

### v2 API (admin)

| Method                | Path                               | Auth  |
| --------------------- | ---------------------------------- | ----- |
| GET                   | `/api/admin/stats`                 | ADMIN |
| GET/POST/PATCH/DELETE | `/api/admin/courses`               | ADMIN |
| POST                  | `/api/admin/courses/:slug/lessons` | ADMIN |
| GET/POST/PATCH        | `/api/admin/challenges`            | ADMIN |
| GET                   | `/api/admin/users`                 | ADMIN |
| PATCH                 | `/api/admin/users/:id/role`        | ADMIN |

## Security

| Layer            | Implementation                                                    |
| ---------------- | ----------------------------------------------------------------- |
| Authentication   | JWT access tokens + httpOnly refresh cookies                      |
| Passwords        | bcrypt hashing (min 8 chars, letter + number)                     |
| API protection   | JwtAuthGuard on all learner endpoints                             |
| Rate limiting    | @nestjs/throttler (100 req/min)                                   |
| HTTP headers     | Helmet (API), security headers (Next.js middleware + next.config) |
| Input validation | class-validator DTOs, ValidationPipe whitelist                    |
| Env validation   | Joi schema at API bootstrap                                       |
| CORS             | Restricted to `CORS_ORIGIN`                                       |
| Payments         | Server-side entitlement grants after payment confirm              |

## Routes

### Frontend

| Route                                   | Description                       |
| --------------------------------------- | --------------------------------- |
| `/`                                     | Landing + how it works            |
| `/assessment`                           | Free 6-stage wizard               |
| `/roadmap`                              | Personalized roadmap + purchase   |
| `/login`, `/register`                   | Authentication                    |
| `/checkout`                             | Readiness ($19) or bundle payment |
| `/checkout/success`, `/checkout/cancel` | Stripe return pages               |
| `/admin`                                | Admin panel (ADMIN role)          |
| `/dashboard`                            | Learner hub (auth required)       |
| `/courses`                              | Course catalog                    |
| `/learn/[course]/[lesson]`              | Lesson player                     |
| `/readiness`                            | Paid readiness gate               |
| `/readiness/test`                       | 5 interactive modules             |
| `/bootcamp`                             | Arena + leaderboard               |
| `/privacy`, `/terms`                    | Legal                             |

### API

| Method | Path                                                         | Auth            |
| ------ | ------------------------------------------------------------ | --------------- |
| POST   | `/api/auth/register`, `/login`, `/refresh`, `/logout`        | Public / cookie |
| GET    | `/api/auth/me`                                               | JWT             |
| GET    | `/api/health`                                                | Public          |
| POST   | `/api/payments/checkout`, `/confirm/:id`                     | JWT             |
| GET    | `/api/courses`, lessons, enroll, complete                    | JWT             |
| POST   | `/api/assessments`, `/roadmaps`, `/readiness`, `/challenges` | JWT             |

Free assessment works offline via localStorage; API sync requires login.

## Scripts

| Command                  | Description                        |
| ------------------------ | ---------------------------------- |
| `pnpm dev`               | Run web + API                      |
| `pnpm build`             | Build all packages                 |
| `pnpm test`              | Run all tests                      |
| `pnpm test:e2e`          | Run Playwright E2E (web)           |
| `pnpm db:migrate`        | Apply Prisma migrations (dev)      |
| `pnpm db:migrate:deploy` | Apply migrations (production / CI) |
| `pnpm db:seed`           | Seed user, courses, entitlements   |
| `pnpm docker:db`         | Start PostgreSQL container         |
| `pnpm docker:up`         | Start full Docker stack            |
| `pnpm docker:down`       | Stop full Docker stack             |

## Tech stack

Next.js 15 · React 19 · NestJS 11 · Prisma · PostgreSQL · Docker · TypeScript · pnpm · JWT · bcrypt · Stripe · Helmet · Throttler · Vitest · Jest · Playwright · lucide-react
