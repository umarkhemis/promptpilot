
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from pydantic import BaseModel

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.packs import Pack, PackPrompt, UserPackInstall

router = APIRouter(prefix="/packs", tags=["packs"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class PackPromptResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    content: str
    category: str
    sort_order: int


class PackResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    category: str
    mode: str
    is_free: bool
    cover_emoji: Optional[str]
    prompt_count: int
    is_installed: bool      # whether the current user has installed this pack
    created_at: str


class PackDetailResponse(PackResponse):
    prompts: list[PackPromptResponse]


class PackCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    mode: str
    is_free: bool = True
    cover_emoji: Optional[str] = None


class PackPromptCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: str
    category: str
    sort_order: int = 0


class InstallRequest(BaseModel):
    workspace_id: Optional[str] = None   # omit for personal install


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_pack_or_404(pack_id: str, db: AsyncSession) -> Pack:
    result = await db.execute(select(Pack).where(Pack.id == pack_id))
    pack = result.scalar_one_or_none()
    if pack is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pack not found")
    return pack


async def _is_installed(pack_id, user_id, db: AsyncSession) -> bool:
    result = await db.execute(
        select(UserPackInstall).where(
            UserPackInstall.pack_id == pack_id,
            UserPackInstall.user_id == user_id,
        )
    )
    return result.scalar_one_or_none() is not None


async def _prompt_count(pack_id, db: AsyncSession) -> int:
    result = await db.execute(
        select(func.count()).select_from(PackPrompt).where(PackPrompt.pack_id == pack_id)
    )
    return result.scalar_one()


async def _build_pack_response(
    pack: Pack, user_id, db: AsyncSession
) -> PackResponse:
    return PackResponse(
        id=str(pack.id),
        title=pack.title,
        description=pack.description,
        category=pack.category,
        mode=pack.mode,
        is_free=pack.is_free,
        cover_emoji=pack.cover_emoji,
        prompt_count=await _prompt_count(pack.id, db),
        is_installed=await _is_installed(pack.id, user_id, db),
        created_at=pack.created_at.isoformat(),
    )


# ── Routes — browsing ─────────────────────────────────────────────────────────

@router.get("", response_model=list[PackResponse])
async def list_packs(
    category: Optional[str] = Query(None),
    mode: Optional[str] = Query(None),
    is_free: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Browse all available packs with optional filters."""
    stmt = select(Pack)
    if category:
        stmt = stmt.where(Pack.category == category)
    if mode:
        stmt = stmt.where(Pack.mode.in_([mode, "both"]))
    if is_free is not None:
        stmt = stmt.where(Pack.is_free == is_free)
    stmt = stmt.order_by(Pack.created_at.desc())

    result = await db.execute(stmt)
    packs = result.scalars().all()
    return [await _build_pack_response(p, current_user.id, db) for p in packs]


@router.get("/installed", response_model=list[PackDetailResponse])
async def list_installed_packs(
    workspace_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List packs installed by the current user (personal or workspace).
    Returns full detail including prompts so the dashboard can use them directly.
    """
    stmt = select(UserPackInstall).where(UserPackInstall.user_id == current_user.id)
    if workspace_id:
        stmt = stmt.where(UserPackInstall.workspace_id == workspace_id)
    else:
        stmt = stmt.where(UserPackInstall.workspace_id == None)  # noqa: E711

    result = await db.execute(stmt)
    installs = result.scalars().all()

    out = []
    for install in installs:
        pack_result = await db.execute(select(Pack).where(Pack.id == install.pack_id))
        pack = pack_result.scalar_one_or_none()
        if not pack:
            continue

        prompts_result = await db.execute(
            select(PackPrompt)
            .where(PackPrompt.pack_id == pack.id)
            .order_by(PackPrompt.sort_order)
        )
        prompts = prompts_result.scalars().all()

        out.append(PackDetailResponse(
            id=str(pack.id),
            title=pack.title,
            description=pack.description,
            category=pack.category,
            mode=pack.mode,
            is_free=pack.is_free,
            cover_emoji=pack.cover_emoji,
            prompt_count=len(prompts),
            is_installed=True,
            created_at=pack.created_at.isoformat(),
            prompts=[
                PackPromptResponse(
                    id=str(p.id),
                    title=p.title,
                    description=p.description,
                    content=p.content,
                    category=p.category,
                    sort_order=p.sort_order,
                )
                for p in prompts
            ],
        ))
    return out


@router.get("/{pack_id}", response_model=PackDetailResponse)
async def get_pack(
    pack_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a pack with full prompt list — used for the preview page."""
    pack = await _get_pack_or_404(pack_id, db)

    prompts_result = await db.execute(
        select(PackPrompt)
        .where(PackPrompt.pack_id == pack.id)
        .order_by(PackPrompt.sort_order)
    )
    prompts = prompts_result.scalars().all()

    base = await _build_pack_response(pack, current_user.id, db)
    return PackDetailResponse(
        **base.model_dump(),
        prompts=[
            PackPromptResponse(
                id=str(p.id),
                title=p.title,
                description=p.description,
                content=p.content,
                category=p.category,
                sort_order=p.sort_order,
            )
            for p in prompts
        ],
    )


# ── Routes — install / uninstall ──────────────────────────────────────────────

@router.post("/{pack_id}/install", response_model=PackResponse, status_code=status.HTTP_201_CREATED)
async def install_pack(
    pack_id: str,
    data: InstallRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Install a pack into personal library or a workspace."""
    pack = await _get_pack_or_404(pack_id, db)

    # Prevent duplicate installs for same user + same scope
    stmt = select(UserPackInstall).where(
        UserPackInstall.pack_id == pack_id,
        UserPackInstall.user_id == current_user.id,
    )
    if data.workspace_id:
        stmt = stmt.where(UserPackInstall.workspace_id == data.workspace_id)
    else:
        stmt = stmt.where(UserPackInstall.workspace_id == None)  # noqa: E711

    existing = await db.execute(stmt)
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Pack already installed")

    db.add(UserPackInstall(
        user_id=current_user.id,
        pack_id=pack_id,
        workspace_id=data.workspace_id,
    ))
    await db.commit()
    return await _build_pack_response(pack, current_user.id, db)


@router.delete("/{pack_id}/uninstall", status_code=status.HTTP_204_NO_CONTENT)
async def uninstall_pack(
    pack_id: str,
    workspace_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Uninstall a pack from personal library or a workspace."""
    stmt = delete(UserPackInstall).where(
        UserPackInstall.pack_id == pack_id,
        UserPackInstall.user_id == current_user.id,
    )
    if workspace_id:
        stmt = stmt.where(UserPackInstall.workspace_id == workspace_id)
    else:
        stmt = stmt.where(UserPackInstall.workspace_id == None)  # noqa: E711

    await db.execute(stmt)
    await db.commit()


# ── Routes — admin (pack creation) ────────────────────────────────────────────

@router.post("", response_model=PackResponse, status_code=status.HTTP_201_CREATED)
async def create_pack(
    data: PackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new pack. Any authenticated user can create a pack.
    In future you can restrict this to admins by checking current_user.role.
    """
    pack = Pack(
        title=data.title,
        description=data.description,
        category=data.category,
        mode=data.mode,
        is_free=data.is_free,
        cover_emoji=data.cover_emoji,
        created_by=current_user.id,
    )
    db.add(pack)
    await db.commit()
    await db.refresh(pack)
    return await _build_pack_response(pack, current_user.id, db)


@router.post("/{pack_id}/prompts", response_model=PackPromptResponse, status_code=status.HTTP_201_CREATED)
async def add_prompt_to_pack(
    pack_id: str,
    data: PackPromptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a prompt to a pack. Only the pack creator can add prompts."""
    pack = await _get_pack_or_404(pack_id, db)
    if str(pack.created_by) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the pack creator can add prompts")

    prompt = PackPrompt(
        pack_id=pack_id,
        title=data.title,
        description=data.description,
        content=data.content,
        category=data.category,
        sort_order=data.sort_order,
    )
    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)
    return PackPromptResponse(
        id=str(prompt.id),
        title=prompt.title,
        description=prompt.description,
        content=prompt.content,
        category=prompt.category,
        sort_order=prompt.sort_order,
    )


@router.delete("/{pack_id}/prompts/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_prompt_from_pack(
    pack_id: str,
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a prompt from a pack. Only the pack creator can remove prompts."""
    pack = await _get_pack_or_404(pack_id, db)
    if str(pack.created_by) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the pack creator can remove prompts")

    await db.execute(
        delete(PackPrompt).where(
            PackPrompt.id == prompt_id,
            PackPrompt.pack_id == pack_id,
        )
    )
    await db.commit()