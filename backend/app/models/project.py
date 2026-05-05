import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="idea")
    repo_name: Mapped[str | None] = mapped_column(String(200))
    github_url: Mapped[str | None] = mapped_column(String(500))
    live_url: Mapped[str | None] = mapped_column(String(500))
    frontend_url: Mapped[str | None] = mapped_column(String(500))
    backend_url: Mapped[str | None] = mapped_column(String(500))
    deployment_platform: Mapped[str | None] = mapped_column(String(50))
    deployment_status: Mapped[str] = mapped_column(String(20), default="not_deployed")
    start_date: Mapped[date | None] = mapped_column(Date)
    target_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="projects")  # noqa: F821
    tasks: Mapped[list["Task"]] = relationship(back_populates="project", cascade="all, delete-orphan")  # noqa: F821
    learning_notes: Mapped[list["LearningNote"]] = relationship(back_populates="project", cascade="all, delete-orphan")  # noqa: F821
    project_technologies: Mapped[list["ProjectTechnology"]] = relationship(back_populates="project", cascade="all, delete-orphan")  # noqa: F821
    project_comments: Mapped[list["ProjectComment"]] = relationship(back_populates="project", cascade="all, delete-orphan")  # noqa: F821

    @property
    def progress(self) -> int:
        if not self.tasks:
            return 0
        completed = sum(1 for t in self.tasks if t.is_done)
        return round(completed / len(self.tasks) * 100)
