import asyncio
import json
from app.services.llm_client import LLMClient
from app.services.tool_router import recommend

INTENTS = ["writing", "research", "image", "coding", "study", "seo", "social_media", "email"]


def _build_system_prompt(intent: str, mode: str, context: str = None) -> str:
    base = f"You are an expert prompt engineer specializing in {intent} tasks."
    if mode == "marketing":
        base += " Focus on persuasive, brand-aware, conversion-optimized prompts."
    else:
        base += " Focus on clear, structured, academic prompts that aid learning."
    if context:
        base += f" Context: {context}"
    return base


async def classify_intent(raw_prompt: str, mode: str, llm: LLMClient) -> str:
    messages = [
        {
            "role": "system",
            "content": f"Classify the intent of the user prompt into exactly one of: {', '.join(INTENTS)}. Reply with only the intent word.",
        },
        {"role": "user", "content": raw_prompt},
    ]
    result = await llm.complete("gpt-4o-mini", messages, max_tokens=10)
    intent = result.strip().lower()
    return intent if intent in INTENTS else "writing"


async def get_clarifying_questions(raw_prompt: str, mode: str, llm: LLMClient) -> list[str]:
    messages = [
        {
            "role": "system",
            "content": "If the prompt is ambiguous, return 1-2 clarifying questions as a JSON array of strings. If clear, return an empty array []. Only respond with the JSON array.",
        },
        {"role": "user", "content": raw_prompt},
    ]
    result = await llm.complete("gpt-4o-mini", messages, max_tokens=100)
    try:
        questions = json.loads(result.strip())
        return questions if isinstance(questions, list) else []
    except Exception:
        return []


async def improve(raw_prompt: str, intent: str, mode: str, context: str, llm: LLMClient) -> str:
    system = _build_system_prompt(intent, mode, context)
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": f"Improve this prompt for better AI results:\n\n{raw_prompt}"},
    ]
    return await llm.complete("gpt-4o", messages, max_tokens=500)


async def improve_full(raw_prompt: str, mode: str, context: str, llm: LLMClient) -> dict:
    intent, questions = await asyncio.gather(
        classify_intent(raw_prompt, mode, llm),
        get_clarifying_questions(raw_prompt, mode, llm),
    )
    improved = await improve(raw_prompt, intent, mode, context, llm)
    tool = recommend(intent)
    return {
        "original": raw_prompt,
        "improved": improved,
        "intent": intent,
        "recommended_tool": tool.model_dump(),
        "clarifying_questions": questions,
    }


async def improve_stream(raw_prompt: str, mode: str, context: str, llm: LLMClient):
    intent = await classify_intent(raw_prompt, mode, llm)
    system = _build_system_prompt(intent, mode, context)
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": f"Improve this prompt for better AI results:\n\n{raw_prompt}"},
    ]
    async for chunk in llm.stream("gpt-4o", messages, max_tokens=500):
        yield chunk


async def format_for_tool(improved_prompt: str, tool: str, llm: LLMClient) -> str:
    messages = [
        {
            "role": "system",
            "content": f"Reformat this prompt to work best with {tool}. Keep the intent but adjust formatting conventions.",
        },
        {"role": "user", "content": improved_prompt},
    ]
    return await llm.complete("gpt-4o-mini", messages, max_tokens=500)
