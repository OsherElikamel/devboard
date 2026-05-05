import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Technology(Base):
    __tablename__ = "technologies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    category: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project_technologies: Mapped[list["ProjectTechnology"]] = relationship(back_populates="technology", cascade="all, delete-orphan")


class ProjectTechnology(Base):
    __tablename__ = "project_technologies"
    __table_args__ = (UniqueConstraint("project_id", "technology_id"),)

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), primary_key=True)
    technology_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("technologies.id"), primary_key=True)

    project: Mapped["Project"] = relationship(back_populates="project_technologies")  # noqa: F821
    technology: Mapped["Technology"] = relationship(back_populates="project_technologies")
