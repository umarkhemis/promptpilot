
# app/schemas/brand_voice.py

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BrandVoiceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    content: str = Field(..., min_length=10)
    mode: str = Field(default="marketing", max_length=50)
    is_default: bool = False


class BrandVoiceUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = Field(None, min_length=10)
    mode: Optional[str] = Field(None, max_length=50)
    is_default: Optional[bool] = None


class BrandVoiceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: Optional[str]
    content: str
    mode: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True