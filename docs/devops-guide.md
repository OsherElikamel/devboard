# DevOps & Deployment Guide for DevBoard

A beginner-friendly guide covering SQL, Docker, environment variables, local vs. production differences, and step-by-step deployment to Render. Written for developers who are comfortable with frontend/backend code but new to infrastructure.

---

## The Big Picture: What Happens When Someone Visits Your App

Right now, your app works like this:

```
Your Computer
├── Frontend (React)    → localhost:5173
├── Backend (FastAPI)   → localhost:8000
└── Database (Postgres) → localhost:5432
```

Everything runs on your machine. When you deploy, the same three pieces need to exist somewhere on the internet:

```
The Internet
├── Frontend (static files) → devboard.onrender.com
├── Backend (Python server) → devboard-api.onrender.com
└── Database (Postgres)     → render-managed, internal URL
```

The only difference: instead of `localhost`, each service gets a real URL. That's it. The code is the same. The architecture is the same. Deployment is just "run your app on someone else's computer."

---

## Part 1: SQL and PostgreSQL — What You Already Have

### What PostgreSQL is

PostgreSQL is a **database server** — a program that stores structured data in tables and lets you query it. Think of it as a very powerful spreadsheet engine that runs in the background.

Your app has these tables (think of them as spreadsheets):

| Table | What it stores |
|-------|---------------|
| `users` | name, email, password_hash |
| `projects` | title, description, status, user_id |
| `tasks` | title, priority, is_done, project_id |
| `comments` | content, task_id, user_id |
| `technologies` | name, category |
| `project_technologies` | links projects ↔ technologies |
| `learning_notes` | title, content, project_id |

### How your code talks to the database

Raw SQL looks like this:
```sql
SELECT * FROM projects WHERE user_id = '...' AND deleted_at IS NULL;
```

But you never write that. Instead, SQLAlchemy (the ORM) lets you write Python:
```python
db.query(Project).filter(Project.user_id == user_id, Project.deleted_at.is_(None)).all()
```

SQLAlchemy translates your Python into SQL and sends it to PostgreSQL. That's the "ORM" layer — **Object-Relational Mapping**. Objects in Python ↔ Rows in the database.

### What Alembic does

When you change a model (add a column, create a new table), the database doesn't magically update. Alembic generates **migration files** — step-by-step instructions for changing the database structure.

You already have 2 migrations:
- `ed6318480d87_create_initial_tables.py` — creates all tables (users, projects, tasks, comments, technologies, learning_notes)
- `1a9d20f49a34_add_project_comments.py` — adds project-level comments

Each migration has an `upgrade()` function (apply changes) and a `downgrade()` function (undo changes). That's how migrations are reversible.

**The chain works like this:**

```
You change a Python model → run "alembic revision --autogenerate" → Alembic compares
your models to the current DB → generates a migration file → you run "alembic upgrade head"
→ the database changes to match your code
```

**Key insight:** the database and your code are two separate things. They can get out of sync. Migrations are the bridge that keeps them aligned.

---

## Part 2: Docker — What It Is and Why You Created It

### The problem Docker solves

Imagine sending your project to a friend. They'd need to:
1. Install Python 3.12 (exact version)
2. Install Node.js 22 (exact version)
3. Install PostgreSQL 16
4. Install all Python packages
5. Install all npm packages
6. Set up the database user and password
7. Configure environment variables
8. Start 3 different services in the right order

That's painful. Docker solves this by packaging each service into a **container** — a lightweight, isolated mini-computer with everything pre-installed.

### Your docker-compose.yml explained

#### Service 1: `db` (PostgreSQL)
```yaml
db:
  image: postgres:16-alpine          # Download PostgreSQL 16, small Linux version
  environment:
    POSTGRES_USER: devboard_user     # Create a database user with this name
    POSTGRES_PASSWORD: devboard_password  # Set its password
    POSTGRES_DB: devboard_db         # Create a database called this
  ports:
    - "5432:5432"                    # Make it accessible at localhost:5432
  volumes:
    - pgdata:/var/lib/postgresql/data  # Save data to disk so it survives restarts
```

**What it does:** Runs a PostgreSQL server. When Docker starts this container, it automatically creates the database and user for you. Without Docker, you'd need to install Postgres yourself, open the terminal, and run SQL commands to create the database and user manually.

#### Service 2: `pgadmin` (Database viewer)
A web UI to browse your database — like a visual spreadsheet editor for Postgres. Purely a development convenience, never needed in production.

