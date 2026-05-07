# DevBoard Backend Design Brief

## 1. Project Overview

**Project name:** DevBoard  
**Backend type:** REST API  
**Primary framework:** FastAPI  
**Database:** PostgreSQL  
**Auth:** JWT authentication  
**Local development:** Docker + Docker Compose  
**Goal:** Build a clean, realistic backend for a personal developer project dashboard.

DevBoard is a full-stack app where users can track coding projects, tasks, tech stacks, deployment links, GitHub repositories, learning notes, and project progress.

The backend should be simple enough to understand and finish, but realistic enough to demonstrate professional full-stack skills.

The backend should prioritize:

```txt
Learning best practices
Clean code
Realistic production-ish structure
Simplicity
Not overengineering
```

---

## 2. Core Product Behavior

DevBoard has two main usage modes:

1. **Guest mode**
2. **Authenticated user mode**

This is an important product decision.

The app should not force every visitor to register or log in immediately. Visitors should be able to explore the app using a clear, friendly button such as:

```txt
Explore Demo
Continue as Guest
View Demo Board
Try DevBoard Demo
```

Recommended label:

```txt
Explore Demo Board
```

This button should be visible and approachable. It should not be hidden in a tiny corner or styled like a dismiss button.

The purpose of guest mode is to let recruiters, interviewers, or visitors explore the app quickly without friction.

---

## 3. User Modes

## Guest Mode

Guest mode should allow the visitor to explore a pre-filled demo version of DevBoard.

Guest users should be able to see:

```txt
Demo dashboard
Demo projects
Demo project details
Demo tasks
Demo comments
Demo tech tags
Demo deployment information
Demo GitHub/live links
Demo learning notes
```

For MVP, guest mode can be read-only.

Guest users should not be able to permanently create, edit, or delete real data.

Recommended behavior:

```txt
Guest can browse demo data.
Guest can click around the app.
Guest can see how features work.
Guest cannot save real changes.
Guest is encouraged, but not forced, to register.
```

Optional later behavior:

```txt
Guest can make temporary local-only changes in frontend state.
Guest changes disappear after refresh.
```

## Authenticated User Mode

Authenticated users can:

```txt
Register
Login
Logout
Create projects
Edit projects
Delete/archive projects
Create tasks
Edit tasks
Mark tasks complete
Add comments to tasks
Add learning notes
Add technologies
Add GitHub repository info
Add deployment info
View dashboard stats
```

Each authenticated user should only see and manage their own projects.

---

## 4. Authentication Requirements

The app should include:

```txt
Register
Login
Logout
Protected routes
JWT authentication
Password hashing
```

### User fields

For MVP, users should have:

```txt
id
name
email
password_hash
created_at
updated_at
```

No avatar is required for MVP.

### Password hashing

Use one of:

```txt
bcrypt
Argon2
```

Recommended:

```txt
bcrypt
```

because it is simple and commonly used.

### JWT flow for MVP

Use a practical learning approach:

```txt
Frontend stores access token in localStorage for the first version.
Backend validates JWT on protected routes.
Logout is handled client-side by removing the token.
```

This is not the most secure production approach, but it is good for learning.

Later improvement:

```txt
Move JWT to httpOnly cookies.
Add refresh tokens.
Add token rotation.
```

### Token payload

JWT should contain:

```txt
sub: user id
email: user email
exp: expiration timestamp
```

Optional:

```txt
name
```

### Protected routes

All user-owned data routes should be protected.

Protected resources:

```txt
Projects
Tasks
Comments
Learning notes
Technologies assigned to projects
Deployment info
Dashboard stats for logged-in user
```

Public/demo routes can be unprotected.

---

## 5. Guest / Demo Data Design

Because guest mode is important, the backend should support demo data clearly.

Recommended approach for MVP:

Create public demo endpoints that return static or seeded demo data.

Example routes:

```txt
GET /api/demo/dashboard
GET /api/demo/projects
GET /api/demo/projects/{demo_project_id}
```

These routes do not require authentication.

They should return realistic-looking data that helps visitors understand the app.

### Why demo endpoints are better than fake auth

