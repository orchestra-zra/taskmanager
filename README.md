# PlanJet (Task Manager)

Monorepo for PlanJet — a Telegram Mini App + Bot task and project manager.

## Structure

- `frontend/` — React + TypeScript + Vite + Tailwind CSS Telegram Mini App
- `backend/` — NestJS + Prisma (PostgreSQL) + GramJS Telegram Bot API
- `docker-compose.yml` — Full-stack Docker Compose (`postgres` + `backend` + `frontend` Nginx reverse proxy)
- `docker-compose.prod.yml` + `Caddyfile` — Production HTTPS reverse proxy overlay using Caddy (automatic Let's Encrypt TLS)

## Run Full Stack with Docker (Production / Team Deployment)

1. Configure `backend/.env` from `backend/.env.example` with your real PostgreSQL password and Telegram bot credentials (`DISABLE_GRAM_BOT=false`, `ENABLE_TEST_MODE=false` for production).
2. Copy `.env.example` to `.env` in the repository root and set `VITE_TELEGRAM_WEB_APP_URL` (for frontend builds) and `APP_DOMAIN` (for production HTTPS):
   ```env
   VITE_TELEGRAM_WEB_APP_URL="https://t.me/<your_bot_username>/<your_short_name>"
   APP_DOMAIN=tasks.yourdomain.com
   ```
3. Build and start locally (`http://localhost:3000`, proxying `/api/*` -> `backend:8000`):
   ```bash
   docker compose up -d --build
   ```
4. On your production VPS (with DNS A-record pointing `APP_DOMAIN` to your server and ports `80`/`443` open), launch with automatic HTTPS via Caddy:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   ```
   Then open `@BotFather` -> `/editapp` and set your Web App URL to `https://<APP_DOMAIN>`.

## Local Setup (Development with Hot-Reload)

1. Install dependencies from the repository root:
   ```bash
   npm install
   ```

2. Configure environment files:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`

3. Start PostgreSQL and run Prisma migrations:
   ```bash
   npm run db:up
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. Start both apps in development mode:
   ```bash
   npm run dev
   ```

## Individual Scripts

- `npm run dev:backend` / `npm run dev:frontend`
- `npm run build` (`build:backend` + `build:frontend`)
- `npm run lint:backend` / `npm run lint:frontend`
