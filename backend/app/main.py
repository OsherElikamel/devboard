from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import admin, auth, comments, dashboard, demo, learning_notes, projects, tasks, technologies

app = FastAPI(title="DevBoard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(comments.router)
app.include_router(technologies.router)
app.include_router(learning_notes.router)
app.include_router(dashboard.router)
app.include_router(demo.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