Avoid pretending a guest is a real user unless needed.

Better:

```txt
Demo routes return demo data.
Authenticated routes return real user data.
```

This keeps the backend clean and avoids mixing guest state with real database ownership.

### Demo route behavior

Demo routes should be read-only.

If the frontend wants to show edit buttons in demo mode, clicking them can show a message:

```txt
Create an account to save your own projects.
```

or:

```txt
Demo mode is read-only.
```

---

## 6. Project Ownership

DevBoard should be multi-user.

Each user can have many projects.

Users should only see their own projects.

Database relationship:

```txt
User has many Projects
Project belongs to one User
```

Every protected project query must filter by the current authenticated user.

Example rule:

```txt
A user can only read, update, or delete projects where project.user_id == current_user.id
```

This is one of the most important backend security rules in the app.

---

## 7. Project Model

Projects should include:

```txt
id
user_id
title
description
status
progress
repo_name
github_url
live_url
frontend_url
backend_url
start_date
target_date
created_at
updated_at
deleted_at
```

### Notes

`progress` should be calculated from tasks, not manually entered for MVP.

`deleted_at` allows soft delete for projects.

### Project status options

Use these statuses:

```txt
idea
in_progress
testing
deployed
archived
```

### Project status meaning

```txt
idea: project is only an idea or not started yet
in_progress: project is actively being built
testing: project is being tested or polished
deployed: project has a working live version
archived: project is no longer active
```

---

## 8. Project Progress Logic

Project progress should be calculated from completed tasks.

Formula:

```txt
progress = completed_tasks / total_tasks * 100
```

Rules:

```txt
If project has no tasks, progress should be 0.
If all tasks are complete, progress should be 100.
Progress should be returned as an integer from 0 to 100.
```

The backend can calculate progress dynamically in service logic or query logic.

Recommended MVP approach:

```txt
Do not store progress manually at first.
Calculate it when returning project data.
```

Later improvement:

```txt
Store cached progress on the project table if performance ever matters.
```

---

## 9. Tasks Model

Tasks belong to projects.

Each project can have many tasks.

Task fields:

```txt
id
project_id
title
description
is_done
priority
due_date
created_at
updated_at
```

Tasks should use hard delete.

Reason:

```txt
Tasks are smaller child records.
Deleting them permanently is acceptable for MVP.
```

### Task priority options

Use three priority levels:

```txt
low
medium
high
```

The frontend can represent priority using flag icons inspired by ClickUp.

Recommended visual mapping:

```txt
low: gray flag
medium: blue flag
high: orange/red flag
```

The backend should only store the priority value.

The frontend decides how to display icons/colors.

### Task comments

Tasks should support comments.

The user specifically wants comments, inspired by ClickUp-style task lists.

Relationship:

```txt
Task has many Comments
Comment belongs to one Task
Comment belongs to one User
```

---

## 10. Comments Model

Comments should be attached to tasks.

Comment fields:

```txt
id
task_id
user_id
content
created_at
updated_at
```

For MVP, comments can be simple text comments.

No need for:

```txt
Mentions
Reactions
Threads
Attachments
Rich text
Editing history
```

Optional MVP feature:

```txt
Allow users to edit/delete their own comments.
```

Recommended MVP:

```txt
Create comments
List comments for task
Delete own comments
```

---

## 11. Technologies / Tech Stack Model

Technologies should use a proper many-to-many relationship.

This is important because it teaches SQL relationships well.

Relationship:

```txt
Project has many Technologies
Technology belongs to many Projects
```

Tables:

```txt
technologies
project_technologies
```

### technologies table

Fields:

```txt
id
name
category
created_at
```

Example technologies:

```txt
React
TypeScript
Python
FastAPI
PostgreSQL
Docker
JWT
Vite
Tailwind CSS
```

### technology category options

Optional but useful:

```txt
frontend
backend
database
devops
testing
other
```

### project_technologies table

Fields:

```txt
project_id
technology_id
```

Use a composite unique constraint so the same technology cannot be attached to the same project twice.

---

## 12. Learning Notes Model

Projects should have learning notes.