#### Service 3: `backend` (FastAPI)
```yaml
backend:
  build: ./backend                   # Build from your backend/Dockerfile
  environment:
    DATABASE_URL: postgresql+psycopg://devboard_user:devboard_password@db:5432/devboard_db
```

Notice `@db:5432` in the DATABASE_URL — that `db` is the **name of the database service** defined above. Inside Docker Compose, services can reach each other by name. It's like Docker gives them nicknames on a private network. The backend says "connect to `db`" and Docker routes it to the PostgreSQL container.

#### Service 4: `frontend` (React/Vite)
Runs `npm run dev` to serve the React app with hot-reload.

#### The `volumes` section
```yaml
volumes:
  - ./backend:/app        # Mount your local code INTO the container
  - pgdata:/var/lib/...   # Persist database files between restarts
```

The code mount is why hot-reload works: when you edit a file on your computer, the container sees the change immediately because it's reading from your actual folder.

---

## Part 3: Local Development vs. Production — The Key Difference

This is the most important mental model shift.

### Local development (Docker Compose)

```
┌─ Your Computer ─────────────────────────────────────────┐
│                                                          │
│  docker compose up                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Frontend │  │ Backend  │  │ Postgres │  │ pgAdmin │ │
│  │ :5173    │→ │ :8000    │→ │ :5432    │  │ :5050   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                          │
│  Everything runs in Docker containers on YOUR machine.   │
│  All services talk to each other via Docker's network.   │
│  Source code is mounted so changes appear instantly.     │
└──────────────────────────────────────────────────────────┘
```

### Production (Render)

```
┌─ Render's Servers ──────────────────────────────────────┐
│                                                          │
│  ┌──────────────┐                                        │
│  │ Static Site  │  ← Built HTML/CSS/JS files             │
│  │ (Frontend)   │    No Node.js running, just files      │
│  │ devboard.    │    served by Render's CDN              │
│  │ onrender.com │                                        │
│  └──────┬───────┘                                        │
│         │ HTTPS requests to API                          │
│  ┌──────▼───────┐                                        │
│  │ Web Service  │  ← uvicorn running your FastAPI app    │
│  │ (Backend)    │    Render installs Python + pip         │
│  │ devboard-api.│    packages from requirements.txt      │
│  │ onrender.com │                                        │
│  └──────┬───────┘                                        │
│         │ SQL queries via DATABASE_URL                   │
│  ┌──────▼───────┐                                        │
│  │ Managed DB   │  ← Render runs Postgres for you        │
│  │ (PostgreSQL) │    Automatic backups, SSL enforced     │
│  │ internal URL │    Not accessible from the internet    │
│  └──────────────┘                                        │
│                                                          │
│  No Docker Compose. No Docker. Render handles each       │
│  service independently. You just give it your code.      │
└──────────────────────────────────────────────────────────┘
```

### The critical difference

| Aspect | Local (Docker Compose) | Production (Render) |
|--------|----------------------|-------------------|
| **Who runs everything** | Docker on your machine | Render's servers |
| **Frontend** | Node.js dev server (hot-reload) | Pre-built static files (just HTML/JS/CSS) |
| **Backend** | Uvicorn with `--reload` | Uvicorn without reload |
| **Database** | Postgres container you control | Render Managed Postgres (they maintain it) |
| **How services find each other** | Docker network names (`db`, `backend`) | Real URLs with HTTPS |
| **Docker needed?** | Yes (docker-compose) | **No** — Render reads your code directly |
| **Secrets** | In `.env` file or docker-compose.yml | In Render's dashboard (encrypted) |

**Key takeaway:** Docker Compose is your **local development tool**. In production, you do NOT use it. Render replaces Docker's job — it reads your code, installs dependencies, and runs your app directly.

---

## Part 4: Environment Variables and Secrets

### What environment variables actually are

They're key-value pairs that exist outside your code. Your app reads them at startup. They let you change behavior without changing code:

```
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname
JWT_SECRET_KEY=some_long_random_string
VITE_API_BASE_URL=http://localhost:8000/api
```

### Why not just hardcode them?

Three reasons:

1. **Secrets**: Your JWT secret and database password should never be in your code (which is on GitHub, public). Environment variables keep secrets out of git.

2. **Different values per environment**: Locally, the API is at `localhost:8000`. In production, it's at `devboard-api.onrender.com`. Same code, different config.

