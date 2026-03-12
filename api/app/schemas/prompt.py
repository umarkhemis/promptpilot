from typing import Optional
from pydantic import BaseModel


class PromptRequest(BaseModel):
    raw_prompt: str
    mode: str = "student"
    context: Optional[str] = None


class PromptResponse(BaseModel):
    original: str
    improved: str
    intent: str
    recommended_tool: dict
    clarifying_questions: list[str]
