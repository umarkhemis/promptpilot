import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy import Uuid
from app.models.user import Base


class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    raw_prompt = Column(Text, nullable=False)
    improved_prompt = Column(Text, nullable=True)
    intent = Column(String, nullable=True)
    recommended_tool = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
