
import secrets
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class WorkspaceCreate(BaseModel):
    name: str


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    owner_id: str
    plan: str
    invite_code: Optional[str]
    created_at: str
    member_count: int
    role: str  # current user's role in this workspace


class MemberResponse(BaseModel):
    user_id: str
    email: str
    role: str
    joined_at: str


class UpdateMemberRole(BaseModel):
    role: str  # "admin" | "member"


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _get_workspace_or_404(workspace_id: str, db: AsyncSession) -> Workspace:
    result = await db.execute(
        select(Workspace).where(Workspace.id == workspace_id)
    )
    ws = result.scalar_one_or_none()
    if ws is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return ws


async def _get_member_or_403(workspace_id: str, user_id, db: AsyncSession) -> WorkspaceMember:
    result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if member is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")
    return member


async def _require_admin(workspace_id: str, user_id, db: AsyncSession) -> WorkspaceMember:
    member = await _get_member_or_403(workspace_id, user_id, db)
    if member.role not in ("owner", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return member


async def _build_response(ws: Workspace, role: str, db: AsyncSession) -> WorkspaceResponse:
    count_result = await db.execute(
        select(WorkspaceMember).where(WorkspaceMember.workspace_id == ws.id)
    )
    members = count_result.scalars().all()
    return WorkspaceResponse(
        id=str(ws.id),
        name=ws.name,
        owner_id=str(ws.owner_id),
        plan=ws.plan,
        invite_code=ws.invite_code,
        created_at=ws.created_at.isoformat(),
        member_count=len(members),
        role=role,
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    data: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new workspace. The creator becomes the owner."""
    ws = Workspace(
        name=data.name,
        owner_id=current_user.id,
        invite_code=secrets.token_urlsafe(12),
    )
    db.add(ws)
    await db.flush()  # get ws.id before adding member

    # Add creator as owner member
    db.add(WorkspaceMember(
        workspace_id=ws.id,
        user_id=current_user.id,
        role="owner",
    ))
    await db.commit()
    await db.refresh(ws)
    return await _build_response(ws, "owner", db)


@router.get("/me", response_model=list[WorkspaceResponse])
async def list_my_workspaces(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all workspaces the current user belongs to."""
    result = await db.execute(
        select(WorkspaceMember).where(WorkspaceMember.user_id == current_user.id)
    )
    memberships = result.scalars().all()

    workspaces = []
    for m in memberships:
        ws_result = await db.execute(
            select(Workspace).where(Workspace.id == m.workspace_id)
        )
        ws = ws_result.scalar_one_or_none()
        if ws:
            workspaces.append(await _build_response(ws, m.role, db))
    return workspaces


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ws = await _get_workspace_or_404(workspace_id, db)
    member = await _get_member_or_403(workspace_id, current_user.id, db)
    return await _build_response(ws, member.role, db)


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    data: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rename a workspace. Admin or owner only."""
    ws = await _get_workspace_or_404(workspace_id, db)
    await _require_admin(workspace_id, current_user.id, db)
    ws.name = data.name
    await db.commit()
    await db.refresh(ws)
    member = await _get_member_or_403(workspace_id, current_user.id, db)
    return await _build_response(ws, member.role, db)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a workspace. Owner only."""
    ws = await _get_workspace_or_404(workspace_id, db)
    if str(ws.owner_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the owner can delete this workspace")
    await db.delete(ws)
    await db.commit()


# ── Members ────────────────────────────────────────────────────────────────────

@router.get("/{workspace_id}/members", response_model=list[MemberResponse])
async def list_members(
    workspace_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_member_or_403(workspace_id, current_user.id, db)
    result = await db.execute(
        select(WorkspaceMember).where(WorkspaceMember.workspace_id == workspace_id)
    )
    members = result.scalars().all()

    out = []
    for m in members:
        user_result = await db.execute(select(User).where(User.id == m.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            out.append(MemberResponse(
                user_id=str(m.user_id),
                email=user.email,
                role=m.role,
                joined_at=m.joined_at.isoformat(),
            ))
    return out


@router.post("/{workspace_id}/invite", response_model=WorkspaceResponse)
async def regenerate_invite(
    workspace_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Regenerate the shareable invite code. Admin or owner only."""
    ws = await _get_workspace_or_404(workspace_id, db)
    await _require_admin(workspace_id, current_user.id, db)
    ws.invite_code = secrets.token_urlsafe(12)
    await db.commit()
    await db.refresh(ws)
    member = await _get_member_or_403(workspace_id, current_user.id, db)
    return await _build_response(ws, member.role, db)


@router.post("/join/{invite_code}", response_model=WorkspaceResponse)
async def join_by_invite(
    invite_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Join a workspace using a shareable invite code."""
    result = await db.execute(
        select(Workspace).where(Workspace.invite_code == invite_code)
    )
    ws = result.scalar_one_or_none()
    if ws is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid invite code")

    # Check if already a member
    existing = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == ws.id,
            WorkspaceMember.user_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already a member")

    db.add(WorkspaceMember(
        workspace_id=ws.id,
        user_id=current_user.id,
        role="member",
    ))
    await db.commit()
    return await _build_response(ws, "member", db)


@router.patch("/{workspace_id}/members/{user_id}", response_model=MemberResponse)
async def update_member_role(
    workspace_id: str,
    user_id: str,
    data: UpdateMemberRole,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change a member's role. Owner only."""
    ws = await _get_workspace_or_404(workspace_id, db)
    if str(ws.owner_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the owner can change roles")
    if data.role not in ("admin", "member"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be 'admin' or 'member'")
    if user_id == str(current_user.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change your own role")

    result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    member.role = data.role
    await db.commit()
    await db.refresh(member)

    user_result = await db.execute(select(User).where(User.id == member.user_id))
    user = user_result.scalar_one()
    return MemberResponse(
        user_id=str(member.user_id),
        email=user.email,
        role=member.role,
        joined_at=member.joined_at.isoformat(),
    )


@router.delete("/{workspace_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    workspace_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a member. Admins can remove members; owner can remove anyone."""
    ws = await _get_workspace_or_404(workspace_id, db)

    # Can't remove the owner
    if user_id == str(ws.owner_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove the workspace owner")

    # Must be admin/owner to remove others, but any member can remove themselves
    if user_id != str(current_user.id):
        await _require_admin(workspace_id, current_user.id, db)

    await db.execute(
        delete(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
    )
    await db.commit()