# Backend Project Standards

This document defines the professional standard expected for any backend project I build, regardless of the specific technology stack. It covers architecture, code quality, security, database management, API design, and production readiness.

Give this file to an AI coding assistant at the start of a project so it understands the level of quality expected from the very first file.

---

## Philosophy

A backend isn't "done" when the endpoints return data. It's done when the code is structured so that adding a new feature, fixing a bug, or onboarding a new developer doesn't require understanding the entire codebase.

Build for the developer who inherits this project in six months — even if that developer is you.

---

## Before Writing Code

### Plan the architecture first
Before creating any files, decide:
- What resources/entities exist (users, projects, tasks, etc.)
- How they relate to each other (one-to-many, many-to-many)
- What the API surface looks like (which endpoints, what data they return)
- How authentication and authorization work
- What data the client needs vs. what stays internal
- How the database schema should be structured

Write this down. Even a rough entity-relationship sketch prevents structural rework later.

### Design the folder structure
The folder structure should separate concerns clearly. Anyone looking at the project tree should know where to find business logic vs. HTTP handling vs. database models.

**Principles:**
- **Routers/Controllers** — handle HTTP concerns only: parse requests, call services, return responses. No business logic.
- **Services** — contain all business logic. Pure functions/classes that don't know about HTTP. Easily testable.
- **Models** — define database tables and relationships. No business logic beyond simple computed properties.
- **Schemas** — define request/response shapes. Separate input schemas from output schemas — what you accept and what you return are different decisions.
- **Config** — centralized configuration from environment variables. One place to read all settings.
- **Middleware/Dependencies** — cross-cutting concerns like auth, database sessions, rate limiting.

**Example structure (adapt to your framework):**
```
backend/
├── app/
│   ├── core/           # Config, security, shared dependencies
│   ├── db/             # Database connection, base class, migrations, seed data
│   ├── models/         # ORM models (one file per entity)
│   ├── schemas/        # Request/response validation schemas (one file per entity)
│   ├── routers/        # Route handlers (one file per resource)
│   ├── services/       # Business logic (one file per resource, matching its router)
│   └── utils/          # Shared helper functions
├── tests/              # Test files mirroring the app structure
├── .env                # Local secrets (never committed)
├── .env.example        # Documents required variables (committed)
└── requirements.txt / package.json / go.mod  # Pinned dependencies
```

---

## Architecture Rules

### Separation of concerns is non-negotiable
This is the single most important rule:

```
HTTP Request
    ↓
Router (parse request, validate input, call service)
    ↓
Service (business logic, database queries, authorization checks)
    ↓
Model (data structure, relationships)
    ↓
Schema (shape the response, hide internal fields)
    ↓
HTTP Response
```

**Why this matters:** When business logic lives in routers, you can't reuse it, test it independently, or reason about it without thinking about HTTP. When database queries live in services, you can swap the database without touching HTTP. When schemas control the response, you never accidentally expose internal fields.

### Each layer has one job

| Layer | Knows about | Does NOT know about |
|-------|------------|-------------------|
| Router | HTTP, request/response | Database queries, business rules |
| Service | Business logic, database | HTTP status codes, request objects |
| Model | Table structure, relationships | Business rules, HTTP |
| Schema | Data shape, validation | Database internals |

### One file per resource
For each entity (users, projects, tasks), create:
- `routers/entity.py` — route handlers
- `services/entity_service.py` — business logic
- `models/entity.py` — ORM model
- `schemas/entity.py` — request/response schemas

This pattern scales. Adding a new resource means adding four predictable files.

---

## API Design

### RESTful conventions
```
GET    /api/resources          → list all (200)
POST   /api/resources          → create one (201)
GET    /api/resources/{id}     → get one (200)
PATCH  /api/resources/{id}     → partial update (200)
DELETE /api/resources/{id}     → delete (204)
```

### Design rules
- Use `PATCH` for partial updates, not `PUT`. Clients send only the fields they want to change.
- Return the full updated object on `POST` and `PATCH` — the client shouldn't need a follow-up GET.
- Use UUID primary keys, not auto-incrementing integers. UUIDs don't leak information about how many records exist.
- Prefix all routes with `/api/` to separate API routes from frontend routes in deployment.
- Use plural nouns for resources (`/projects`, not `/project`).
- Nest related resources: `/projects/{id}/tasks` for tasks belonging to a project.
- Validate ownership before any mutation. Never trust the client — always confirm `resource.owner_id == current_user.id`.

