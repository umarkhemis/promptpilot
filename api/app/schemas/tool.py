from pydantic import BaseModel


class ToolRecommendation(BaseModel):
    name: str
    url: str
    reason: str
    alternatives: list[str]
