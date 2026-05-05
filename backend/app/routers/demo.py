from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/demo", tags=["Demo"])

_now = datetime.now(timezone.utc)


def _ago(**kwargs):
    return (_now - timedelta(**kwargs)).isoformat()


DEMO_TECHS = {
    "devboard": ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
    "portfolio": ["React", "Vite", "Tailwind CSS"],
    "expense": ["Python", "FastAPI", "PostgreSQL"],
    "kiosk": ["React", "Node.js", "MongoDB", "Docker"],
}

DEMO_PROJECTS = [
    {
        "id": "d0000001-0000-0000-0000-000000000001",
        "title": "DevBoard",
        "description": "A personal developer dashboard for tracking projects, tasks, tech stacks, and deployments. Built with React + FastAPI, designed for developers who want a clean overview of everything they're building.",
        "status": "in_progress",
        "progress": 68,
        "repo_name": "devboard",
        "github_url": "https://github.com/demo/devboard",
        "live_url": "https://devboard.demo.dev",
        "frontend_url": None,
        "backend_url": None,
        "deployment_platform": "Render",
        "deployment_status": "deployed",
        "start_date": "2026-03-15",
        "target_date": "2026-06-01",
        "created_at": _ago(days=51),
        "technologies": DEMO_TECHS["devboard"],
        "tasks_completed": 17,
        "total_tasks": 25,
        "updated_at": _ago(hours=6),
    },
    {
        "id": "d0000002-0000-0000-0000-000000000002",
        "title": "Portfolio Website",
        "description": "A personal portfolio website for showcasing projects, skills, and experience. Features smooth animations, responsive design, and a blog section.",
        "status": "deployed",
        "progress": 100,
        "repo_name": "portfolio",
        "github_url": "https://github.com/demo/portfolio",
        "live_url": "https://portfolio.demo.dev",
        "frontend_url": None,
        "backend_url": None,
        "deployment_platform": "Netlify",
        "deployment_status": "deployed",
        "start_date": "2026-02-01",
        "target_date": "2026-04-01",
        "created_at": _ago(days=93),
        "technologies": DEMO_TECHS["portfolio"],
        "tasks_completed": 12,
        "total_tasks": 12,
        "updated_at": _ago(days=15),
    },
    {
        "id": "d0000003-0000-0000-0000-000000000003",
        "title": "Expense Tracker API",
        "description": "A backend API for tracking personal income and expenses with categorization, monthly summaries, and budget alerts.",
        "status": "idea",
        "progress": 10,
        "repo_name": "expense-api",
        "github_url": "https://github.com/demo/expense-api",
        "live_url": None,
        "frontend_url": None,
        "backend_url": None,
        "deployment_platform": None,
        "deployment_status": "not_deployed",
        "start_date": "2026-04-28",
        "target_date": "2026-07-15",
        "created_at": _ago(days=7),
        "technologies": DEMO_TECHS["expense"],
        "tasks_completed": 1,
        "total_tasks": 10,
        "updated_at": _ago(days=2),
    },
    {
        "id": "d0000004-0000-0000-0000-000000000004",
        "title": "Kiosk App Dashboard",
        "description": "Admin dashboard for managing self-service kiosk deployments across locations. Includes real-time status monitoring, remote updates, and usage analytics.",
        "status": "testing",
        "progress": 85,
        "repo_name": "kiosk-dashboard",
        "github_url": "https://github.com/demo/kiosk-dashboard",
        "live_url": "https://kiosk.demo.dev",
        "frontend_url": None,
        "backend_url": None,
        "deployment_platform": "Railway",
        "deployment_status": "in_progress",
        "start_date": "2026-02-20",
        "target_date": "2026-05-15",
        "created_at": _ago(days=74),
        "technologies": DEMO_TECHS["kiosk"],
        "tasks_completed": 20,
        "total_tasks": 23,
        "updated_at": _ago(days=1),
    },
]

