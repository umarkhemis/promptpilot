
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from pydantic import BaseModel

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.community_lib import CommunityPrompt, CommunityUpvote, CommunitySave

router = APIRouter(prefix="/community", tags=["community"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class PublishRequest(BaseModel):
    title: str
    description: Optional[str] = None
    content: str
    category: str
    mode: str


class CommunityPromptResponse(BaseModel):
    id: str
    user_id: str
    author_email: str           # partial — show only the username part before @
    title: str
    description: Optional[str]
    content: str
    category: str
    mode: str
    upvote_count: int
    save_count: int
    fork_count: int
    forked_from: Optional[str]  # id of original prompt if this is a fork
    is_public: bool
    has_upvoted: bool           # whether the current user has upvoted this
    has_saved: bool             # whether the current user has saved this
    created_at: str


class UpdatePromptRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    is_public: Optional[bool] = None


class ProfileResponse(BaseModel):
    user_id: str
    author_email: str
    total_upvotes: int
    total_forks: int
    published_count: int
    prompts: list[CommunityPromptResponse]


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _get_prompt_or_404(prompt_id: str, db: AsyncSession) -> CommunityPrompt:
    result = await db.execute(
        select(CommunityPrompt).where(CommunityPrompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()
    if prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return prompt


async def _has_upvoted(prompt_id, user_id, db: AsyncSession) -> bool:
    result = await db.execute(
        select(CommunityUpvote).where(
            CommunityUpvote.prompt_id == prompt_id,
            CommunityUpvote.user_id == user_id,
        )
    )
    return result.scalar_one_or_none() is not None


async def _has_saved(prompt_id, user_id, db: AsyncSession) -> bool:
    result = await db.execute(
        select(CommunitySave).where(
            CommunitySave.prompt_id == prompt_id,
            CommunitySave.user_id == user_id,
        )
    )
    return result.scalar_one_or_none() is not None


async def _build_response(
    prompt: CommunityPrompt,
    current_user_id,
    db: AsyncSession,
) -> CommunityPromptResponse:
    user_result = await db.execute(select(User).where(User.id == prompt.user_id))
    user = user_result.scalar_one_or_none()
    author_email = user.email if user else "unknown"

    return CommunityPromptResponse(
        id=str(prompt.id),
        user_id=str(prompt.user_id),
        author_email=author_email,
        title=prompt.title,
        description=prompt.description,
        content=prompt.content,
        category=prompt.category,
        mode=prompt.mode,
        upvote_count=prompt.upvote_count,
        save_count=prompt.save_count,
        fork_count=prompt.fork_count,
        forked_from=str(prompt.forked_from) if prompt.forked_from else None,
        is_public=prompt.is_public,
        has_upvoted=await _has_upvoted(prompt.id, current_user_id, db),
        has_saved=await _has_saved(prompt.id, current_user_id, db),
        created_at=prompt.created_at.isoformat(),
    )


# ── Routes — feed ──────────────────────────────────────────────────────────────

@router.get("", response_model=list[CommunityPromptResponse])
async def list_community_prompts(
    category: Optional[str] = Query(None),
    mode: Optional[str] = Query(None),
    sort: str = Query("top", enum=["top", "new"]),  # "top" = by upvotes, "new" = by date
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Public feed — all published community prompts."""
    stmt = select(CommunityPrompt).where(CommunityPrompt.is_public == True)  # noqa: E712

    if category:
        stmt = stmt.where(CommunityPrompt.category == category)
    if mode:
        stmt = stmt.where(CommunityPrompt.mode.in_([mode, "both"]))
    if sort == "top":
        stmt = stmt.order_by(CommunityPrompt.upvote_count.desc())
    else:
        stmt = stmt.order_by(CommunityPrompt.created_at.desc())

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    prompts = result.scalars().all()
    return [await _build_response(p, current_user.id, db) for p in prompts]


@router.get("/saved", response_model=list[CommunityPromptResponse])
async def list_saved_prompts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Prompts the current user has saved/bookmarked."""
    result = await db.execute(
        select(CommunitySave).where(CommunitySave.user_id == current_user.id)
    )
    saves = result.scalars().all()

    out = []
    for save in saves:
        prompt_result = await db.execute(
            select(CommunityPrompt).where(CommunityPrompt.id == save.prompt_id)
        )
        prompt = prompt_result.scalar_one_or_none()
        if prompt:
            out.append(await _build_response(prompt, current_user.id, db))
    return out


@router.get("/my", response_model=list[CommunityPromptResponse])
async def list_my_published_prompts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """All prompts published by the current user (public and private)."""
    result = await db.execute(
        select(CommunityPrompt)
        .where(CommunityPrompt.user_id == current_user.id)
        .order_by(CommunityPrompt.created_at.desc())
    )
    prompts = result.scalars().all()
    return [await _build_response(p, current_user.id, db) for p in prompts]


@router.get("/profile/{user_id}", response_model=ProfileResponse)
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Public profile — shows a user's published prompts and stats."""
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result = await db.execute(
        select(CommunityPrompt)
        .where(
            CommunityPrompt.user_id == user_id,
            CommunityPrompt.is_public == True,  # noqa: E712
        )
        .order_by(CommunityPrompt.upvote_count.desc())
    )
    prompts = result.scalars().all()

    total_upvotes = sum(p.upvote_count for p in prompts)
    total_forks = sum(p.fork_count for p in prompts)

    return ProfileResponse(
        user_id=str(user.id),
        author_email=user.email,
        total_upvotes=total_upvotes,
        total_forks=total_forks,
        published_count=len(prompts),
        prompts=[await _build_response(p, current_user.id, db) for p in prompts],
    )


@router.get("/{prompt_id}", response_model=CommunityPromptResponse)
async def get_community_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single community prompt by id."""
    prompt = await _get_prompt_or_404(prompt_id, db)
    if not prompt.is_public and str(prompt.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This prompt is private")
    return await _build_response(prompt, current_user.id, db)


# ── Routes — publish & manage ──────────────────────────────────────────────────

@router.post("", response_model=CommunityPromptResponse, status_code=status.HTTP_201_CREATED)
async def publish_prompt(
    data: PublishRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Publish a new prompt to the community feed."""
    prompt = CommunityPrompt(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        content=data.content,
        category=data.category,
        mode=data.mode,
    )
    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)
    return await _build_response(prompt, current_user.id, db)


@router.patch("/{prompt_id}", response_model=CommunityPromptResponse)
async def update_community_prompt(
    prompt_id: str,
    data: UpdatePromptRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Edit or unpublish your own prompt."""
    prompt = await _get_prompt_or_404(prompt_id, db)
    if str(prompt.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your prompt")

    if data.title is not None:
        prompt.title = data.title
    if data.description is not None:
        prompt.description = data.description
    if data.content is not None:
        prompt.content = data.content
    if data.is_public is not None:
        prompt.is_public = data.is_public

    await db.commit()
    await db.refresh(prompt)
    return await _build_response(prompt, current_user.id, db)


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_community_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete your own published prompt."""
    prompt = await _get_prompt_or_404(prompt_id, db)
    if str(prompt.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your prompt")
    await db.delete(prompt)
    await db.commit()


# ── Routes — upvote ────────────────────────────────────────────────────────────

@router.post("/{prompt_id}/upvote", response_model=CommunityPromptResponse)
async def upvote_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upvote a prompt. Calling again removes the upvote (toggle)."""
    prompt = await _get_prompt_or_404(prompt_id, db)

    existing = await db.execute(
        select(CommunityUpvote).where(
            CommunityUpvote.prompt_id == prompt_id,
            CommunityUpvote.user_id == current_user.id,
        )
    )
    vote = existing.scalar_one_or_none()

    if vote:
        # Toggle off — remove upvote
        await db.delete(vote)
        prompt.upvote_count = max(0, prompt.upvote_count - 1)
    else:
        # Toggle on — add upvote
        db.add(CommunityUpvote(user_id=current_user.id, prompt_id=prompt_id))
        prompt.upvote_count += 1

    await db.commit()
    await db.refresh(prompt)
    return await _build_response(prompt, current_user.id, db)


# ── Routes — save ──────────────────────────────────────────────────────────────

@router.post("/{prompt_id}/save", response_model=CommunityPromptResponse)
async def save_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bookmark a prompt. Calling again removes it (toggle)."""
    prompt = await _get_prompt_or_404(prompt_id, db)

    existing = await db.execute(
        select(CommunitySave).where(
            CommunitySave.prompt_id == prompt_id,
            CommunitySave.user_id == current_user.id,
        )
    )
    save = existing.scalar_one_or_none()

    if save:
        await db.delete(save)
        prompt.save_count = max(0, prompt.save_count - 1)
    else:
        db.add(CommunitySave(user_id=current_user.id, prompt_id=prompt_id))
        prompt.save_count += 1

    await db.commit()
    await db.refresh(prompt)
    return await _build_response(prompt, current_user.id, db)


# ── Routes — fork ──────────────────────────────────────────────────────────────

@router.post("/{prompt_id}/fork", response_model=CommunityPromptResponse, status_code=status.HTTP_201_CREATED)
async def fork_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fork a community prompt into your own published prompts.
    The fork keeps a reference to the original via forked_from.
    The original prompt's fork_count is incremented.
    """
    original = await _get_prompt_or_404(prompt_id, db)
    if not original.is_public:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot fork a private prompt")
    if str(original.user_id) == str(current_user.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot fork your own prompt")

    # Create the fork
    fork = CommunityPrompt(
        user_id=current_user.id,
        title=f"{original.title} (fork)",
        description=original.description,
        content=original.content,
        category=original.category,
        mode=original.mode,
        forked_from=original.id,
        is_public=False,        # forked prompt starts as private — user can publish when ready
    )
    db.add(fork)

    # Increment original fork count
    original.fork_count += 1

    await db.commit()
    await db.refresh(fork)
    return await _build_response(fork, current_user.id, db)