3. **Safety**: If someone finds your source code, they shouldn't be able to access your database. The real credentials only exist on Render's dashboard, never in your repo.

### How it works locally vs. production

**Locally:** Docker Compose provides them (look at the `environment:` blocks in your `docker-compose.yml`). Or they come from a `.env` file.

**On Render:** You type them into a web form in the dashboard. Render injects them into your app's runtime. They're encrypted at rest — even Render employees can't see your JWT secret.

```
Local:  docker-compose.yml → environment: JWT_SECRET_KEY: "local_dev_key"
Render: Dashboard form     → JWT_SECRET_KEY = "a7f3b9c1d4e8...long random string"
```

### The `.env` vs `.env.example` pattern

- `.env` — contains REAL values. **Never committed to git.** Listed in `.gitignore`.
- `.env.example` — contains FAKE/placeholder values. **Committed to git.** Documents what variables are needed.

Your `.env.example` says "you need these variables." Your `.env` has the actual values. A new developer clones the repo, copies `.env.example` to `.env`, fills in their values, and they're ready to go.

---

## Part 5: What Changes for Production (and Why)

There are exactly **4 things** that change between your local setup and production. All of them are environment variables — the code stays the same.

| Variable | Local value | Production value | Why it changes |
|----------|------------|-----------------|----------------|
| `DATABASE_URL` | `...@db:5432/devboard_db` | `...@some-render-host:5432/devboard_db?sslmode=require` | Render gives you a managed Postgres with its own URL and enforces SSL |
| `JWT_SECRET_KEY` | `devboard_local_secret_key_...` | `a7f3b9c1d4...` (64 random chars) | Local key is weak on purpose. Production needs a real cryptographic secret |
| `BACKEND_CORS_ORIGINS` | `["http://localhost:5173"]` | `["https://devboard-xyz.onrender.com"]` | The frontend URL changes — your backend needs to accept requests from the new origin |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | `https://devboard-api-xyz.onrender.com/api` | Frontend needs to know where the backend lives |

That's it. The entire deployment difference is these 4 values.

---

## Part 6: The Deployment Plan

### Prerequisites

- A free Render account (sign up with GitHub for easy repo connection)

### Step 1: Create the PostgreSQL database on Render

**Why first:** The backend needs a database URL to connect to. If you create the backend first, it'll crash on startup because there's no database.

**What to do:**
1. Go to Render dashboard → "New" → "PostgreSQL"
2. Name it `devboard-db`
3. Choose the free tier
4. Click "Create Database"
5. Wait for it to be ready, then copy the "Internal Database URL" — this becomes your `DATABASE_URL`

### Step 2: Create the backend Web Service on Render

**What happens:** Render reads your `backend/` code from GitHub, runs `pip install -r requirements.txt`, then starts your FastAPI app.

**What to do:**
1. Go to Render dashboard → "New" → "Web Service"
2. Connect your GitHub repo (OsherElikamel/devboard)
3. Set root directory to `backend`
4. Runtime: Python
5. Build command: `pip install -r requirements.txt`
6. Start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables:
   - `DATABASE_URL` = the Internal Database URL from Step 1
   - `JWT_SECRET_KEY` = generate with `openssl rand -hex 32`
   - `JWT_ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `60`
   - `BACKEND_CORS_ORIGINS` = `["https://YOUR-FRONTEND-URL.onrender.com"]` (update after Step 3)

**Why the start command has two parts:**
- `alembic upgrade head` — creates all database tables on first deploy, and applies any new migrations on future deploys
- `uvicorn app.main:app --host 0.0.0.0 --port $PORT` — starts the backend server
- The `&&` means: run migrations first, then start the server. If migrations fail, don't start (so you notice the problem).

### Step 3: Create the frontend Static Site on Render

**What happens:** Render reads your `frontend/` code, runs `npm install && npm run build`, and serves the resulting static files from `dist/`.

**What to do:**
1. Go to Render dashboard → "New" → "Static Site"
2. Connect the same GitHub repo
3. Set root directory to `frontend`
4. Build command: `npm install && npm run build`
5. Publish directory: `dist`
6. Add environment variable:
   - `VITE_API_BASE_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`

**Important:** For Vite, environment variables are baked into the JavaScript at **build time**, not runtime. That's why the frontend is a "Static Site" — there's no server running, just files.

### Step 4: Update CORS

Once you know both URLs, go back to the backend's environment variables and set:
```
BACKEND_CORS_ORIGINS=["https://devboard-xyz.onrender.com"]
```

Replace with your actual frontend URL. This tells the backend "accept requests from this origin."

### Step 5: Seed demo data (optional)

Run this in Render's shell (backend service → Shell tab):
```bash
python -m app.db.seed
```

This populates the demo user and sample projects.

---

## Part 7: What About Docker in Production?

**You don't need it.** Your Dockerfiles are for local development. Render has its own build system:

- For the backend: Render detects `requirements.txt`, installs Python, installs packages, runs your start command
- For the frontend: Render detects `package.json`, installs Node, runs `npm run build`, serves the output

The Dockerfiles stay in your repo (they're still useful for local dev), but Render ignores them when you configure the services as "Python" and "Static Site" instead of "Docker."

---

## Part 8: How Services Connect After Deployment

```
User's browser
    │
    │  visits https://devboard.onrender.com
    ▼
