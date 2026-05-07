# Architecture Decisions — DevBoard

A record of the non-obvious technical decisions made during this project, what the alternatives were, and why we chose what we did. Useful for interview prep, future reference, and understanding the reasoning behind the codebase.

Only decisions where there was a real alternative are listed. If the choice was obvious or had no meaningful tradeoff, it's not here.

---

## Backend Framework: FastAPI (not Flask, not Django)

**Chose:** FastAPI

**Alternatives considered:** Flask, Django

**Why FastAPI:**
- Auto-generated API docs (Swagger UI at `/docs`) — invaluable during frontend development
- Pydantic-native — request/response validation is built in, not bolted on
- Modern Python (type hints, async-ready) — matches how Python is written in 2025+
- Lightweight — no ORM opinion, no admin panel, no template engine. Bring your own components and choose the best tool for each layer

**Why not Flask:** Flask could work, but it has no built-in validation and no auto-docs. You'd need to add Flask-RESTful, Marshmallow, and flasgger — that's three extra packages to get what FastAPI gives you out of the box.

**Why not Django:** Too opinionated for this project. Django's ORM, admin, and template system are great for monolithic apps, but DevBoard is an API-only backend with a separate React frontend. Django REST Framework adds complexity without clear benefit at this scale.

**Would I choose the same again?** Yes. FastAPI is the best fit for "API backend with a separate frontend" in Python.

---

## ORM: SQLAlchemy 2.0 (not Django ORM, not raw SQL)

**Chose:** SQLAlchemy 2.0 with declarative models

**Alternatives considered:** Django ORM, raw SQL with psycopg, Tortoise ORM

**Why SQLAlchemy:**
- The most mature Python ORM — extensive documentation, battle-tested in production
- Framework-agnostic — works with FastAPI, Flask, or standalone scripts
- SQLAlchemy 2.0 modernized the API (mapped_column, type hints) — cleaner than legacy style
- Supports both sync and async — started with sync, can migrate to async later if needed

**Why not raw SQL:** Raw SQL is faster to write for simple queries but becomes unmanageable for relationships, joins, and migrations. The ORM prevents SQL injection by default and makes refactoring safe (rename a column → the ORM catches every reference).

**Would I choose the same again?** Yes. The learning curve is real, but the benefits compound as the project grows.

---

## Database: PostgreSQL (not SQLite, not MongoDB)

**Chose:** PostgreSQL 16

**Alternatives considered:** SQLite (simpler), MongoDB (NoSQL)

**Why PostgreSQL:**
- Industry standard for relational data — the most commonly used database in production web apps
- Proper UUID support, JSON columns, full-text search — features you'll need eventually
- Managed hosting available everywhere (Render, Railway, Supabase, AWS RDS)
- Learning PostgreSQL is a transferable skill — it's what most companies use

**Why not SQLite:** SQLite is perfect for prototyping but doesn't support concurrent writes (a problem when multiple users hit the API), doesn't have a network server (can't connect from a separate container), and isn't available as a managed service for deployment.

**Why not MongoDB:** The data in DevBoard is relational — users have projects, projects have tasks, tasks have comments. Relational data belongs in a relational database. MongoDB is better for unstructured/document data.

**Would I choose the same again?** Yes. PostgreSQL is the default choice unless there's a specific reason to use something else.

---

## Frontend Framework: React (not Next.js, not Vue)

**Chose:** React 19 with Vite

**Alternatives considered:** Next.js, Vue, Svelte

**Why React + Vite:**
- React is the most widely used frontend framework — largest ecosystem, most job postings, most community resources
- Vite is the fastest dev server — instant HMR, fast builds, ESM-native
- Client-side rendering is sufficient for this app — there's no SEO requirement (it's behind a login)
- Full control over routing and architecture — no framework opinions getting in the way

**Why not Next.js:** Next.js is React + SSR + file-based routing + API routes. DevBoard doesn't need server-side rendering (no public pages that need SEO), and it has its own backend (FastAPI). Next.js would add complexity without clear benefit, and its API routes would conflict with the existing backend.

**Why not Vue/Svelte:** Both are excellent frameworks. React was chosen for ecosystem size and job-market relevance. For a portfolio project, demonstrating React skills is more broadly applicable.

**Would I choose the same again?** Yes for this type of app. Would consider Next.js for a content-heavy site that needs SEO.

---

## Styling: Tailwind CSS v4 (not CSS modules, not styled-components)

**Chose:** Tailwind CSS v4

**Alternatives considered:** CSS modules, styled-components, vanilla CSS

**Why Tailwind:**
- Utility-first approach eliminates naming fatigue — no more inventing class names like `.project-card-header-wrapper`
- v4's `@theme` block replaces the config file — design tokens defined directly in CSS
- Co-located styles — you see the styling right in the JSX, not in a separate file
- Consistent spacing/sizing through the built-in scale
- Excellent dark mode support with the `dark:` variant

**Why not CSS modules:** CSS modules are solid but require constant context-switching between `.tsx` and `.module.css` files. For a solo developer, Tailwind's co-location is faster.

**Why not styled-components:** Runtime CSS-in-JS adds bundle size and hurts performance. Tailwind generates static CSS at build time — zero runtime cost.

