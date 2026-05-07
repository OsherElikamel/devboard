# DevBoard Full Tech Stack

## 1. Project Type

**DevBoard** is a full-stack personal developer dashboard.

The project is built as a modern web application with:

```txt
Frontend application
Backend REST API
PostgreSQL database
JWT authentication
Docker-based local development
Separate frontend/backend deployment
```

---

## 2. Frontend Stack

```txt
React
Vite
TypeScript
React Router
Tailwind CSS
Axios or fetch
Recharts
Lucide React
```

### Purpose

#### React
Used to build the frontend user interface.

#### Vite
Used as the frontend build tool and development server.

#### TypeScript
Used for type safety and cleaner frontend code.

#### React Router
Used for frontend routing.

Example routes:

```txt
/login
/register
/dashboard
/projects
/projects/:id
/settings
```

#### Tailwind CSS
Used for styling the app quickly and consistently.

#### Axios or fetch
Used for communication with the FastAPI backend.

Recommended for this project:

```txt
Axios
```

because it makes API configuration and auth headers convenient.

#### Recharts
Used for dashboard visuals.

Examples:

```txt
Donut chart
Project status distribution
Progress visuals
```

#### Lucide React
Used for clean modern icons.

Examples:

```txt
Sidebar icons
Project links
Priority flags
Theme toggle
Dashboard stat icons
```

---

## 3. Optional Frontend Add-on

```txt
Framer Motion
```

Use only if needed for smooth animations.

Good use cases:

```txt
Card hover animations
Page transitions
Animated dashboard elements
```

Do not overuse it.

---

## 4. Backend Stack

```txt
Python
FastAPI
Uvicorn
Pydantic
SQLAlchemy
Alembic
psycopg
python-jose or PyJWT
passlib / bcrypt
pytest
```

### Purpose

#### Python
Main backend language.

#### FastAPI
Backend framework used to build the REST API.

#### Uvicorn
ASGI server used to run the FastAPI app.

#### Pydantic
Used for request validation and response schemas.

#### SQLAlchemy
Used as the ORM for working with PostgreSQL.

#### Alembic
Used for database migrations.

#### psycopg
PostgreSQL database driver for Python.

Recommended:

```txt
psycopg[binary]
```

#### python-jose or PyJWT
Used for creating and validating JWT tokens.

Recommended:

```txt
python-jose
```

#### passlib / bcrypt
Used for password hashing.

#### pytest
Used for backend testing.

---

## 5. Database Stack

```txt
PostgreSQL
pgAdmin
```

### PostgreSQL
Main database for the project.

Used to store:

```txt
Users
Projects
Tasks
Comments
Technologies
Project-technology relationships
Learning notes
```

### pgAdmin
Used locally to inspect and manage the PostgreSQL database visually.

This is mainly for learning and development.

---

## 6. Authentication Stack

```txt
JWT access tokens
bcrypt password hashing
Protected backend routes
Frontend auth state
```

### MVP Auth Approach

For the first version:

```txt
User registers
User logs in
Backend returns JWT access token
Frontend stores token in localStorage
Frontend sends token in Authorization header
Backend protects private routes
Logout removes token from frontend
```

### Later Auth Improvement

Later, upgrade to:

```txt
httpOnly cookies
Refresh tokens
Better session handling
```

But not for MVP.

---

## 7. DevOps / Local Development Stack

```txt
Git
GitHub
Docker
Docker Compose
.env files
```

### Git
Used for version control.

### GitHub
Used to host the repository and showcase the project.

### Docker
Used to containerize individual services.

Examples:

```txt
Backend container
Frontend container
```

### Docker Compose
Used to run multiple services together locally.

DevBoard Compose services:

```txt
frontend
backend
postgresql
pgAdmin
```

### .env files
Used for environment variables and configuration.

Examples:

```txt
DATABASE_URL
JWT_SECRET_KEY
VITE_API_BASE_URL
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
```

---

## 8. Deployment Stack

Recommended simple deployment path:

```txt
Frontend: Netlify or Vercel
Backend: Render or Railway
Database: Neon or Supabase PostgreSQL
```

### Frontend Deployment

Recommended:

```txt
Netlify
```

Alternative:

```txt
Vercel
```

### Backend Deployment

Recommended:

```txt
Render
```

Alternatives:

```txt
Railway
Fly.io
Google Cloud Run
```

### Database Hosting

Recommended:

```txt
Neon PostgreSQL
```

Alternatives:

```txt
Supabase PostgreSQL
Render PostgreSQL
Railway PostgreSQL
```

---

## 9. Testing Stack

```txt
pytest
```

For MVP, focus on backend tests first.

Recommended test areas:

```txt
Register user
Login user
Reject duplicate email
Create project with valid token
Reject project creation without token
Return only current user's projects
Create tasks under owned project
Prevent access to another user's project
```

Optional frontend testing later:

```txt
Vitest
React Testing Library
```

Not required for MVP.

---

## 10. API Documentation

```txt
FastAPI Swagger Docs
OpenAPI
```

FastAPI automatically provides API documentation.

Local docs URL:

```txt
http://localhost:8000/docs
```

OpenAPI schema:

```txt
http://localhost:8000/openapi.json
```

---

## 11. Final Recommended Stack

This is the final practical stack for DevBoard:

```txt
Frontend:
React + Vite + TypeScript
React Router
Tailwind CSS
Axios
Recharts
Lucide React

Backend:
Python + FastAPI
Uvicorn
Pydantic
SQLAlchemy
Alembic
psycopg
python-jose
bcrypt/passlib
pytest

Database:
PostgreSQL
pgAdmin for local development

Auth:
JWT access tokens
bcrypt password hashing
Protected routes

DevOps:
Git
GitHub
Docker
Docker Compose
.env files

Deployment:
Netlify or Vercel for frontend
Render or Railway for backend
Neon or Supabase PostgreSQL for database
```

---

## 12. MVP Stack Decision

Use this for the first real version:

```txt
React + Vite + TypeScript
Tailwind CSS
Axios
Recharts
Lucide React
FastAPI
PostgreSQL
SQLAlchemy
Alembic
JWT auth
Docker
Docker Compose
pgAdmin
GitHub
Netlify
Render
Neon PostgreSQL
pytest
```

This stack is complete, practical, and strong enough to showcase full-stack skills without becoming overkill.