_P1 = "d0000001-0000-0000-0000-000000000001"
_P2 = "d0000002-0000-0000-0000-000000000002"
_P3 = "d0000003-0000-0000-0000-000000000003"
_P4 = "d0000004-0000-0000-0000-000000000004"


def _task(num, proj, title, done, priority="medium", due_date=None, desc=None):
    return {
        "id": f"t{num:04d}0000-0000-0000-0000-000000000001",
        "project_id": proj,
        "title": title,
        "description": desc,
        "is_done": done,
        "priority": priority,
        "due_date": due_date,
        "created_at": _ago(days=30),
        "updated_at": _ago(days=1 if done else 0),
    }


DEMO_TASKS = {
    _P1: [
        _task(1001, _P1, "Set up React + Vite project structure", True, "high"),
        _task(1002, _P1, "Configure Tailwind CSS and design tokens", True, "high"),
        _task(1003, _P1, "Create FastAPI backend scaffold", True, "high"),
        _task(1004, _P1, "Design PostgreSQL database schema", True, "high"),
        _task(1005, _P1, "Implement JWT authentication flow", True, "high"),
        _task(1006, _P1, "Build login and registration pages", True, "high"),
        _task(1007, _P1, "Create project CRUD API endpoints", True, "high"),
        _task(1008, _P1, "Build dashboard layout with stat cards", True, "medium"),
        _task(1009, _P1, "Add project cards with progress bars", True, "medium"),
        _task(1010, _P1, "Implement task management API", True, "high"),
        _task(1011, _P1, "Build task list UI component", True, "medium"),
        _task(1012, _P1, "Set up Docker Compose orchestration", True, "high"),
        _task(1013, _P1, "Create database seed script", True, "medium"),
        _task(1014, _P1, "Add technology tags to projects", True, "low"),
        _task(1015, _P1, "Build sidebar navigation", True, "medium"),
        _task(1016, _P1, "Implement guest demo mode", True, "medium"),
        _task(1017, _P1, "Add responsive layout breakpoints", True, "medium"),
        _task(1018, _P1, "Implement dark/light theme toggle", False, "high", str(date.today() + timedelta(days=3))),
        _task(1019, _P1, "Add project filtering and search", False, "medium", str(date.today() + timedelta(days=10))),
        _task(1020, _P1, "Create project analytics charts", False, "medium", str(date.today() + timedelta(days=7))),
        _task(1021, _P1, "Add task drag-and-drop reordering", False, "low", str(date.today() + timedelta(days=15))),
        _task(1022, _P1, "Implement notification system", False, "medium", str(date.today() + timedelta(days=13))),
        _task(1023, _P1, "Add export to CSV functionality", False, "low", str(date.today() + timedelta(days=20))),
        _task(1024, _P1, "Add user profile settings page", False, "medium", str(date.today() + timedelta(days=5))),
        _task(1025, _P1, "Write API documentation with Swagger", False, "low", str(date.today() + timedelta(days=25))),
    ],
    _P2: [
        _task(2001, _P2, "Design landing page mockup in Figma", True, "high"),
        _task(2002, _P2, "Build hero section with scroll animations", True, "medium"),
        _task(2003, _P2, "Create project showcase grid", True, "high"),
        _task(2004, _P2, "Write about me section content", True, "medium"),
        _task(2005, _P2, "Implement contact form with validation", True, "medium"),
        _task(2006, _P2, "Set up Netlify CI/CD pipeline", True, "high"),
        _task(2007, _P2, "Add SEO meta tags and Open Graph", True, "medium"),
        _task(2008, _P2, "Optimize images with lazy loading", True, "medium"),
        _task(2009, _P2, "Add dark mode support", True, "low"),
        _task(2010, _P2, "Create blog section with MDX", True, "medium"),
        _task(2011, _P2, "Add downloadable resume button", True, "low"),
        _task(2012, _P2, "Configure custom domain and SSL", True, "high"),
    ],
    _P3: [
        _task(3001, _P3, "Define API requirements and endpoints", True, "high"),
        _task(3002, _P3, "Design database schema for transactions", False, "high", str(date.today() + timedelta(days=10))),
        _task(3003, _P3, "Set up FastAPI project structure", False, "high", str(date.today() + timedelta(days=7)),
              "Initialize project with proper folder structure, config, and dependencies"),
        _task(3004, _P3, "Create user authentication endpoints", False, "high", str(date.today() + timedelta(days=14))),
        _task(3005, _P3, "Build transaction CRUD endpoints", False, "high", str(date.today() + timedelta(days=18))),
        _task(3006, _P3, "Add expense category management", False, "medium", str(date.today() + timedelta(days=22))),
        _task(3007, _P3, "Implement monthly summary reports", False, "medium", str(date.today() + timedelta(days=28))),
        _task(3008, _P3, "Add budget tracking and alerts", False, "medium", str(date.today() + timedelta(days=35))),
        _task(3009, _P3, "Create data export to CSV/JSON", False, "low", str(date.today() + timedelta(days=40))),
        _task(3010, _P3, "Write comprehensive unit tests", False, "medium", str(date.today() + timedelta(days=45))),
    ],
    _P4: [
        _task(4001, _P4, "Set up React project with TypeScript", True, "high"),
        _task(4002, _P4, "Design admin dashboard wireframes", True, "high"),
        _task(4003, _P4, "Build kiosk CRUD management UI", True, "high"),
        _task(4004, _P4, "Create Node.js REST API backend", True, "high"),
        _task(4005, _P4, "Set up MongoDB schemas and indexes", True, "high"),
        _task(4006, _P4, "Implement real-time kiosk status updates", True, "high"),
        _task(4007, _P4, "Build location management module", True, "medium"),
        _task(4008, _P4, "Add kiosk health monitoring dashboard", True, "medium"),
        _task(4009, _P4, "Create user role permissions system", True, "high"),
        _task(4010, _P4, "Build deployment pipeline for updates", True, "high"),
        _task(4011, _P4, "Add usage analytics with charts", True, "medium"),
        _task(4012, _P4, "Implement remote kiosk restart feature", True, "medium"),
        _task(4013, _P4, "Build notification alerts system", True, "medium"),
        _task(4014, _P4, "Create kiosk configuration templates", True, "medium"),
        _task(4015, _P4, "Add bulk import/export for kiosks", True, "low"),
        _task(4016, _P4, "Implement audit log for changes", True, "medium"),
        _task(4017, _P4, "Build scheduled maintenance windows", True, "medium"),
        _task(4018, _P4, "Add Docker containerization", True, "high"),
        _task(4019, _P4, "Create end-to-end integration tests", True, "medium"),
        _task(4020, _P4, "Set up CI/CD with GitHub Actions", True, "high"),
        _task(4021, _P4, "Add performance monitoring dashboard", False, "medium", str(date.today() + timedelta(days=3))),
        _task(4022, _P4, "Implement batch kiosk firmware updates", False, "high", str(date.today() + timedelta(days=1))),
        _task(4023, _P4, "Add A/B testing for kiosk UI variants", False, "low", str(date.today() + timedelta(days=10))),
    ],
}


