from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.prompt import Prompt

router = APIRouter(prefix="/history", tags=["history"])


class PromptHistoryItem(BaseModel):
    id: str
    raw_prompt: str
    improved_prompt: Optional[str]
    intent: Optional[str]
    recommended_tool: Optional[str]
    created_at: str


class PaginatedHistory(BaseModel):
    items: list[PromptHistoryItem]
    total: int
    page: int
    page_size: int


@router.get("", response_model=PaginatedHistory)
async def list_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offset = (page - 1) * page_size

    count_result = await db.execute(
        select(func.count()).select_from(Prompt).where(Prompt.user_id == current_user.id)
    )
    total = count_result.scalar_one()

    result = await db.execute(
        select(Prompt)
        .where(Prompt.user_id == current_user.id)
        .order_by(Prompt.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    prompts = result.scalars().all()

    items = [
        PromptHistoryItem(
            id=str(p.id),
            raw_prompt=p.raw_prompt,
            improved_prompt=p.improved_prompt,
            intent=p.intent,
            recommended_tool=p.recommended_tool,
            created_at=p.created_at.isoformat(),
        )
        for p in prompts
    ]
    return PaginatedHistory(items=items, total=total, page=page, page_size=page_size)


@router.get("/{prompt_id}", response_model=PromptHistoryItem)
async def get_history_item(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id, Prompt.user_id == current_user.id)
    )
    prompt = result.scalar_one_or_none()
    if prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return PromptHistoryItem(
        id=str(prompt.id),
        raw_prompt=prompt.raw_prompt,
        improved_prompt=prompt.improved_prompt,
        intent=prompt.intent,
        recommended_tool=prompt.recommended_tool,
        created_at=prompt.created_at.isoformat(),
    )
