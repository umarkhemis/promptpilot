import asyncio
import json
from app.services.llm_client import LLMClient
from app.services.tool_router import recommend
from app.services.streaming import format_sse, format_sse_done, format_sse_error


INTENTS = [
    "writing", "email", "blog", "copywriting",
    "research", "study", "academic",
    "coding", "debugging",
    "image", "logo", "design", "illustration",
    "video", "video_avatar", "video_editing",
    "audio", "voiceover", "music", "podcast",
    "seo", "social_media", "ads",
    "business_name", "business_plan", "presentation", "spreadsheet",
    "summarization", "translation", "transcription",
    "chatbot", "automation",
]


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
                "content": f"""Classify the user's prompt into exactly one intent from this list:
    {', '.join(INTENTS)}

    Rules:
    - image/photo/picture generation → image
    - logo creation → logo
    - video creation/editing → video
    - voiceover/narration/text-to-speech → voiceover
    - background music/song/jingle → music
    - business name ideas → business_name
    - slide deck/presentation → presentation
    - social media post/caption → social_media
    - ad/advertisement copy → ads
    - SEO article/keywords → seo
    - academic paper/thesis → academic
    - code/programming → coding

    Reply with ONLY the intent word, nothing else.""",
            },
            {"role": "user", "content": raw_prompt},
        ]
        result = await llm.complete("llama-3.1-8b-instant", messages, max_tokens=10)
        # result = await llm.complete("gpt-4o-mini", messages, max_tokens=10)
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
    result = await llm.complete("llama-3.1-8b-instant", messages, max_tokens=100)
    # result = await llm.complete("gpt-4o-mini", messages, max_tokens=100)
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
    return await llm.complete("llama-3.1-8b-instant", messages, max_tokens=500)
    # return await llm.complete("gpt-4o", messages, max_tokens=500)


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
    print(f"improve_stream called: prompt='{raw_prompt[:30]}' mode={mode}")  # ← add
    intent = await classify_intent(raw_prompt, mode, llm)
    print(f"intent classified: {intent}")  # ← add


async def improve_stream(raw_prompt: str, mode: str, context: str, llm: LLMClient):
    system = f"""You are an expert prompt engineer. 
    {'Focus on persuasive, brand-aware, conversion-optimized prompts.' if mode == 'marketing' else 'Focus on clear, structured, academic prompts that aid learning.'}
    {'Context: ' + context if context else ''}"""

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": f"Improve this prompt for better AI results:\n\n{raw_prompt}"},
    ]
    # async for chunk in llm.stream("gpt-4o", messages, max_tokens=500):
    async for chunk in llm.stream("llama-3.1-8b-instant", messages, max_tokens=500):
        yield chunk


async def format_for_tool(improved_prompt: str, tool: str, llm: LLMClient) -> str:
    messages = [
        {
            "role": "system",
            "content": f"Reformat this prompt to work best with {tool}. Keep the intent but adjust formatting conventions.",
        },
        {"role": "user", "content": improved_prompt},
    ]
    return await llm.complete("llama-3.1-8b-instant", messages, max_tokens=500)
    # return await llm.complete("gpt-4o-mini", messages, max_tokens=500)