Learning notes help show what the user learned while building each project.

Fields:

```txt
id
project_id
title
content
topic
created_at
updated_at
```

Examples:

```txt
Title: Learned Docker Compose basics
Topic: Docker
Content: I learned how backend and PostgreSQL containers communicate through a shared Compose network.
```

```txt
Title: SQL relationships finally clicked
Topic: PostgreSQL
Content: I practiced one-to-many and many-to-many relationships using users, projects, tasks, and technologies.
```

Learning notes should be protected by project ownership.

A user can only access notes for their own projects.

---

## 13. Deployment Info

Each project should store deployment information.

The chosen backend scope is:

```txt
frontend URL
backend URL
live URL
deployment platform
deployment status
```

Recommended project fields:

```txt
live_url
frontend_url
backend_url
deployment_platform
deployment_status
```

Deployment status options:

```txt
not_deployed
deployed
broken
in_progress
```

Deployment platform examples:

```txt
Netlify
Vercel
Render
Railway
Fly.io
Cloud Run
AWS
Other
```

For MVP, platform can be stored as a simple string.

---

## 14. GitHub Info

Each project should store:

```txt
repo_name
github_url
```

No need to integrate with the GitHub API for MVP.

Avoid for MVP:

```txt
Automatic commit fetching
Branch tracking
GitHub OAuth
Repo syncing
Webhook integration
```

Those can be future upgrades.

---

## 15. Dashboard Stats

The backend should provide a dashboard stats endpoint.

The dashboard should calculate:

```txt
total projects
projects by status
average progress
completed tasks count
total tasks count
technologies used
recent projects
```

Recommended route:

```txt
GET /api/dashboard/summary
```

Response example:

```json
{
  "total_projects": 6,
  "projects_by_status": {
    "idea": 1,
    "in_progress": 3,
    "testing": 1,
    "deployed": 1,
    "archived": 0
  },
  "average_progress": 62,
  "completed_tasks": 28,
  "total_tasks": 45,
  "technologies_used": ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
  "recent_projects": []
}
```

Stats must only include the current authenticated user's data.

Demo stats should be available from:

```txt
GET /api/demo/dashboard
```

---

## 16. API Style

Use REST API.

Base route convention:

```txt
/api/auth
/api/users
/api/projects
/api/tasks
/api/comments
/api/technologies
/api/dashboard
/api/demo
```

Use clear route groups and Pydantic schemas so FastAPI Swagger docs are clean.

---

## 17. API Routes

## Auth Routes

