"""Run Alembic migrations and optional seeding on startup."""
import subprocess
import sys


def run_migrations():
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)


def run_seed():
    from app.db.seed import seed
    seed()