┌─ Render CDN ─────────────────────────────────┐
│  Serves index.html + JS + CSS (static files) │
│  The JS contains: VITE_API_BASE_URL =        │
│  "https://devboard-api.onrender.com/api"     │
└──────────────────┬────────────────────────────┘
                   │
                   │  JS makes axios requests to the backend URL
                   ▼
┌─ Render Web Service ─────────────────────────┐
│  FastAPI receives request                     │
│  Checks JWT token (Authorization header)      │
│  Checks CORS (is the origin allowed?)         │
│  Queries the database using DATABASE_URL      │
└──────────────────┬────────────────────────────┘
                   │
                   │  SQL queries via internal network
                   ▼
┌─ Render Managed PostgreSQL ──────────────────┐
│  Returns data                                 │
│  Not accessible from the internet             │
│  Only the backend can reach it                │
└───────────────────────────────────────────────┘
```

The flow is identical to local development. The only difference is URLs and HTTPS.

---

## Common Mistakes to Avoid

1. **Committing `.env` to git** — your secrets end up on GitHub. Always check `.gitignore` first.
2. **Using `localhost` in production env vars** — the services aren't on your computer anymore. Use the Render-provided URLs.
3. **Forgetting CORS** — the backend will reject requests from the frontend if the origin isn't in `BACKEND_CORS_ORIGINS`. You'll see a CORS error in the browser console.
4. **Weak JWT secret in production** — use `openssl rand -hex 32` to generate a proper one.
5. **Forgetting `?sslmode=require`** — Render's managed Postgres requires SSL. If the Internal Database URL doesn't include it, append it.
6. **Not running migrations** — the database starts empty. Without `alembic upgrade head`, there are no tables.
7. **Expecting hot-reload in production** — there's no `--reload` flag, no file watching. You deploy, it runs. To update, push to GitHub and Render auto-rebuilds.

---

## Project Completion Status

### What's done (30 tasks, ~79% complete)

**Backend:**
- Project structure, database models, all migrations
- JWT authentication (register, login, token verification)
- Full CRUD for projects, tasks, comments, technologies, learning notes
- Dashboard summary endpoint
- Demo mode with hardcoded data (6 endpoints)
- Docker Compose (4 services with hot-reload)
- Activity feed, deployment info fields

**Frontend:**
- All pages: Login, Register, Dashboard, Projects, Project Details, Tasks, Settings
- Task detail modal (ClickUp-style) with inline editing
- Clickable priority dropdown, inline project field editing
- Per-task comments UI, project activity feed
- Dark/light theme toggle with CSS custom properties
- Responsive sidebar with mobile drawer
- Donut chart, progress bars, stat cards
- Shared utilities extracted (format.ts, priority-constants.ts)
- README, .env.example, .gitignore
- Pushed to GitHub

### What's still pending (8 tasks)

| Task | Priority | Notes |
|------|----------|-------|
| Deploy backend + DB to Render | High | Next step |
| Deploy frontend to Render | High | After backend is live |
| Configure production CORS and env vars | High | Part of deployment |
| Write backend tests | High | pytest + httpx already in requirements |
| Build learning notes UI | Medium | Backend endpoints ready, needs a page |
| Polish responsive layout | Medium | Works but could be tighter on mobile |
| Add global error handling UI | Medium | Error boundaries, toast notifications |
| Add skeleton loading states | Low | Dashboard has them, other pages don't |