**Would I choose the same again?** Yes. Tailwind v4 specifically is a big improvement over v3 (no config file, native CSS layers).

---

## Authentication: JWT in localStorage (not httpOnly cookies, not sessions)

**Chose:** JWT stored in localStorage, sent as Bearer token

**Alternatives considered:** httpOnly cookies, server-side sessions

**Why JWT in localStorage:**
- Simple to implement — the frontend stores the token and attaches it to every request via an Axios interceptor
- Stateless — the backend doesn't need to maintain a session store
- Works cleanly with a separate frontend and backend on different domains
- Standard approach for SPAs (single-page apps) with API backends

**Known tradeoff:** localStorage is vulnerable to XSS attacks — if an attacker injects JavaScript into the page, they can read the token. httpOnly cookies are immune to XSS because JavaScript can't access them.

**Why this tradeoff is acceptable for now:**
- The app has no user-generated HTML (no rich text editor, no markdown rendering with raw HTML). XSS vectors are minimal.
- httpOnly cookies require CSRF protection, SameSite configuration, and different CORS handling — significantly more complex
- Short token expiry (60 minutes) limits the damage window

**What I'd change in production:** For a public-facing app with sensitive data, migrate to httpOnly cookies with CSRF protection. For a portfolio project, JWT in localStorage is standard practice.

**Would I choose the same again?** Yes for a portfolio project. Would use httpOnly cookies for a real production app handling sensitive data.

---

## Soft Deletes (not hard deletes)

**Chose:** `deleted_at` nullable timestamp instead of `DELETE FROM` SQL

**Alternatives considered:** Hard delete (actually remove the row)

**Why soft deletes:**
- Data recovery — accidentally deleted a project? Set `deleted_at` back to NULL
- Audit trail — you can see what was deleted and when
- Referential integrity — hard-deleting a project would break tasks, comments, and technologies that reference it (or require cascading deletes that destroy everything)
- Standard practice in production apps — most SaaS tools use soft deletes

**The cost:** Every query needs `WHERE deleted_at IS NULL`. Easy to forget. The ORM makes this manageable, but it's an extra filter on every read query.

**Would I choose the same again?** Yes. The safety net is worth the minor query overhead.

---

## UUIDs for Primary Keys (not auto-increment integers)

**Chose:** UUID v4 primary keys

**Alternatives considered:** Auto-incrementing integers (1, 2, 3, ...)

**Why UUIDs:**
- Don't leak information — sequential integers reveal how many records exist (`/users/547` tells an attacker there are at least 547 users)
- Generated client-side — you can create the ID before inserting, which simplifies some patterns
- Globally unique — no collisions across tables or databases
- Standard for APIs — most modern APIs use UUIDs in URLs

**The cost:** UUIDs are longer in URLs (`/projects/a0000001-0000-0000-0000-000000000001` vs `/projects/1`) and slightly slower to index than integers. Neither matters at this scale.

**Would I choose the same again?** Yes. UUIDs are the default for API-driven apps.

---

## Deployment Platform: Render (not Vercel, not AWS, not Railway)

**Chose:** Render

**Alternatives considered:** Vercel + separate backend hosting, Railway, AWS, Fly.io

**Why Render:**
- All three services (static site, web service, managed PostgreSQL) in one dashboard
- Free tier available for all services — perfect for a portfolio project
- Simple setup — connect GitHub, set env vars, deploy. No Docker or CI/CD configuration needed
- Auto-deploys from GitHub on push

**Why not Vercel:** Vercel is excellent for frontends but doesn't host Python backends or PostgreSQL. Would require combining Vercel (frontend) + Railway or Render (backend + DB) — two platforms instead of one.

**Why not AWS:** Massively overkill for a portfolio project. EC2 + RDS + S3 + CloudFront requires DevOps knowledge that's not justified for this use case.

**Why not Railway:** Railway is comparable to Render. Render was chosen because it has a dedicated "Static Site" option optimized for frontend builds, and the dashboard is simpler.

**Known tradeoff:** Render's free tier has cold starts — the backend sleeps after 15 minutes of inactivity and takes ~30-50 seconds to wake up on the next request.

**Would I choose the same again?** Yes for a portfolio project. Would evaluate Railway and Fly.io for a project that needs always-on performance without paying $14/mo.

---

## Demo/Guest Mode: Separate Endpoints (not shared logic with a fake user)

**Chose:** Completely separate demo endpoints (`/api/demo/...`) returning hardcoded data

**Alternatives considered:** Creating a real "demo" user account and sharing the same endpoints

**Why separate endpoints:**
- Demo data is predictable — the demo experience is consistent for every visitor, not affected by other users' actions
- No database dependency — demo mode works even if the database is down or empty
- No security risk — demo users can't accidentally access or modify real data
- Easy to maintain — demo data is defined in code, not in database state that could be corrupted

**The cost:** Some code duplication — the frontend has `if (isDemo) { callDemoEndpoint() } else { callRealEndpoint() }` logic in several places.

**Would I choose the same again?** Yes. The isolation and predictability are worth the small amount of conditional logic.