def _activity(num, proj, typ, user, content, **time_kwargs):
    return {
        "id": f"a{num:04d}0000-0000-0000-0000-000000000001",
        "project_id": proj,
        "type": typ,
        "user_name": user,
        "user_avatar_initial": user[0].upper(),
        "content": content,
        "created_at": _ago(**time_kwargs),
    }


DEMO_ACTIVITY = {
    _P1: [
        _activity(1001, _P1, "comment", "Alex", "The demo mode is working great — guest users can explore without signing up. Moving on to the theme toggle next.", hours=6),
        _activity(1002, _P1, "task_completed", "Alex", "Completed: Add responsive layout breakpoints", hours=8),
        _activity(1003, _P1, "task_completed", "Alex", "Completed: Implement guest demo mode", days=1),
        _activity(1004, _P1, "deployment", "Alex", "Deployed latest build to Render — dashboard and project views are live", days=1),
        _activity(1005, _P1, "commit", "Alex", "Pushed 4 commits: sidebar nav, stat cards, demo endpoints", days=2),
        _activity(1006, _P1, "task_completed", "Alex", "Completed: Build sidebar navigation", days=2),
        _activity(1007, _P1, "comment", "Alex", "Decided to use CSS custom properties for theming instead of Tailwind's dark: variant directly. Much cleaner for runtime switching.", days=3),
        _activity(1008, _P1, "task_completed", "Alex", "Completed: Set up Docker Compose orchestration", days=4),
        _activity(1009, _P1, "status_change", "Alex", "Changed project status from idea → in_progress", days=5),
        _activity(1010, _P1, "comment", "Alex", "Backend API is solid — 19 endpoints, all tested. Time to focus on the frontend polish.", days=6),
    ],
    _P2: [
        _activity(2001, _P2, "deployment", "Alex", "Final deployment to Netlify — custom domain configured and live!", days=15),
        _activity(2002, _P2, "task_completed", "Alex", "Completed: Configure custom domain and SSL", days=15),
        _activity(2003, _P2, "task_completed", "Alex", "Completed: Add downloadable resume button", days=16),
        _activity(2004, _P2, "comment", "Alex", "All 12 tasks done! Portfolio is fully deployed. Time to share it.", days=15),
        _activity(2005, _P2, "status_change", "Alex", "Changed project status from testing → deployed", days=15),
        _activity(2006, _P2, "task_completed", "Alex", "Completed: Create blog section with MDX", days=18),
        _activity(2007, _P2, "commit", "Alex", "Pushed 6 commits: blog section, dark mode, SEO tags", days=18),
        _activity(2008, _P2, "comment", "Alex", "Blog section looks great with MDX. Added syntax highlighting for code snippets too.", days=19),
        _activity(2009, _P2, "task_completed", "Alex", "Completed: Optimize images with lazy loading", days=22),
        _activity(2010, _P2, "deployment", "Alex", "First staging deployment to Netlify — testing CI/CD pipeline", days=30),
    ],
    _P3: [
        _activity(3001, _P3, "task_completed", "Alex", "Completed: Define API requirements and endpoints", days=2),
        _activity(3002, _P3, "comment", "Alex", "Decided to start with the database schema design. Going with a normalized approach for transactions, categories, and budgets.", days=2),
        _activity(3003, _P3, "comment", "Alex", "Looked into existing expense tracker APIs for inspiration. Planning to add recurring transaction support later.", days=5),
        _activity(3004, _P3, "status_change", "Alex", "Created project — starting with requirements planning", days=7),
    ],
    _P4: [
        _activity(4001, _P4, "comment", "Alex", "Almost done! Just need the performance monitoring dashboard and batch firmware updates. Should be ready for production by next week.", days=1),
        _activity(4002, _P4, "task_completed", "Alex", "Completed: Set up CI/CD with GitHub Actions", days=1),
        _activity(4003, _P4, "task_completed", "Alex", "Completed: Create end-to-end integration tests", days=2),
        _activity(4004, _P4, "commit", "Alex", "Pushed 8 commits: test suite, CI/CD pipeline, Docker config", days=2),
        _activity(4005, _P4, "status_change", "Alex", "Changed project status from in_progress → testing", days=3),
        _activity(4006, _P4, "deployment", "Alex", "Deployed staging build to Railway for QA testing", days=3),
        _activity(4007, _P4, "task_completed", "Alex", "Completed: Add Docker containerization", days=4),
        _activity(4008, _P4, "comment", "Alex", "Remote restart feature is working well in testing. Added retry logic for unreachable kiosks.", days=6),
        _activity(4009, _P4, "task_completed", "Alex", "Completed: Implement remote kiosk restart feature", days=6),
        _activity(4010, _P4, "task_completed", "Alex", "Completed: Build notification alerts system", days=8),
    ],
}


