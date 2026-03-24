from fastapi import APIRouter, Query
from app.schemas.tool import ToolRecommendation
from app.services.tool_router import recommend
from app.services.llm_client import LLMClient
from fastapi import APIRouter, Query, Depends
from app.dependencies import get_llm_client

router = APIRouter(prefix="/tools", tags=["tools"])


@router.get("/recommend", response_model=ToolRecommendation)
async def recommend_tool(
    intent: str = Query(..., description="Raw prompt or intent category"),
    llm: LLMClient = Depends(get_llm_client),
):
    from app.services.prompt_engine import classify_intent
    classified = await classify_intent(intent, mode="marketing", llm=llm)
    return recommend(classified)