### Response consistency
All list endpoints should return arrays. All detail/create/update endpoints should return objects. All delete endpoints should return 204 with no body. Error responses should always include a `detail` message.

---

## Database

### Use an ORM with migrations
- Use an ORM (SQLAlchemy, Prisma, GORM, etc.) for type-safe database access
- **Always use a migration tool** (Alembic, Prisma Migrate, etc.) to manage schema changes
- **Never use auto-create-tables** (`create_all`, `sync`) in production — it can't handle column renames, data migration, or rollbacks
- Commit migration files to git — they are part of the codebase

### Model conventions
- UUID primary keys (not auto-increment integers)
- Timestamps on every table: `created_at` (auto-set on insert), `updated_at` (auto-set on insert and update)
- Soft deletes where appropriate: `deleted_at` nullable timestamp instead of hard DELETE. Filter with `WHERE deleted_at IS NULL` in all queries.
- Define relationships explicitly in the ORM — don't rely on raw JOIN queries
- Index foreign keys and frequently filtered columns

### Migration workflow
```
1. Change the ORM model
2. Generate a migration (auto-generate when possible)
3. Review the generated SQL — never blindly trust auto-generation
4. Apply the migration locally and test
5. Commit the migration file
6. In production, migrations run automatically before the app starts
```

---

## Authentication and Security

### Authentication flow (JWT or session-based)
1. Client sends credentials (email + password)
2. Server verifies password hash (bcrypt, argon2 — never MD5/SHA)
3. Server issues a token (JWT or session ID)
4. Client sends token with every subsequent request
5. Server verifies token and loads user on each protected route

### Security rules
- **Hash passwords** with bcrypt or argon2. Never store plain text. Never use MD5 or SHA for passwords.
- **Secrets in environment variables**, never in code. `.env` is in `.gitignore`.
- **Validate all input** through schemas/validation layers. Never trust raw user input.
- **Check ownership on every mutation.** Even if the UI only shows the user's own data, the API must enforce it.
- **CORS restricted** to known frontend origins. Never use `*` in production.
- **Token expiry** — tokens should expire. 60 minutes is a reasonable default. Never issue infinite tokens.
- **Rate limiting** on auth endpoints (login, register) to prevent brute force attacks.
- **SQL injection is impossible** when using an ORM with parameterized queries. Never build SQL strings from user input.

### Dependency injection for auth
Create a reusable dependency/middleware that extracts the current user from the token. Protected routes declare this dependency — they receive the user object automatically instead of manually parsing headers.

---

## Environment Variables and Configuration

### The pattern
- `.env` — real values for local development. **Never committed to git.**
- `.env.example` — placeholder values showing all required variables. **Committed to git.**
- Configuration class/module — reads env vars once at startup, validates types, provides defaults for non-sensitive values.

### Standard variables
Every backend project typically needs:
```bash
DATABASE_URL=...           # Database connection string
SECRET_KEY=...             # For signing tokens/sessions
CORS_ORIGINS=...           # Allowed frontend origins (JSON array or comma-separated)
PORT=...                   # Server port (often set by hosting platform)
DEBUG=...                  # Enable/disable debug mode
```

### Production vs. local
| Variable | Local | Production |
|----------|-------|------------|
| `DATABASE_URL` | Points to local/Docker DB | Points to managed DB with SSL |
| `SECRET_KEY` | Any string (for dev convenience) | Long random string (`openssl rand -hex 32`) |
| `CORS_ORIGINS` | `localhost` frontend URL | Deployed frontend URL |
| `DEBUG` | `true` | `false` |

---

## Error Handling

### Consistent error responses
Every error should return a consistent shape:
```json
{
  "detail": "Human-readable error message"
}
```

