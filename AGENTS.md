# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

INCLUSIONS 2.0 is a Next.js 14 (App Router) website for an inclusive event series in Zürich. It includes a public website, an admin CRM dashboard (`/admin-v2/*`), a crew portal (`/crew/*`), and an AI voice agent.

### Services

| Service | How to run | Port | Required? |
|---------|-----------|------|-----------|
| Next.js dev server | `npm run dev` | 3000 | Yes |
| PostgreSQL (Supabase) | `sudo docker compose -f backend/docker-compose.yml up -d supabase-db` | 54322 | Yes (for admin features) |

### Development Commands

See `package.json` for standard scripts: `npm run dev`, `npm run lint`, `npm run test`, `npm run build`.

### Non-obvious Caveats

- **No lockfile**: The repo has no `package-lock.json`. `npm install` will resolve versions fresh each time.
- **ESLint**: The project uses ESLint 8 with `eslint-config-next@14.0.4` (matching Next.js 14). ESLint 9+ is incompatible with Next.js 14's lint runner. The `.eslintrc.json` extends `next/core-web-vitals`.
- **Build vs Lint**: `next.config.js` has `eslint.ignoreDuringBuilds: true` because the codebase has pre-existing lint warnings (unescaped German apostrophes/quotes). `npm run lint` still reports them, but `npm run build` succeeds.
- **Pre-existing test failures**: 3 tests in `__tests__/auth.test.ts` fail because the tests expect `partner`/`unknown` roles but the auth module only returns `admin`/`crew`. This is a pre-existing issue.
- **Database env vars**: The app uses `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` for PostgreSQL (via `lib/db-postgres.ts`). Auth uses `ADMIN_SESSION_SECRET` (min 32 chars). See `.env.example` for all variables.
- **Docker in Docker**: Docker requires `fuse-overlayfs` storage driver and `iptables-legacy` in the Cloud VM. The daemon config at `/etc/docker/daemon.json` must set `"storage-driver": "fuse-overlayfs"`.
- **PostgreSQL default credentials**: Docker Compose defaults: user=`supabase_admin`, password=`your-super-secret-password-change-this`, port=54322, database=`postgres`.
- **Migrations**: Run backend migrations from `backend/migrations/` (000-004) against PostgreSQL. The Supabase init scripts in `backend/supabase/migrations/` run automatically on first container start.
- **Admin login**: For local dev, set `ADMIN_PASSWORD` in `.env.local`. The login endpoint `/api/auth/login` accepts email + password. Default admin emails are configured via `ADMIN_EMAILS`.
- **JSON fallback**: Public forms (newsletter, contact, VIP) fall back to JSON file storage in `/data/` when DB features are not critical, so the public site works without PostgreSQL.
