from fastapi import APIRouter, Query
from app.schemas.tool import ToolRecommendation
from app.services.tool_router import recommend

router = APIRouter(prefix="/tools", tags=["tools"])


@router.get("/recommend", response_model=ToolRecommendation)
async def recommend_tool(intent: str = Query(..., description="Intent category for tool recommendation")):
    return recommend(intent)
