# Deployment Walkthrough — DevBoard on Render

A detailed record of deploying a full-stack project (React + FastAPI + PostgreSQL) to Render for the first time. Includes every step taken, every error encountered, and how each was solved. Written as a learning resource for future deployments.

---

## What We Deployed

Three separate services on Render, all connected:

```
┌──────────────────────────┐
│  Static Site (Frontend)  │  React app built into static HTML/CSS/JS
│  devboard-frontend-bqd.  │  Served by Render's CDN
│  onrender.com            │
└───────────┬──────────────┘
            │  HTTPS API requests
┌───────────▼──────────────┐
│  Web Service (Backend)   │  FastAPI + uvicorn
│  devboard-api-d4c8.      │  Render installs Python + pip packages
│  onrender.com            │
└───────────┬──────────────┘
            │  SQL queries via internal URL
┌───────────▼──────────────┐
│  Managed PostgreSQL      │  Render manages the server
│  Internal URL only       │  Automatic backups, SSL enforced
└──────────────────────────┘
```

**Total cost: $0/month** (all free tier)

---

## Pre-Deployment Code Changes

Before deploying, we needed one code change. Render provides database URLs in the format `postgresql://...`, but SQLAlchemy with the psycopg3 driver requires `postgresql+psycopg://...`. We added an auto-conversion property in the config.

**File: `backend/app/core/config.py`**
```python
@property
def database_url_for_sqlalchemy(self) -> str:
    url = self.DATABASE_URL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url
```

Then updated `database.py` and `alembic/env.py` to use `settings.database_url_for_sqlalchemy` instead of `settings.DATABASE_URL` directly.

**Why this matters:** Without this, the backend would crash on startup with a database connection error because SQLAlchemy wouldn't recognize the URL format. This is a common gotcha when deploying to any managed PostgreSQL provider.

---

## Step 1: Create Render Account

1. Go to render.com
2. Sign up with GitHub (use the account that owns the repo)
3. After signing in, go to GitHub app permissions and grant Render access to the specific repo (Settings → Configure account → select the repo)

**Gotcha:** Render only sees repos you've explicitly granted access to. If your repo doesn't show up, click "Configure account" under the GitHub section and add it.

---

## Step 2: Create PostgreSQL Database

**Dashboard → + New → PostgreSQL**

| Setting | Value | Why |
|---------|-------|-----|
| Name | `devboard-db` | Identifies the database in Render's dashboard |
| Database | `devboard_db` | The actual PostgreSQL database name |
| User | `devboard_user` | The database user |
| Region | Frankfurt (EU Central) | Closest to our location (Israel). Choose the region nearest to your users |
| PostgreSQL Version | 16 | Matches what we developed with locally |
| Plan | Free | $0/month, 1 GB storage, expires after 90 days |

After creation, Render shows connection details. The key value is the **Internal Database URL** — this is what the backend uses to connect. It looks like:
```
postgresql://devboard_user:RANDOM_PASSWORD@dpg-XXXXX-a/devboard_db_XXXX
```

**Important:** The Internal URL is only accessible from other Render services in the same region. It's not reachable from your local machine or the internet — that's a security feature.

---

## Step 3: Create Backend Web Service

**Dashboard → + New → Web Service → select the repo**

| Setting | Value | Why |
|---------|-------|-----|
| Name | `devboard-api` | Becomes part of the URL: devboard-api-XXXX.onrender.com |
| Language | **Python** (not Docker!) | Render installs Python and pip packages directly. Docker is for local dev only |
| Branch | main | Deploy from the main branch |
| Root Directory | `backend` | Tells Render to run commands from the backend/ subfolder |
| Region | Frankfurt (EU Central) | **Must match the database region** for internal networking to work |
| Build Command | `pip install -r requirements.txt` | Installs all Python dependencies |
| Start Command | `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT` | Runs migrations first, then starts the server |
| Plan | Free | $0/month, sleeps after 15 min of inactivity |

### Environment Variables

