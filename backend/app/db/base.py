from app.db.base_class import Base  # noqa: F401

# Import all models so Alembic can see them
from app.models.user import User  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.task import Task  # noqa: F401
from app.models.comment import Comment  # noqa: F401
from app.models.technology import Technology, ProjectTechnology  # noqa: F401
from app.models.learning_note import LearningNote  # noqa: F401
from app.models.project_comment import ProjectComment  # noqa: F401