```txt
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

Optional:

```txt
POST /api/auth/logout
```

For localStorage JWT, logout can be frontend-only, but a logout endpoint can still exist for future cookie-based auth.

---

## Project Routes

```txt
GET /api/projects
POST /api/projects
GET /api/projects/{project_id}
PATCH /api/projects/{project_id}
DELETE /api/projects/{project_id}
```

Behavior:

```txt
GET /api/projects: return current user's non-deleted projects
POST /api/projects: create project for current user
GET /api/projects/{id}: return project if owned by current user
PATCH /api/projects/{id}: update project if owned by current user
DELETE /api/projects/{id}: soft delete project by setting deleted_at
```

---

## Task Routes

Recommended nested routes:

```txt
GET /api/projects/{project_id}/tasks
POST /api/projects/{project_id}/tasks
PATCH /api/tasks/{task_id}
DELETE /api/tasks/{task_id}
```

Behavior:

```txt
Tasks must belong to a project owned by the current user.
Deleting a task should hard delete it.
```

---

## Comment Routes

```txt
GET /api/tasks/{task_id}/comments
POST /api/tasks/{task_id}/comments
DELETE /api/comments/{comment_id}
```

Optional:

```txt
PATCH /api/comments/{comment_id}
```

Behavior:

```txt
Comments must belong to a task inside a project owned by the current user.
A user can delete their own comments.
```

---

## Technology Routes

```txt
GET /api/technologies
POST /api/technologies
POST /api/projects/{project_id}/technologies/{technology_id}
DELETE /api/projects/{project_id}/technologies/{technology_id}
```

Optional friendlier route:

```txt
POST /api/projects/{project_id}/technologies
```

with body:

```json
{
  "technology_ids": [1, 2, 3]
}
```

For MVP, it is acceptable to create technologies globally and attach them to projects.

---

## Learning Note Routes

```txt
GET /api/projects/{project_id}/learning-notes
POST /api/projects/{project_id}/learning-notes
PATCH /api/learning-notes/{note_id}
DELETE /api/learning-notes/{note_id}
```

Behavior:

```txt
Learning notes must belong to projects owned by the current user.
```

---

## Dashboard Routes

```txt
GET /api/dashboard/summary
```

Protected route.

Returns stats for the current user.

---

## Demo Routes

```txt
GET /api/demo/dashboard
GET /api/demo/projects
GET /api/demo/projects/{demo_project_id}
```

Public routes.

Return read-only demo data.

---

## 18. Database Design

Recommended tables:

```txt
users
projects
tasks
comments
technologies
project_technologies
learning_notes
```

## users

```txt
id: UUID or integer primary key
name: string
email: unique string
password_hash: string
created_at: timestamp
updated_at: timestamp
```

## projects

```txt
id: UUID or integer primary key
user_id: foreign key -> users.id
title: string
description: text
status: enum/string
repo_name: string nullable
github_url: string nullable
live_url: string nullable
frontend_url: string nullable
backend_url: string nullable
deployment_platform: string nullable
deployment_status: enum/string
start_date: date nullable
target_date: date nullable
created_at: timestamp
updated_at: timestamp
deleted_at: timestamp nullable
```

## tasks

```txt
id: UUID or integer primary key
project_id: foreign key -> projects.id
title: string
description: text nullable
is_done: boolean default false
priority: enum/string default medium
due_date: date nullable
created_at: timestamp
updated_at: timestamp
```

## comments

```txt
id: UUID or integer primary key
task_id: foreign key -> tasks.id
user_id: foreign key -> users.id
content: text
created_at: timestamp
updated_at: timestamp
```

## technologies

```txt
id: UUID or integer primary key
name: unique string
category: string nullable
created_at: timestamp
```

## project_technologies

```txt
project_id: foreign key -> projects.id
technology_id: foreign key -> technologies.id
```

Constraints:

```txt
Unique combination of project_id + technology_id
```

## learning_notes

```txt
id: UUID or integer primary key
project_id: foreign key -> projects.id
title: string
content: text
topic: string nullable
created_at: timestamp
updated_at: timestamp
```

---

## 19. UUID vs Integer IDs

Recommended for this learning project:

```txt
Use UUID primary keys.
```

Why:

```txt
Looks more production-like
Safer for public URLs
Good learning experience
Avoids exposing incremental IDs
```

However, integer IDs are simpler.

If simplicity becomes more important, integers are acceptable.

Recommended final decision:

```txt
Use UUIDs if comfortable.
Use integers if speed/simplicity matters more.
```

---

## 20. SQLAlchemy + Alembic

Use SQLAlchemy for ORM models.

Use Alembic from the start for migrations.

This is important because the user wants to learn proper PostgreSQL and backend practices.

Recommended workflow:

```txt
Create SQLAlchemy models
Generate Alembic migration
Review migration
Apply migration
Commit migration file
```

Common commands:

```bash
alembic revision --autogenerate -m "create initial tables"
alembic upgrade head
```

---

## 21. Backend Folder Structure

Use a clean scalable structure, not too advanced.

Recommended structure:

```txt
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── dependencies.py
│   │
│   ├── db/
│   │   ├── database.py
│   │   ├── base.py
│   │   └── seed.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   ├── comment.py
│   │   ├── technology.py
│   │   └── learning_note.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   ├── comment.py
│   │   ├── technology.py
│   │   ├── learning_note.py
│   │   └── dashboard.py
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── projects.py
│   │   ├── tasks.py
│   │   ├── comments.py
│   │   ├── technologies.py
│   │   ├── learning_notes.py
│   │   ├── dashboard.py
│   │   └── demo.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── project_service.py
│   │   ├── task_service.py
│   │   └── dashboard_service.py
│   │
│   └── utils/
│       └── datetime.py
│
├── alembic/
├── alembic.ini
├── tests/
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

