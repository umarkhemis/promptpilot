
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Boolean, UniqueConstraint
from sqlalchemy import Uuid
from app.models.user import Base


class CommunityPrompt(Base):
    __tablename__ = "community_prompts"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)          # the prompt text with [PLACEHOLDERS]
    category = Column(String, nullable=False, index=True)
    mode = Column(String, nullable=False, index=True)   # "student" | "marketing" | "both"
    upvote_count = Column(Integer, default=0, nullable=False)
    save_count = Column(Integer, default=0, nullable=False)
    fork_count = Column(Integer, default=0, nullable=False)
    forked_from = Column(
        Uuid(as_uuid=True),
        ForeignKey("community_prompts.id", ondelete="SET NULL"),
        nullable=True,                              # null = original, set = forked
        index=True,
    )
    is_public = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class CommunityUpvote(Base):
    __tablename__ = "community_upvotes"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    prompt_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("community_prompts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("user_id", "prompt_id", name="uq_community_upvote"),
    )


class CommunitySave(Base):
    __tablename__ = "community_saves"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    prompt_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("community_prompts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    saved_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("user_id", "prompt_id", name="uq_community_save"),
    )