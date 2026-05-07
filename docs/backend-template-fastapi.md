# Backend Project Template

A reusable reference for building FastAPI + PostgreSQL backends. Captures stack choices, project structure, architecture conventions, and best practices that scale cleanly from prototype to production.

---

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | FastAPI (latest) | Auto-docs, async-ready, Pydantic-native |
| ORM | SQLAlchemy 2.0 | Declarative models, sync or async sessions |
| Migrations | Alembic | Required — never use `create_all` in production |
| Validation | Pydantic v2 | Request bodies, response schemas, settings |
| Database | PostgreSQL 16 | Via psycopg driver |
| Auth | JWT (python-jose + passlib/bcrypt) | Bearer tokens, short TTL |
| Containerization | Docker + Docker Compose | Dev hot-reload, production-ready |

---

## Project Structure

```
backend/
├── alembic/
│   ├── versions/           # Migration files (committed to git)
│   └── env.py              # Alembic env config
├── app/
│   ├── core/
│   │   ├── config.py       # Pydantic Settings — reads from .env
│   │   ├── security.py     # JWT creation/verification, bcrypt
│   │   └── dependencies.py # FastAPI dependency injection (get_current_user, get_db)
│   ├── db/
│   │   ├── database.py     # Engine, SessionLocal, get_db
│   │   ├── base.py         # Import all models here (for Alembic to discover)
│   │   └── seed.py         # Dev/demo seed data
│   ├── models/             # SQLAlchemy ORM models
│   ├── schemas/            # Pydantic request/response schemas
│   ├── routers/            # FastAPI routers — HTTP concerns only
│   ├── services/           # Business logic — called by routers
│   └── utils/              # Shared helpers
├── .env                    # Never commit — local secrets
├── .env.example            # Commit — documents all required vars
├── Dockerfile
└── requirements.txt
```

---

## Architecture Rules

### Routers are thin controllers
Routers handle HTTP: parse the request, call a service, return the response. No business logic here.

```python
# routers/projects.py
@router.get("", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return project_service.get_user_projects(db, current_user.id)
```

### Services contain all business logic
Services are plain Python functions (or classes). No FastAPI dependencies. Easily testable.

```python
# services/project_service.py
def get_user_projects(db: Session, user_id: UUID) -> list[Project]:
    return (
        db.query(Project)
        .filter(Project.user_id == user_id, Project.deleted_at.is_(None))
        .order_by(Project.created_at.desc())
        .all()
    )
```

### Models are pure data
No business logic in SQLAlchemy models. Use `@property` sparingly and only for simple derived values.

### Separate request and response schemas
Never use the same Pydantic model for both input and output. Fields exposed in responses are a conscious choice.

```python
class ProjectCreate(BaseModel):     # request
    title: str
    description: str | None = None

class ProjectResponse(BaseModel):   # response
    id: UUID
    title: str
    status: str
    progress: float
    created_at: datetime
    model_config = {"from_attributes": True}
```

---

## Models

### Base class

```python
# db/base_class.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
```

### Standard model pattern

```python
class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(default=None)  # soft delete

    # Relationships
    user: Mapped["User"] = relationship(back_populates="projects")
    tasks: Mapped[list["Task"]] = relationship(back_populates="project", cascade="all, delete-orphan")
```

### Soft deletes
Use `deleted_at: datetime | None` instead of hard-deleting records. Filter with `.filter(Model.deleted_at.is_(None))` in all queries.

---

## Authentication

### JWT flow
1. User POSTs credentials to `/api/auth/login`
2. Backend verifies bcrypt hash, creates JWT with `user_id` in payload
3. Client stores token in localStorage, attaches as `Authorization: Bearer <token>` header
4. Protected routes use `get_current_user` dependency to decode token and load user

```python
# core/security.py
from jose import jwt, JWTError
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: str, expires_delta: timedelta) -> str:
    payload = {"sub": user_id, "exp": datetime.utcnow() + expires_delta}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
```

```python
# core/dependencies.py
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
```

---

## Configuration

```python
# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    model_config = {"env_file": ".env"}

settings = Settings()
```

---

## Environment Variables

```bash
# backend/.env.example
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/myapp_db
JWT_SECRET_KEY=change_me_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
```

**In production:**
- `JWT_SECRET_KEY` must be a long random string: `openssl rand -hex 32`
- `DATABASE_URL` should include `?sslmode=require` for managed PostgreSQL (Render, Railway, Supabase, etc.)
- `BACKEND_CORS_ORIGINS` must include the deployed frontend URL

---

## Database / Alembic Migrations

**Always use Alembic. Never use `Base.metadata.create_all()` in production.**

```bash
# Generate a new migration after model changes
alembic revision --autogenerate -m "describe the change"

# Apply all pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1
```

`alembic/env.py` must import all models via `app.db.base` so autogenerate detects them:
```python
from app.db.base import Base  # noqa: F401
target_metadata = Base.metadata
```

---

## API Design Conventions

```
GET    /api/resources          → list (200)
POST   /api/resources          → create (201)
GET    /api/resources/{id}     → detail (200)
PATCH  /api/resources/{id}     → partial update (200)
DELETE /api/resources/{id}     → delete (204)
```

- Use `PATCH` for partial updates, not `PUT`
- Use `UUID` primary keys (not integers)
- Always return the full updated object on `PATCH` and `POST`
- Use `response_model` on every route for documented, validated responses
- Validate ownership before any mutation: confirm `resource.user_id == current_user.id`

---

## Error Handling

```python
# Ownership check pattern
project = db.query(Project).filter(Project.id == project_id, Project.deleted_at.is_(None)).first()
if not project:
    raise HTTPException(status_code=404, detail="Project not found")
if project.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Not authorized")
```

---

## Docker (Development)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

```yaml
# docker-compose.yml (backend service)
backend:
  build: ./backend
  ports:
    - "8000:8000"
  volumes:
    - ./backend:/app
  env_file:
    - ./backend/.env
  depends_on:
    - db
```

---

## Deployment (Render)

1. **Create Managed PostgreSQL** on Render → copy `DATABASE_URL` (it includes `?sslmode=require`)
2. **Create Web Service** (Python) pointing to backend/ directory
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Set environment variables** in Render dashboard (never commit .env)
4. **Run migrations** via one-off job or startup hook:
   ```bash
   alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. **Run seed** if demo data needed:
   ```bash
   python -m app.db.seed
   ```

---

## Testing

Structure tests to mirror the app:
```
tests/
├── test_auth.py
├── test_projects.py
├── test_tasks.py
└── conftest.py    # fixtures: test DB, test client, auth headers
```

Use a separate test database (SQLite or a Postgres test schema). Never run tests against the dev database.

```python
# conftest.py
@pytest.fixture
def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as c:
        yield c
```

---

## Security Checklist

- [ ] JWT secret is random and long (`openssl rand -hex 32`)
- [ ] Passwords hashed with bcrypt (never stored plain)
- [ ] All mutations validate resource ownership
- [ ] CORS restricted to known origins (not `*` in production)
- [ ] `.env` excluded from git (`.gitignore`)
- [ ] Token expiry set (not infinite)
- [ ] Input validated by Pydantic schemas (no raw dict access)
- [ ] SQL injections impossible (SQLAlchemy ORM, parameterized queries)

---

## Code Quality

- One router file per resource (`projects.py`, `tasks.py`, `comments.py`)
- One service file per resource matching the router
- Models import from `app.models.model_name` (not from each other)
- Schemas import from `app.schemas.schema_name`
- No business logic in routers, no HTTP concerns in services
- No `print()` — use Python `logging`
- `requirements.txt` pinned to specific versions for reproducibility