@router.get("/dashboard")
def demo_dashboard():
    statuses = {"idea": 0, "in_progress": 0, "testing": 0, "deployed": 0, "archived": 0}
    all_techs: set[str] = set()
    total_progress = 0
    completed = 0
    total = 0

    for p in DEMO_PROJECTS:
        statuses[p["status"]] += 1
        total_progress += p["progress"]
        completed += p["tasks_completed"]
        total += p["total_tasks"]
        for t in p["technologies"]:
            all_techs.add(t)

    return {
        "total_projects": len(DEMO_PROJECTS),
        "projects_by_status": statuses,
        "average_progress": round(total_progress / len(DEMO_PROJECTS)),
        "completed_tasks": completed,
        "total_tasks": total,
        "technologies_used": sorted(all_techs),
        "recent_projects": DEMO_PROJECTS,
    }


@router.get("/projects")
def demo_projects():
    return DEMO_PROJECTS


@router.get("/projects/{project_id}")
def demo_project_detail(project_id: str):
    for p in DEMO_PROJECTS:
        if p["id"] == project_id:
            return p
    raise HTTPException(status_code=404, detail="Demo project not found")


@router.get("/projects/{project_id}/tasks")
def demo_project_tasks(project_id: str):
    tasks = DEMO_TASKS.get(project_id)
    if tasks is None:
        raise HTTPException(status_code=404, detail="Demo project not found")
    return tasks


