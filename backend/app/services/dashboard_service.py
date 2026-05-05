from sqlalchemy.orm import Session, joinedload

from app.models.project import Project
from app.models.technology import ProjectTechnology
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.project_service import _to_response


def get_dashboard_summary(db: Session, user: User) -> DashboardSummary:
    projects = (
        db.query(Project)
        .options(joinedload(Project.tasks), joinedload(Project.project_technologies).joinedload(ProjectTechnology.technology))
        .filter(Project.user_id == user.id, Project.deleted_at.is_(None))
        .order_by(Project.updated_at.desc())
        .all()
    )

    statuses = {"idea": 0, "in_progress": 0, "testing": 0, "deployed": 0, "archived": 0}
    all_techs: set[str] = set()
    total_progress = 0
    completed_tasks = 0
    total_tasks = 0

    for p in projects:
        statuses[p.status] = statuses.get(p.status, 0) + 1
        total_progress += p.progress
        completed_tasks += sum(1 for t in p.tasks if t.is_done)
        total_tasks += len(p.tasks)
        for pt in p.project_technologies:
            all_techs.add(pt.technology.name)

    avg_progress = round(total_progress / len(projects)) if projects else 0

    recent = [_to_response(p) for p in projects[:5]]

    return DashboardSummary(
        total_projects=len(projects),
        projects_by_status=statuses,
        average_progress=avg_progress,
        completed_tasks=completed_tasks,
        total_tasks=total_tasks,
        technologies_used=sorted(all_techs),
        recent_projects=recent,
    )