---

## 22. Pydantic Schemas

Use proper Pydantic schemas.

Each major model should usually have:

```txt
Create schema
Update schema
Read/Response schema
```

Example for projects:

```txt
ProjectCreate
ProjectUpdate
ProjectResponse
ProjectListResponse
```

Validation should be proper but not overcomplicated.

### Validation examples

Project title:

```txt
Required
Minimum length: 2
Maximum length: 100
```

URLs:

```txt
Optional
Must be valid URL if provided
```

Progress:

```txt
Backend calculated, not accepted from user in MVP
```

Status:

```txt
Must be one of allowed statuses
```

Priority:

```txt
Must be low, medium, or high
```

---

## 23. Error Handling

Use clear HTTP errors.

Examples:

```txt
400 Bad Request: invalid input
401 Unauthorized: missing/invalid token
403 Forbidden: trying to access another user's resource
404 Not Found: resource does not exist or is not accessible
409 Conflict: email already exists
```

Security note:

For resources owned by another user, it is acceptable to return 404 instead of 403 to avoid revealing the resource exists.

Recommended rule:

```txt
If user tries to access a project they do not own, return 404.
```

---

## 24. Docker + Docker Compose

Docker should package each service.

Docker Compose should run multiple services together.

The local Compose setup should run:

```txt
frontend
backend
postgresql
pgAdmin
```

This helps learn real multi-service development.

### docker-compose.yml services

```txt
frontend
backend
db
pgadmin
```

### frontend service

Runs React/Vite dev server.

Port:

```txt
5173
```

### backend service

Runs FastAPI with Uvicorn.

Port:

```txt
8000
```

### db service

Runs PostgreSQL.

Port:

```txt
5432
```

### pgAdmin service

Runs pgAdmin for viewing/editing the database.

Port:

```txt
5050
```

### Local startup command

```bash
docker compose up --build
```

### Why Compose matters here

Compose lets the whole project run with one command:

```txt
Frontend talks to backend.
Backend talks to PostgreSQL.
pgAdmin lets you inspect the DB.
```

This is one of the main learning goals of the project.

---

## 25. Environment Variables

Use `.env` files.

Never commit real secrets.

Create:

```txt
.env.example
```

Backend environment variables:

```txt
DATABASE_URL=postgresql+psycopg://devboard_user:devboard_password@db:5432/devboard_db
JWT_SECRET_KEY=change_me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
BACKEND_CORS_ORIGINS=http://localhost:5173
```

PostgreSQL variables for Compose:

```txt
POSTGRES_USER=devboard_user
POSTGRES_PASSWORD=devboard_password
POSTGRES_DB=devboard_db
```

pgAdmin variables:

```txt
PGADMIN_DEFAULT_EMAIL=admin@devboard.local
PGADMIN_DEFAULT_PASSWORD=admin
```

Frontend environment variables:

