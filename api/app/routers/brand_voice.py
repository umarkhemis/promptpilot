
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.brand_voice import BrandVoiceProfile
from app.schemas.brand_voice import BrandVoiceCreate, BrandVoiceUpdate, BrandVoiceResponse

router = APIRouter(prefix="/brand-voice", tags=["brand-voice"])

MAX_PROFILES = 10  # prevent abuse


@router.get("/", response_model=list[BrandVoiceResponse])
async def list_profiles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BrandVoiceProfile)
        .where(BrandVoiceProfile.user_id == current_user.id)
        .order_by(BrandVoiceProfile.is_default.desc(), BrandVoiceProfile.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=BrandVoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    data: BrandVoiceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Enforce limit
    count_result = await db.execute(
        select(BrandVoiceProfile).where(BrandVoiceProfile.user_id == current_user.id)
    )
    if len(count_result.scalars().all()) >= MAX_PROFILES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum of {MAX_PROFILES} brand voice profiles allowed.",
        )

    # If this is set as default, unset all others first
    if data.is_default:
        await db.execute(
            update(BrandVoiceProfile)
            .where(BrandVoiceProfile.user_id == current_user.id)
            .values(is_default=False)
        )

    profile = BrandVoiceProfile(
        user_id=current_user.id,
        name=data.name,
        description=data.description,
        content=data.content,
        mode=data.mode,
        is_default=data.is_default,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/{profile_id}", response_model=BrandVoiceResponse)
async def get_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BrandVoiceProfile).where(
            BrandVoiceProfile.id == profile_id,
            BrandVoiceProfile.user_id == current_user.id,
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/{profile_id}", response_model=BrandVoiceResponse)
async def update_profile(
    profile_id: str,
    data: BrandVoiceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BrandVoiceProfile).where(
            BrandVoiceProfile.id == profile_id,
            BrandVoiceProfile.user_id == current_user.id,
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # If setting as default, unset all others first
    if data.is_default:
        await db.execute(
            update(BrandVoiceProfile)
            .where(BrandVoiceProfile.user_id == current_user.id)
            .values(is_default=False)
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BrandVoiceProfile).where(
            BrandVoiceProfile.id == profile_id,
            BrandVoiceProfile.user_id == current_user.id,
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    await db.delete(profile)
    await db.commit()


@router.post("/{profile_id}/set-default", response_model=BrandVoiceResponse)
async def set_default(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Unset all
    await db.execute(
        update(BrandVoiceProfile)
        .where(BrandVoiceProfile.user_id == current_user.id)
        .values(is_default=False)
    )
    # Set this one
    result = await db.execute(
        select(BrandVoiceProfile).where(
            BrandVoiceProfile.id == profile_id,
            BrandVoiceProfile.user_id == current_user.id,
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.is_default = True
    await db.commit()
    await db.refresh(profile)
    return profile