### Standard HTTP status codes
- `200` — Success
- `201` — Created (for POST)
- `204` — Deleted (no body)
- `400` — Bad request (invalid input)
- `401` — Unauthorized (missing or invalid token)
- `403` — Forbidden (valid token but no permission)
- `404` — Not found
- `422` — Validation error (input doesn't match schema)
- `500` — Server error (unexpected failure)

### Error handling philosophy
- Validate input early (at the schema/router level). Return 400/422 immediately for bad data.
- Check authorization explicitly. Return 403 if the user doesn't own the resource.
- Let unexpected errors bubble up to a global handler that returns 500 with a safe message (no stack traces in production).
- Log errors server-side. Don't expose internal details to the client.

---

## Testing

### Structure
```
tests/
├── test_auth.py          # Auth endpoints
├── test_projects.py      # Project CRUD
├── test_tasks.py         # Task CRUD
└── conftest.py           # Shared fixtures (test DB, test client, auth headers)
```

### Principles
- Use a **separate test database** — never run tests against development data
- Test the API surface (HTTP requests/responses), not internal functions in isolation
- Cover the critical paths: auth flow, CRUD operations, authorization checks
- At minimum, test: creating a resource, reading it, updating it, deleting it, and accessing another user's resource (should fail)

---

## Docker (when applicable)

### Development
- Use Docker Compose for local development when the project requires a database or other services
- The Dockerfile should optimize for layer caching: copy dependency file first, install, then copy source
- Mount source code as a volume so code changes are reflected without rebuilding
- Include `--reload` flag in the dev start command for hot-reload

### Production
- Docker is a **local development tool** unless the hosting platform expects Docker images
- Most platforms (Render, Railway, Heroku) read your code directly and install dependencies themselves
- Keep Dockerfiles in the repo for local dev regardless of production setup

---

## Dependency Management

- **Pin all dependency versions** in your lock file or requirements file. `package==1.2.3`, not `package>=1.0`.
- Include the lock file in git (e.g., `package-lock.json`, `poetry.lock`). This ensures everyone installs identical versions.
- Review what you're installing. Don't add packages for trivial tasks you can write in 10 lines.
- Use a virtual environment for Python projects. Never install packages globally.

---

## Git and Repository Hygiene

### .gitignore (must include)
- Virtual environments (`venv/`, `.venv/`, `node_modules/`)
- `.env` (but NOT `.env.example`)
- IDE config (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)
- Build artifacts, compiled files, cache directories
- Database files (SQLite `.db` files if using SQLite locally)
- Log files

### Commit messages
- Imperative mood: "Add user endpoint" not "Added user endpoint"
- One logical change per commit
- Keep the subject under 70 characters
- Reference the what and why, not the how (the diff shows the how)

---

## README

Every backend project must have a README with:
1. **What the project is** — one paragraph
2. **Tech stack** — what and why
3. **How to run locally** — step by step (clone, env setup, install, migrate, start)
4. **API endpoints** — table of method, path, description
5. **Environment variables** — table of name, description, default
6. **Project structure** — folder tree with explanations

If someone can't get the API running locally in 5 minutes by following the README, the README needs work.

---

## Deployment

### Standard deployment flow
1. Push to GitHub
2. Hosting platform detects the push and rebuilds
3. It installs dependencies from your requirements/package file
4. It runs your start command (which should run migrations first, then start the server)
5. It injects environment variables from the dashboard

### Pre-deployment checklist
- [ ] Production `SECRET_KEY` is random and long
- [ ] `DATABASE_URL` points to managed database with SSL
- [ ] `CORS_ORIGINS` includes the deployed frontend URL
- [ ] `DEBUG` is `false`
- [ ] Migrations run automatically on deploy (part of the start command)
- [ ] `.env` is NOT committed to git
- [ ] No hardcoded localhost URLs in the codebase
- [ ] Health check endpoint exists (`GET /api/health` → `{"status": "ok"}`)

---

## Production Readiness Checklist

Before considering a backend "done":

- [ ] All CRUD endpoints work and are tested
- [ ] Auth flow works end-to-end (register, login, protected access, token expiry)
- [ ] Ownership validation on every mutation endpoint
- [ ] Input validation on every endpoint that accepts data
- [ ] Consistent error responses across all endpoints
- [ ] README is complete and accurate
- [ ] `.env.example` documents all required variables
- [ ] `.gitignore` excludes everything it should
- [ ] No secrets in the codebase or git history
- [ ] Migrations are committed and run automatically on deploy
- [ ] The API is deployed and accessible via a public URL
- [ ] CORS is configured for the production frontend
- [ ] Health check endpoint exists
