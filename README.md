# Pathwise — Adaptive Learning Platform

> **Business model** (from `education tech Prompt.docx`): Pathwise sells educational courses through personalized roadmaps. A **free goal-discovery assessment** shapes each learner's path. A **paid programming readiness test** (5 modules including English) unlocks advanced content. Learners buy courses individually or purchase a discounted roadmap bundle with mentor support. **Bootcamp challenges** award scores and unlock bonus content.

Full-stack monorepo: **Next.js 15** (frontend) + **NestJS 11** (backend) + **Prisma** (PostgreSQL).

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

## Deploy from GitHub

This monorepo is set up for GitHub-native CI and container deployment:

| Piece | What it does |
| ----- | ------------ |
| `.github/workflows/ci.yml` | On every push/PR to `main`: install, migrate against Postgres, lint, typecheck, test, and build |
| `.github/workflows/docker-publish.yml` | On push to `main` (and version tags): build and push `pathwise-api` / `pathwise-web` images to **GitHub Container Registry** (`ghcr.io`) |
| `docker-compose.ghcr.yml` | Run the published images on any host with Docker (no local build required) |
| Dependabot | Weekly npm / Actions / Docker update PRs |

### 1. Enable package writes (one-time)

After the first successful `Docker publish` run, open **GitHub → Packages** for this repo and confirm `pathwise-api` and `pathwise-web` appear. If packages are private, grant read access to deploy machines (or make them public under package settings).

### 2. Deploy with GHCR images

On the server:

```bash
git clone https://github.com/Mahdi-Habibi/pathwise.git
cd pathwise
cp .env.docker.example .env.docker
# Edit .env.docker: set strong JWT_* secrets, CORS_ORIGIN, APP_URL, NEXT_PUBLIC_APP_URL,
# and production POSTGRES_PASSWORD / DATABASE_URL credentials.

# Lowercase GitHub username or org that owns the packages:
export GHCR_OWNER=mahdi-habibi
# Optional pin: export PATHWISE_TAG=latest   # or a semver / sha-* tag from Actions

# Authenticate to pull private packages (skip if packages are public):
echo "$GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

pnpm docker:ghcr:pull   # or: docker compose -f docker-compose.ghcr.yml --env-file .env.docker pull
pnpm docker:ghcr:up
```

- **Web:** http://localhost:3000 (or your public host / reverse proxy)
- **API health:** http://localhost:3001/api/health

Put a reverse proxy (Caddy, nginx, Traefik) in front of port 3000 and terminate TLS there. Keep the browser on the **same origin** as `/api` so auth cookies stay first-party.

### 3. Local full-stack build (no registry)

```bash
pnpm docker:setup
pnpm docker:up
```

### Production checklist

- [ ] Replace all `change-me-*` JWT secrets (32+ random characters each)
- [ ] Use a strong `POSTGRES_PASSWORD` and matching `DATABASE_URL`
- [ ] Set `CORS_ORIGIN`, `APP_URL`, and `NEXT_PUBLIC_APP_URL` to your public HTTPS URL
- [ ] Set `SEED_DATABASE=false` after the first boot (demo data only for staging)
- [ ] Configure Stripe / SMTP env vars when enabling payments and email
- [ ] Never commit `.env`, `.env.docker`, or real secrets — only `*.example` templates

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
| `pnpm docker:ghcr:pull`| Pull API/web images from GitHub Packages|
| `pnpm docker:ghcr:up`  | Start stack from GHCR images            |
| `pnpm docker:ghcr:down`| Stop GHCR-based stack                   |

### Networking

| Context                | `DATABASE_URL` host       | Web API calls                                            | Cookie note                                                      |
| ---------------------- | ------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| Local dev (`pnpm dev`) | `localhost`               | same-origin `/api` via Next rewrite (`API_PROXY_TARGET`) | Refresh cookie is set on the web origin so middleware can see it |
| Docker full stack      | `postgres` (service name) | same-origin `/api`; web container proxies to `api:3001`  | Keep web and API behind the same public host/domain              |

The API container connects to Postgres via the Docker network (`postgres:5432`). The browser calls the web origin; Next rewrites `/api/*` to Nest so auth cookies stay first-party.

**Auth cookies:** the API sets an HttpOnly `refreshToken` cookie with `path=/`. For route middleware to observe it, the browser must receive `Set-Cookie` from the **web** origin (same-origin `/api` proxy) or both apps must share a parent domain via reverse proxy. Do not point `NEXT_PUBLIC_API_URL` at a different origin in production unless that origin can share cookies with the web app.

### Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine + Compose v2 (Linux)
- Node.js 22.13+ and pnpm 11 (for local dev workflow; required by `packageManager`)
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
| `pnpm docker:ghcr:up`    | Deploy from GitHub Container Registry |
| `pnpm docker:ghcr:pull`  | Pull latest GHCR images            |

## Tech stack

Next.js 15 · React 19 · NestJS 11 · Prisma · PostgreSQL · Docker · TypeScript · pnpm · JWT · bcrypt · Stripe · Helmet · Throttler · Vitest · Jest · Playwright · lucide-react
