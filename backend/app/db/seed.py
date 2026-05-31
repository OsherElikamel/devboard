"""Seed the database with demo data for development."""
import uuid
from datetime import date, datetime, timezone

from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.comment import Comment
from app.models.learning_note import LearningNote
from app.models.project import Project
from app.models.project_comment import ProjectComment  # noqa: F401
from app.models.task import Task
from app.models.technology import ProjectTechnology, Technology
from app.models.user import User


def seed():
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == "alex@devboard.dev").first()
        if demo_user:
            print("Database already seeded, skipping.")
            return

        # Demo user
        user = User(
            id=uuid.UUID("a0000001-0000-0000-0000-000000000001"),
            name="Alex Dev",
            email="alex@devboard.dev",
            password_hash=hash_password("demo1234"),
        )
        db.add(user)
        db.flush()

        # Technologies
        tech_data = [
            ("React", "frontend"), ("TypeScript", "frontend"), ("Vite", "frontend"),
            ("Tailwind CSS", "frontend"), ("CSS", "frontend"),
            ("Python", "backend"), ("FastAPI", "backend"), ("Node.js", "backend"),
            ("PostgreSQL", "database"), ("MongoDB", "database"),
            ("Docker", "devops"), ("JWT", "backend"),
        ]
        techs: dict[str, Technology] = {}
        for name, category in tech_data:
            t = Technology(name=name, category=category)
            db.add(t)
            db.flush()
            techs[name] = t

        # Project 1: DevBoard
        p1 = Project(
            user_id=user.id, title="DevBoard",
            description="A personal developer dashboard for tracking projects, tasks, tech stacks, and deployments.",
            status="in_progress", deployment_status="deployed",
            repo_name="devboard", github_url="https://github.com/alexdev/devboard",
            live_url="https://devboard.example.com", deployment_platform="Render",
            start_date=date(2026, 3, 1), target_date=date(2026, 6, 1),
        )
        db.add(p1)
        db.flush()

        for tech_name in ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker"]:
            db.add(ProjectTechnology(project_id=p1.id, technology_id=techs[tech_name].id))

        tasks_p1 = [
            # Backend — all done
            ("Set up project structure", True, "high"),
            ("Create database models", True, "high"),
            ("Implement JWT authentication", True, "high"),
            ("Build project CRUD endpoints", True, "high"),
            ("Build task CRUD endpoints", True, "medium"),
            ("Add technology many-to-many", True, "medium"),
            ("Create dashboard summary API", True, "medium"),
            ("Add deployment info fields to projects", True, "low"),
            ("Add task comments endpoint", True, "low"),
            ("Add project activity feed endpoint", True, "medium"),
            ("Add demo mode endpoints", True, "medium"),
            ("Set up Docker Compose", True, "high"),
            ("Write Alembic migrations", True, "medium"),
            # Frontend — all done
            ("Design login and register pages", True, "medium"),
            ("Design dashboard page", True, "medium"),
            ("Build project cards and projects page", True, "medium"),
            ("Build project details page", True, "high"),
            ("Build tasks page (cross-project view)", True, "medium"),
            ("Build settings page", True, "low"),
            ("Add donut chart (dashboard)", True, "low"),
            ("Implement dark/light theme toggle", True, "low"),
            ("Add progress bars", True, "medium"),
            ("Add task detail modal (ClickUp-style)", True, "high"),
            ("Add clickable priority dropdown", True, "medium"),
            ("Add inline project field editing", True, "medium"),
            ("Add per-task comments UI", True, "medium"),
            ("Extract shared utilities (format.ts)", True, "low"),
            ("Connect frontend to backend", True, "high"),
            ("Write README and project documentation", True, "medium"),
            ("Push to GitHub", True, "low"),
            # Still pending
            ("Build learning notes UI (backend ready)", False, "medium"),
            ("Write backend tests", False, "high"),
            ("Polish responsive layout", False, "medium"),
            ("Add skeleton loading states", False, "low"),
            ("Add global error handling UI", False, "medium"),
            ("Deploy to Render (backend + DB)", False, "high"),
            ("Deploy frontend to Render/Vercel", False, "high"),
            ("Configure production CORS and env vars", False, "high"),
        ]
        for title, done, priority in tasks_p1:
            t = Task(project_id=p1.id, title=title, is_done=done, priority=priority)
            db.add(t)
            db.flush()
            if title == "Set up project structure":
                db.add(Comment(task_id=t.id, user_id=user.id, content="Used the recommended folder structure from the design brief."))
            if title == "Implement JWT authentication":
                db.add(Comment(task_id=t.id, user_id=user.id, content="Using python-jose with bcrypt. Will upgrade to httpOnly cookies later."))

        db.add(LearningNote(
            project_id=p1.id, title="Docker Compose networking",
            content="Learned how backend and PostgreSQL containers communicate through a shared Compose network. The service name acts as hostname.",
            topic="Docker",
        ))
        db.add(LearningNote(
            project_id=p1.id, title="SQL relationships clicked",
            content="Practiced one-to-many and many-to-many relationships using users, projects, tasks, and technologies.",
            topic="PostgreSQL",
        ))

        # Project 2: Portfolio Website
        p2 = Project(
            user_id=user.id, title="Portfolio Website",
            description="A personal portfolio website for showcasing projects and experience.",
            status="deployed", deployment_status="deployed",
            repo_name="portfolio", github_url="https://github.com/alexdev/portfolio",
            live_url="https://alexdev.dev", deployment_platform="Netlify",
            start_date=date(2026, 1, 15), target_date=date(2026, 2, 28),
        )
        db.add(p2)
        db.flush()
        for tech_name in ["React", "Vite", "Tailwind CSS"]:
            db.add(ProjectTechnology(project_id=p2.id, technology_id=techs[tech_name].id))
        for title in ["Design hero section", "Build projects grid", "Add responsive layout", "Deploy to Netlify", "Add dark mode"]:
            db.add(Task(project_id=p2.id, title=title, is_done=True, priority="medium"))

        # Project 3: Expense Tracker API
        p3 = Project(
            user_id=user.id, title="Expense Tracker API",
            description="A backend API for tracking personal income and expenses.",
            status="idea", deployment_status="not_deployed",
            repo_name="expense-api", github_url="https://github.com/alexdev/expense-api",
        )
        db.add(p3)
        db.flush()
        for tech_name in ["Python", "FastAPI", "PostgreSQL"]:
            db.add(ProjectTechnology(project_id=p3.id, technology_id=techs[tech_name].id))
        db.add(Task(project_id=p3.id, title="Define database schema", is_done=True, priority="high"))
        for title in ["Create expense model", "Build income endpoints", "Add monthly reports", "Add category filters"]:
            db.add(Task(project_id=p3.id, title=title, is_done=False, priority="medium"))

        db.commit()
        print("Database seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
