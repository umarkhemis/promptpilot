
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user, get_llm_client
from app.models.user import User
from app.models.prompt import Prompt
from app.models.brand_voice import BrandVoiceProfile
from app.schemas.prompt import PromptRequest, PromptResponse
from app.services import prompt_engine
from app.services.streaming import format_sse, format_sse_done, format_sse_error
from app.services.llm_client import LLMClient
from app.utils.rate_limiter import rate_limiter

router = APIRouter(prefix="/prompts", tags=["prompts"])


async def _resolve_brand_voice(user_id, brand_voice_id, db: AsyncSession) -> str | None:
    """Return brand voice content for a given profile id, or the user's default."""
    if brand_voice_id:
        result = await db.execute(
            select(BrandVoiceProfile).where(
                BrandVoiceProfile.id == brand_voice_id,
                BrandVoiceProfile.user_id == user_id,
            )
        )
        profile = result.scalar_one_or_none()
        return profile.content if profile else None

    result = await db.execute(
        select(BrandVoiceProfile).where(
            BrandVoiceProfile.user_id == user_id,
            BrandVoiceProfile.is_default == True,
        )
    )
    profile = result.scalar_one_or_none()
    return profile.content if profile else None


@router.post("/improve", response_model=PromptResponse)
async def improve_prompt(
    data: PromptRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    llm: LLMClient = Depends(get_llm_client),
):
    rate_limiter.check(str(current_user.id))
    brand_voice = await _resolve_brand_voice(
        current_user.id, getattr(data, "brand_voice_id", None), db
    )
    result = await prompt_engine.improve_full(
        raw_prompt=data.raw_prompt, mode=data.mode,
        context=data.context, llm=llm, brand_voice=brand_voice,
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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    llm: LLMClient = Depends(get_llm_client),
):
    rate_limiter.check(str(current_user.id))
    brand_voice = await _resolve_brand_voice(
        current_user.id, getattr(data, "brand_voice_id", None), db
    )

    async def event_generator():
        full_output: list[str] = []
        try:
            # 1. Stream improved prompt tokens
            async for chunk in prompt_engine.improve_stream(
                raw_prompt=data.raw_prompt, mode=data.mode,
                context=data.context, llm=llm, brand_voice=brand_voice,
            ):
                full_output.append(chunk)
                yield format_sse(chunk)

            improved_text = "".join(full_output)

            # 2. Save to DB (non-critical)
            try:
                record = Prompt(
                    user_id=current_user.id,
                    raw_prompt=data.raw_prompt,
                    improved_prompt=improved_text,
                    mode=data.mode,
                )
                db.add(record)
                await db.commit()
            except Exception:
                pass

            # 3. Score and emit as separate SSE event (non-critical)
            try:
                scores = await prompt_engine.score_prompt(
                    raw_prompt=data.raw_prompt,
                    improved_prompt=improved_text,
                    llm=llm,
                )
                yield f"event: score\ndata: {json.dumps(scores)}\n\n"
            except Exception:
                pass

            yield format_sse_done()

        except Exception as exc:
            import traceback
            print("STREAM ERROR:", traceback.format_exc())
            yield format_sse_error(str(exc))

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
        },
    )












































# from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.responses import StreamingResponse
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select

# from app.dependencies import get_db, get_current_user, get_llm_client
# from app.models.user import User
# from app.models.prompt import Prompt
# from app.schemas.prompt import PromptRequest, PromptResponse
# from app.services import prompt_engine
# from app.services.streaming import format_sse, format_sse_done, format_sse_error
# from app.services.llm_client import LLMClient
# from app.utils.rate_limiter import rate_limiter

# router = APIRouter(prefix="/prompts", tags=["prompts"])


# @router.post("/improve", response_model=PromptResponse)
# async def improve_prompt(
#     data: PromptRequest,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(get_current_user),
#     llm: LLMClient = Depends(get_llm_client),
# ):
#     rate_limiter.check(str(current_user.id))

#     result = await prompt_engine.improve_full(
#         raw_prompt=data.raw_prompt,
#         mode=data.mode,
#         context=data.context,
#         llm=llm,
#     )

#     record = Prompt(
#         user_id=current_user.id,
#         raw_prompt=data.raw_prompt,
#         improved_prompt=result["improved"],
#         intent=result["intent"],
#         recommended_tool=result["recommended_tool"]["name"],
#     )
#     db.add(record)
#     await db.commit()

#     return PromptResponse(**result)


# @router.post("/improve/stream")
# async def improve_prompt_stream(
#     data: PromptRequest,
#     current_user: User = Depends(get_current_user),
#     llm: LLMClient = Depends(get_llm_client),
# ):
#     rate_limiter.check(str(current_user.id))

#     async def event_generator():
#         try:
#             async for chunk in prompt_engine.improve_stream(
#                 raw_prompt=data.raw_prompt,
#                 mode=data.mode,
#                 context=data.context,
#                 llm=llm,
#             ):
#                 yield format_sse(chunk)
#             yield format_sse_done()
#         except Exception as exc:
#             import traceback
#             print("STREAM ERROR:", traceback.format_exc())  # ← added
#             yield format_sse_error(str(exc))

#     return StreamingResponse(
#         event_generator(),
#         media_type="text/event-stream",
#         headers={
#             "Cache-Control": "no-cache",
#             "Connection": "keep-alive",
#             "X-Accel-Buffering": "no",
#             "Access-Control-Allow-Origin": "http://localhost:3000",
#             "Access-Control-Allow-Credentials": "true",
#         }
#     )

