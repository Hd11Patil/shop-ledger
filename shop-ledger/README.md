# Shop Ledger

A production-ready, full-stack finance app for a small Pani Puri & Chaat street food shop. The owner logs daily sales, categorized expenses, and capital investments, and sees real-time profit/loss, dashboards, and exportable reports — built for fast one-handed mobile use at the stall.

## Architecture

```
shop-ledger/
├── client/          React + Vite + Tailwind + shadcn/ui (TypeScript)
├── server/          Node.js + Express + Drizzle ORM + Postgres (TypeScript)
├── shared/          Shared constants and types
├── docs/            API docs
├── tests/           Test scaffolding
├── docker-compose.yml
└── package.json     Root scripts (concurrently)
```

The client and server are independent npm packages with their own `package.json`, `.env`, and lifecycle. The root `package.json` provides convenience scripts to install both, run them in parallel, and build for production.

## Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS v4, shadcn/ui, TanStack Query, React Hook Form, Zod, Recharts, jsPDF, xlsx, axios.
- **Backend**: Node 20, Express 5, TypeScript, Drizzle ORM, Postgres, JWT auth (bcrypt), Zod validation, Helmet, CORS, Compression, Morgan, express-rate-limit, Pino logging.
- **Database**: PostgreSQL 14+.
- **Auth**: Local email + password with hashed credentials and JWT bearer tokens.

## Quickstart (local PC)

1. **Install prerequisites**
   - Node.js 20+
   - PostgreSQL 14+ (or Docker)

2. **Clone & install**
   ```bash
   cd shop-ledger
   npm run install:all
   ```

3. **Configure environment**

   Copy the example env files and edit them:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

   Set `DATABASE_URL` and `JWT_SECRET` in `server/.env`.

4. **Set up the database**

   Either run Postgres locally and create a database, or use Docker:
   ```bash
   docker compose up -d postgres
   ```

   Then push the schema and seed default data:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Run dev servers**
   ```bash
   npm run dev
   ```

   - Frontend → http://localhost:5173
   - Backend → http://localhost:8080

6. **Sign up**

   Open the app, click "Create account", and you're in. The first user becomes the shop owner.

## Production build

```bash
npm run build
npm start
```

The server serves the API. Deploy the client `dist/` to any static host (Netlify, Vercel, Nginx, S3 + CloudFront).

## Deploy (Vercel + Render)

### Backend (Render)

1. Create a **Web Service** with root directory `shop-ledger/server` (or use `render.yaml` Blueprint).
2. **Build command:** `npm ci && npm run build`  
   **Start command:** `npm start`  
   **Health check path:** `/api/healthz`
3. Set environment variables (see `server/.env.example`):
   - `NODE_ENV=production`
   - `DATABASE_URL` — Postgres connection string from Render Postgres or external provider
   - `JWT_SECRET` — at least 32 random characters
   - `CORS_ORIGIN` — your Vercel URL **without** a trailing slash, e.g. `https://joschaatpune.vercel.app`  
     For local testing too: `https://joschaatpune.vercel.app,http://localhost:5173`
4. After deploy, run schema once (Render Shell or locally against production DB):  
   `npm run db:push` and optionally `npm run db:seed`

### Frontend (Vercel)

1. Import the repo; set **Root Directory** to `shop-ledger/client`.
2. Add environment variable **`VITE_API_URL`** = `https://shop-ledger-fv4f.onrender.com/api` (include `/api`, no trailing slash).
3. Redeploy after changing `VITE_API_URL` (Vite bakes env vars at build time).

### Common production issues

| Symptom | Fix |
| -------- | ----- |
| CORS error in browser | Set `CORS_ORIGIN` on Render to the exact Vercel origin (no trailing `/`). |
| API calls go to wrong host | Set `VITE_API_URL` on Vercel and redeploy. |
| 401 after login | Ensure `JWT_SECRET` is set and stable across restarts. |
| DB connection fails | Use `DATABASE_SSL=auto` (default) for hosted Postgres. |

## Docker

The whole stack (Postgres + server + client) can be brought up with:
```bash
docker compose up --build
```

## Project commands

| Command            | Description                                         |
| ------------------ | --------------------------------------------------- |
| `npm run install:all` | Install root, server, and client dependencies    |
| `npm run dev`      | Run server + client in parallel (dev mode)          |
| `npm run build`    | Build server and client for production              |
| `npm start`        | Start the built server                              |
| `npm run db:push`  | Push Drizzle schema to the database                 |
| `npm run db:seed`  | Seed default categories and settings                |
| `npm run lint`     | Lint server and client                              |

## API

See [`docs/api.md`](./docs/api.md) for the full route map.

## License

MIT
