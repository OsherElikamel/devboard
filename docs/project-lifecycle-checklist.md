# Full-Stack Project Lifecycle Checklist

The ordered sequence of steps from "I have an idea" to "it's deployed and live." Based on real experience building DevBoard — the order matters, and skipping steps creates rework later.

---

## Phase 1: Planning (before writing any code)

- [ ] **Define what the project is** — one paragraph explaining the purpose, target user, and core value
- [ ] **List the core features** — what does v1.0 need to be useful? Be ruthless about scope. Everything else is "later"
- [ ] **Choose the tech stack** — framework, language, database, styling, auth approach. Write down WHY for each choice
- [ ] **Design the data model** — what entities exist (users, projects, tasks, etc.) and how do they relate? Sketch this on paper or in a quick diagram before touching code
- [ ] **Plan the API surface** — list every endpoint with method, path, and what it does. This becomes the contract between frontend and backend
- [ ] **Design the UI** — rough wireframes or sketches (Stitch AI, Figma, or paper). Know what pages exist and how they connect before building components
- [ ] **Define the folder structure** — for both frontend and backend. The structure communicates architecture at a glance

**Why this phase matters:** Changing a plan is free. Changing code is expensive. Thirty minutes of planning saves hours of refactoring.

---

## Phase 2: Project Setup

- [ ] **Create the repository** — `git init`, create the repo on GitHub, connect the remote
- [ ] **Set up .gitignore** — include node_modules, .env, venv, IDE files, OS files, build output BEFORE the first commit
- [ ] **Set up Docker Compose** (if multi-service) — database, backend, frontend services with hot-reload
- [ ] **Create .env.example files** — document every required environment variable with placeholder values
- [ ] **Create .env files locally** — copy from .env.example, fill in real local values
- [ ] **Set up the backend project** — framework boilerplate, config module reading from env vars, health check endpoint
- [ ] **Set up the frontend project** — framework boilerplate, design tokens (colors, fonts, spacing), base layout component
- [ ] **Set up the database** — ORM, base model class with timestamps, migration tool configured
- [ ] **Create the initial migration** — generate and apply it, verify the database starts clean
- [ ] **Verify everything runs** — `docker compose up`, hit the health endpoint, see the frontend in a browser
- [ ] **First commit** — commit the clean skeleton. This is your "known good state" to return to

**Why this phase matters:** A clean foundation prevents "it works on my machine" problems and makes every future step predictable.

---

## Phase 3: Backend Development

- [ ] **Build auth first** — register, login, token verification, protected route middleware. Everything else depends on knowing who the user is
- [ ] **Build the core data models** — create ORM models with relationships, generate migrations, apply them
- [ ] **Build CRUD for each resource** — follow the pattern: router → service → model → schema. One resource at a time, fully working before moving to the next
- [ ] **Add seed data** — create a seed script with realistic demo data. You'll use this constantly during frontend development
- [ ] **Test each endpoint** — use the auto-generated API docs (FastAPI's /docs, Swagger, etc.) to manually verify every endpoint works
- [ ] **Add any specialized endpoints** — dashboard summaries, aggregations, search, filtering

**Order within each resource:**
1. Model (database table)
2. Migration (apply schema change)
3. Schemas (request + response shapes)
4. Service (business logic)
5. Router (HTTP endpoints)
6. Test manually

---

## Phase 4: Frontend Development

- [ ] **Build the auth flow first** — login page, register page, auth context, protected routes, token storage, 401 redirect
- [ ] **Build the layout shell** — sidebar/navbar, topbar, page wrapper. This frames every page
- [ ] **Build pages one at a time** — start with the most complex page (it'll reveal API issues early). For each page: fetch data, handle loading/empty/error states, display components
- [ ] **Connect to the real API** — replace any mock data with actual API calls through the service layer
- [ ] **Add interactivity** — inline editing, modals, dropdowns, status toggles, form validation
- [ ] **Add polish** — animations, transitions, hover states, responsive behavior, dark/light mode
- [ ] **Test in the browser** — click through every feature. Check mobile. Check empty states. Check error states

**Why frontend comes after backend:** Building UI against a working API is straightforward. Building UI against imaginary endpoints means guessing at data shapes, then fixing mismatches later.

---

## Phase 5: Integration and Polish

- [ ] **Test the full flow end-to-end** — register a new user, create data, edit it, delete it, log out, log back in, verify data persisted
- [ ] **Add demo/guest mode** (if applicable) — let people explore without creating an account
- [ ] **Clean up code** — extract duplicated logic into shared utilities, remove console.logs, remove unused imports
- [ ] **Review the folder structure** — does it still make sense? Are files in logical places?
- [ ] **Check for security basics** — no secrets in code, ownership validation on mutations, CORS configured, passwords hashed
- [ ] **Test on mobile** — navigation, forms, modals, scrolling

---

## Phase 6: Documentation

- [ ] **Write the README** — what it is, tech stack, how to run it, project structure, API endpoints, environment variables
- [ ] **Verify .env.example is up to date** — every env var the app uses should be listed
- [ ] **Verify .gitignore is complete** — no build artifacts, no secrets, no IDE files in the repo
- [ ] **Clean up git history** — make sure no secrets were ever committed (if they were, rotate them)
- [ ] **Push to GitHub** — verify the repo looks professional. README renders correctly. No junk files

---

## Phase 7: Pre-Deployment

- [ ] **Test the production build locally** — frontend: `npm run build && npm run preview`. Backend: run without `--reload`
- [ ] **Generate a real JWT secret** — `openssl rand -hex 32`
- [ ] **Review CORS configuration** — ready to add the production frontend URL
- [ ] **Verify migrations are committed** — the production database starts empty, migrations create the schema
- [ ] **Verify the start command** — should run migrations then start the server: `alembic upgrade head && uvicorn ...`

---

## Phase 8: Deployment

- [ ] **Create the database** on the hosting platform (Render, Railway, etc.)
- [ ] **Create the backend service** — connect to GitHub repo, set root directory, set build + start commands, add all env vars
- [ ] **Wait for backend to deploy** — check logs, verify the health endpoint responds
- [ ] **Run migrations** — either automatically (in start command) or manually via shell
- [ ] **Seed demo data** (optional) — run the seed script via the platform's shell
- [ ] **Create the frontend service** — connect to same repo, set root directory, set build command + publish directory, add env vars
- [ ] **Update CORS** — add the frontend URL to the backend's CORS origins env var
- [ ] **Test the deployed app** — full end-to-end flow on the live URL
- [ ] **Update the README** — add the live URL, update any instructions that reference localhost

---

## Phase 9: Post-Deployment

- [ ] **Visit the live site** — verify everything works on the public URL
- [ ] **Test on a different device** — phone, different browser, incognito mode
- [ ] **Share the URL** — add it to your GitHub profile, portfolio, LinkedIn, resume
- [ ] **Monitor for issues** — check the hosting platform's logs periodically for the first few days
- [ ] **Plan v1.1** — now that it's live, what would you add next? Keep a list, prioritize, repeat the cycle

---

## Quick Reference: The Order Matters

```
Plan → Setup → Backend → Frontend → Polish → Docs → Deploy
```

Every time you skip ahead (building UI before the API exists, deploying before testing the build, coding before planning the data model), you create rework. The sequence feels slow at first but is faster overall.