```txt
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 26. CORS

Configure CORS properly.

Allow local frontend origin:

```txt
http://localhost:5173
```

Later for deployment, add deployed frontend URL:

```txt
https://your-frontend-domain.netlify.app
```

Do not use wildcard CORS in final deployed version if avoidable.

---

## 27. Seed Data

Seed data should exist only for development/demo.

Use seed data for:

```txt
Demo projects
Demo tasks
Demo technologies
Demo learning notes
```

Recommended:

```txt
Create app/db/seed.py
```

Seed command can be run manually.

Example:

```bash
python -m app.db.seed
```

Seed data should not overwrite real user data.

### Demo data recommendation

Create demo data that matches the project itself.

Example demo projects:

```txt
DevBoard
Portfolio Website
Expense Tracker API
Kiosk App Dashboard
```

The screenshot inspiration from ClickUp can influence task/comment examples:

```txt
Add issue if PostgreSQL connection fails
Refactor dashboard service into smaller functions
Add project status filter
Fix progress calculation when project has no tasks
Add deployment URL fields
```

---

## 28. Testing

Testing scope should be minimal but meaningful.

Use:

```txt
pytest
```

Recommended MVP tests:

```txt
Register user
Login user
Reject duplicate email
Create project when authenticated
Reject project creation without token
Get only current user's projects
Create task under owned project
Prevent access to another user's project
```

Testing should not block project progress, but a few tests will make the repo look stronger.

---

## 29. Deployment Plan

Frontend:

```txt
Netlify or Vercel
```

Backend:

```txt
Render, Railway, Fly.io, or Cloud Run
```

Database:

```txt
Neon, Supabase, Render PostgreSQL, or Railway PostgreSQL
```

Recommended simple path:

```txt
Frontend: Netlify
Backend: Render
Database: Neon or Supabase PostgreSQL
```

### Deployment environment variables

Backend deployment needs:

```txt
DATABASE_URL
JWT_SECRET_KEY
JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES
BACKEND_CORS_ORIGINS
```

Frontend deployment needs:

```txt
VITE_API_BASE_URL
```

---

## 30. Swagger / API Documentation

FastAPI automatically creates Swagger docs.

Make the docs clean by using:

```txt
Router prefixes
Tags
Pydantic response models
Clear route names
Clear descriptions where useful
```

Expected local docs URL:

```txt
http://localhost:8000/docs
```

Expected OpenAPI JSON:

```txt
http://localhost:8000/openapi.json
```

---

## 31. Security Notes for MVP

MVP should include:

```txt
Password hashing
JWT expiration
Protected routes
Ownership checks
CORS configuration
Environment variables
Input validation
```

Do not include for MVP:

```txt
Refresh tokens
Email verification
Password reset
OAuth
2FA
Rate limiting
Audit logs
```

These are good future improvements, but they are not necessary for the first version.

---

## 32. Important Ownership Checks

Every route that accesses user-owned resources must verify ownership.

Examples:

```txt
User can only see their own projects.
User can only create tasks inside their own projects.
User can only see comments on tasks inside their own projects.
User can only edit learning notes inside their own projects.
```

This rule should be implemented consistently in service functions.

---

## 33. MVP Scope

## Must have

```txt
Register
Login
JWT auth
Guest demo mode
Projects CRUD
Tasks CRUD
Task comments
Technology tags many-to-many
Learning notes CRUD
Dashboard summary
PostgreSQL
SQLAlchemy
Alembic
Docker Compose with frontend, backend, PostgreSQL, pgAdmin
Basic tests
```

## Should have

```txt
Soft delete projects
Hard delete tasks
Clean Swagger docs
Seed demo data
Deployment info fields
Repo name + GitHub URL
```

## Later

```txt
Refresh tokens
httpOnly cookies
Google OAuth
GitHub API integration
Real activity feed
Advanced analytics
Public project sharing
Avatar/profile images
Password reset
Email verification
```

---

## 34. Recommended Build Order

Build backend in this order:

```txt
1. Create backend project structure
2. Add FastAPI app and health check route
3. Add Dockerfile and docker-compose.yml
4. Add PostgreSQL connection
5. Add SQLAlchemy base setup
6. Add Alembic
7. Create User model
8. Create auth schemas and auth routes
9. Add JWT security utilities
10. Add Project model and routes
11. Add Task model and routes
12. Add progress calculation
13. Add Technology many-to-many relationship
14. Add Learning Notes
15. Add Comments
16. Add Dashboard summary endpoint
17. Add Demo routes
18. Add seed data
19. Add basic tests
20. Prepare deployment configuration
```

This order keeps the project understandable and prevents building too many things at once.

---

## 35. Final Backend Summary

DevBoard backend should be a clean FastAPI REST API using PostgreSQL.

It should support both:

```txt
Guest demo exploration
Authenticated personal project tracking
```

The backend should demonstrate:

```txt
JWT auth
PostgreSQL relationships
SQLAlchemy ORM
Alembic migrations
REST API design
Docker Compose
Ownership/security checks
Clean project structure
Basic testing
Deployment readiness
```

The final backend should feel professional, understandable, and portfolio-worthy without becoming overengineered.