| Key | Value | Why |
|-----|-------|-----|
| `DATABASE_URL` | The Internal Database URL from Step 2 | Connects to the managed PostgreSQL |
| `JWT_SECRET_KEY` | Random 64-char hex string (generate with `openssl rand -hex 32`) | Cryptographic secret for signing JWT tokens. Must be random and long in production |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Tokens expire after 1 hour |
| `BACKEND_CORS_ORIGINS` | `["https://YOUR-FRONTEND.onrender.com"]` | Allows the frontend to make API requests. Update after creating the frontend |
| `PYTHON_VERSION` | `3.12.3` | Ensures Render uses the right Python version |
| `PYTHONPATH` | `/opt/render/project/src/backend` | Tells Python where to find the `app` module (see Error #1 below) |

### About the Start Command

```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

This does two things in sequence:
1. `alembic upgrade head` — applies all database migrations (creates tables on first deploy, applies new migrations on future deploys)
2. `uvicorn app.main:app --host 0.0.0.0 --port $PORT` — starts the FastAPI server

The `&&` means: only start the server if migrations succeed. If migrations fail, the deploy fails (which is what you want — better to fail loudly than run with a broken database).

`$PORT` is set by Render automatically — it tells your app which port to listen on. Never hardcode a port number in production.

---

## Step 4: Create Frontend Static Site

**Dashboard → + New → Static Site → select the repo**

| Setting | Value | Why |
|---------|-------|-----|
| Name | `devboard-frontend` | Becomes part of the URL |
| Branch | main | Deploy from main |
| Root Directory | `frontend` | Commands run from the frontend/ subfolder |
| Build Command | `npm install && npm run build` | Installs packages, then builds the production bundle |
| Publish Directory | `dist` | Where Vite outputs the built files |

### Environment Variables

| Key | Value | Why |
|-----|-------|-----|
| `VITE_API_BASE_URL` | `https://devboard-api-XXXX.onrender.com/api` | Tells the frontend where the backend lives. Baked into the JS at build time |

### Critical: Add Rewrite Rule

**Redirects/Rewrites** (left sidebar) → Add rule:

| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | Rewrite |

**Why this is needed:** React Router handles routing in the browser (client-side). When someone visits `/dashboard` directly (or refreshes the page), Render looks for a file called `dashboard` on disk — which doesn't exist. The rewrite tells Render: "for ANY URL, serve `index.html` instead, and let React Router figure out which page to show."

Without this rule:
- Visiting the root URL → "Not Found"
- Refreshing any page → "Not Found"
- Sharing a direct link to `/projects/123` → "Not Found"

With this rule:
- Every URL loads `index.html` → React Router reads the URL → renders the correct page

---

## Step 5: Update CORS

After the frontend is deployed and you know its URL:

1. Go to **devboard-api** → **Environment**
2. Update `BACKEND_CORS_ORIGINS` to: `["https://devboard-frontend-XXXX.onrender.com"]`
3. Save → Render auto-redeploys the backend

**Why:** CORS (Cross-Origin Resource Sharing) is a browser security feature. When the frontend at `devboard-frontend.onrender.com` makes API requests to `devboard-api.onrender.com`, the browser asks the backend: "do you accept requests from this origin?" If the origin isn't in the CORS list, the browser blocks the request.

---

## Errors We Hit and How We Solved Them

### Error 1: `ModuleNotFoundError: No module named 'app'`

**When:** Backend deploy — migrations failed on startup.

**What happened:** Alembic tried to import `from app.core.config import settings`, but Python couldn't find the `app` module. Locally, our Dockerfile had `ENV PYTHONPATH=/app` which told Python where to look. Render doesn't have this.

**Fix:** Added `PYTHONPATH=/opt/render/project/src/backend` as an environment variable. This tells Python: "the `app` package is in this directory."

**Lesson:** When deploying a Python project with imports like `from app.xxx import yyy`, you may need to set `PYTHONPATH` to the directory containing the `app` package. In Docker we do this in the Dockerfile; on Render we do it via environment variables.

### Error 2: TypeScript build error — unused variable

**When:** Frontend build failed.

**Error:** `error TS6133: 'isDemo' is declared but its value is never read.`

**What happened:** A component destructured `isDemo` from props but never used it. TypeScript's strict mode treats unused variables as errors during `tsc -b` (the build command), even though it's fine during development.

**Fix:** Removed the unused variable from the destructuring pattern. Ran `npx tsc -b` locally first to verify no other errors before pushing.

**Lesson:** Always run the production build command locally (`npm run build` or `tsc -b && vite build`) before deploying. Errors that don't show during `npm run dev` can appear during the stricter production build.

### Error 3: Auto-deploy didn't trigger

**When:** After pushing the TypeScript fix, the frontend didn't rebuild.

**What happened:** When the first deploy fails, Render may not set up the auto-deploy webhook properly. Subsequent pushes don't trigger a rebuild.

**Fix:** Clicked "Manual Deploy" → "Deploy latest commit" on the Render dashboard.

**Lesson:** If a push doesn't trigger a rebuild, use Manual Deploy. Auto-deploy works reliably after the first successful deploy.

### Error 4: "Not Found" on root URL

**When:** Visiting the frontend URL directly showed a plain "Not Found" page.

**What happened:** Render looked for a physical file matching the URL path. Since React apps are single-page applications (one `index.html` that handles all routes via JavaScript), there's no file for `/` or `/dashboard` or `/projects`.

**Fix:** Added a rewrite rule: `/*` → `/index.html` (Rewrite action).

**Lesson:** Every SPA (React, Vue, Angular) deployed as a static site needs this rewrite rule. Without it, only the root URL works — all other routes break on direct access or page refresh.

### Error 5: Database URL format mismatch

**When:** Pre-deployment (caught before it could cause a runtime error).

**What happened:** Render provides database URLs starting with `postgresql://`, but SQLAlchemy with psycopg3 requires `postgresql+psycopg://`. Pasting Render's URL directly would crash the backend.

**Fix:** Added a property in `config.py` that auto-converts the URL prefix. The backend accepts any format and converts it internally.

**Lesson:** Different database drivers expect different URL prefixes. When using a managed database provider, check what format they provide and what format your ORM expects. A conversion layer in config prevents this from being an issue.

---

## The Deployment Lifecycle Going Forward

### Making changes

```
1. Edit code locally
2. Test locally (docker compose up)
3. Run the production build locally to catch errors:
   - Backend: the code itself (Python doesn't have a "build")
   - Frontend: npm run build (catches TypeScript errors)
4. git add, git commit, git push
5. Render auto-detects the push and rebuilds (1-3 minutes)
6. Changes are live
```

### Adding a new environment variable

1. Add the variable to your code
2. Push to GitHub
3. Go to Render dashboard → your service → Environment
4. Add the new key/value
5. Save → Render redeploys with the new variable

### Checking logs

Render dashboard → your service → Logs. Shows real-time output from your server — useful for debugging production issues.

### If the backend is sleeping (free tier cold start)

The free tier puts the backend to sleep after 15 minutes of inactivity. The next request takes 30-50 seconds. To "warm it up" before showing someone, just visit the API health endpoint: `https://devboard-api-XXXX.onrender.com/api/health`

---

## Final Architecture

```
User's browser
    │
    │  visits https://devboard-frontend-bqd.onrender.com
    ▼
┌─ Render Static Site ─────────────────────────┐
│  Serves index.html + JS + CSS                │
│  Rewrite rule: /* → /index.html              │
│  JS contains: VITE_API_BASE_URL =            │
│  "https://devboard-api-d4c8.onrender.com/api"│
└──────────────────┬────────────────────────────┘
                   │  axios requests to backend
                   ▼
┌─ Render Web Service ─────────────────────────┐
│  FastAPI receives request                     │
│  Checks CORS (is origin in the allowed list?) │
│  Checks JWT token (Authorization header)      │
│  Queries database using DATABASE_URL          │
│  Returns JSON response                        │
└──────────────────┬────────────────────────────┘
                   │  SQL queries via internal network
                   ▼
┌─ Render Managed PostgreSQL ──────────────────┐
│  Stores all data (users, projects, tasks)     │
│  Not accessible from the internet             │
│  Only the backend can reach it (same region)  │
│  SSL enforced, automatic backups              │
└───────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Deployment is just environment variables.** The code is identical to local. Only 4 values change: DATABASE_URL, JWT_SECRET_KEY, CORS_ORIGINS, and VITE_API_BASE_URL.

2. **Docker is for local development, not production.** Render replaces Docker's job — it reads your code, installs dependencies, and runs your app directly.

3. **Always test the production build locally first.** `npm run build` catches errors that `npm run dev` doesn't. Save yourself a failed deploy.

4. **SPAs need a rewrite rule.** Any React/Vue/Angular app deployed as a static site needs `/* → /index.html` so client-side routing works.

5. **Read the deploy logs.** When something fails, the answer is almost always in the logs. Every error we hit was clearly stated in the log output.

6. **The database URL format matters.** Different providers use different prefixes. Build a conversion layer so your code handles any format.

7. **PYTHONPATH may be needed.** When deploying Python apps that use package imports (`from app.xxx`), you may need to set PYTHONPATH to the directory containing the package.

8. **Free tier is enough for portfolio projects.** The only real limitation is cold starts (30-50 seconds after 15 min idle) and the 90-day database expiry.
