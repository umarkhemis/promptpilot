
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer, Text
from sqlalchemy import Uuid
from app.models.user import Base


class Pack(Base):
    __tablename__ = "packs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False, index=True)   # e.g. "email", "seo", "coding"
    mode = Column(String, nullable=False, index=True)       # "student" | "marketing" | "both"
    is_free = Column(Boolean, default=True, nullable=False)
    cover_emoji = Column(String, nullable=True)             # e.g. "📧" shown on pack card
    created_by = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class PackPrompt(Base):
    __tablename__ = "pack_prompts"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pack_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("packs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)         
    category = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)         
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class UserPackInstall(Base):
    __tablename__ = "user_pack_installs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    pack_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("packs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    workspace_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="SET NULL"),
        nullable=True,   # null = personal install, set = workspace install
        index=True,
    )
    installed_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )