from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user, get_llm_client
from app.models.user import User
from app.models.prompt import Prompt
from app.schemas.prompt import PromptRequest, PromptResponse
from app.services import prompt_engine
from app.services.streaming import format_sse, format_sse_done, format_sse_error
from app.services.llm_client import LLMClient
from app.utils.rate_limiter import rate_limiter

router = APIRouter(prefix="/prompts", tags=["prompts"])


@router.post("/improve", response_model=PromptResponse)
async def improve_prompt(
    data: PromptRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    llm: LLMClient = Depends(get_llm_client),
):
    rate_limiter.check(str(current_user.id))

    result = await prompt_engine.improve_full(
        raw_prompt=data.raw_prompt,
        mode=data.mode,
        context=data.context,
        llm=llm,
    )

    record = Prompt(
        user_id=current_user.id,
        raw_prompt=data.raw_prompt,
        improved_prompt=result["improved"],
        intent=result["intent"],
        recommended_tool=result["recommended_tool"]["name"],
    )
    db.add(record)
    await db.commit()

    return PromptResponse(**result)


@router.post("/improve/stream")
async def improve_prompt_stream(
    data: PromptRequest,
    current_user: User = Depends(get_current_user),
    llm: LLMClient = Depends(get_llm_client),
):
    rate_limiter.check(str(current_user.id))

    async def event_generator():
        try:
            async for chunk in prompt_engine.improve_stream(
                raw_prompt=data.raw_prompt,
                mode=data.mode,
                context=data.context,
                llm=llm,
            ):
                yield format_sse(chunk)
            yield format_sse_done()
        except Exception as exc:
            yield format_sse_error(str(exc))

    return StreamingResponse(event_generator(), media_type="text/event-stream")