@router.get("/projects/{project_id}/activity")
def demo_project_activity(project_id: str):
    activity = DEMO_ACTIVITY.get(project_id)
    if activity is None:
        raise HTTPException(status_code=404, detail="Demo project not found")
    return activity


def _task_comment(num, task_id, user, content, **time_kwargs):
    return {
        "id": f"c{num:04d}0000-0000-0000-0000-000000000001",
        "task_id": task_id,
        "user_id": "00000000-0000-0000-0000-000000000001",
        "user_name": user,
        "content": content,
        "created_at": _ago(**time_kwargs),
        "updated_at": _ago(**time_kwargs),
    }


DEMO_TASK_COMMENTS = {
    "t10180000-0000-0000-0000-000000000001": [
        _task_comment(1, "t10180000-0000-0000-0000-000000000001", "Alex",
                      "Need to support both CSS custom properties and Tailwind's dark: variant. Going with custom properties approach.", days=5),
        _task_comment(2, "t10180000-0000-0000-0000-000000000001", "Alex",
                      "Theme toggle component is done, just need to wire up persistence to localStorage.", days=2),
    ],
    "t10190000-0000-0000-0000-000000000001": [
        _task_comment(3, "t10190000-0000-0000-0000-000000000001", "Alex",
                      "Thinking about using Fuse.js for fuzzy search on project titles and descriptions.", days=3),
    ],
    "t40220000-0000-0000-0000-000000000001": [
        _task_comment(4, "t40220000-0000-0000-0000-000000000001", "Alex",
                      "Firmware update system needs to handle rollback on failure. Looking into A/B partition strategy.", days=4),
        _task_comment(5, "t40220000-0000-0000-0000-000000000001", "Alex",
                      "Added retry logic with exponential backoff for unreachable kiosks.", days=1),
    ],
    "t30030000-0000-0000-0000-000000000001": [
        _task_comment(6, "t30030000-0000-0000-0000-000000000001", "Alex",
                      "Going with a clean architecture approach — separate routers, services, and schemas directories.", days=6),
    ],
}


@router.get("/tasks/{task_id}/comments")
def demo_task_comments(task_id: str):
    return DEMO_TASK_COMMENTS.get(task_id, [])
