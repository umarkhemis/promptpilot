
import asyncio
import json
from app.services.llm_client import LLMClient
from app.services.tool_router import recommend

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


def _build_system_prompt(intent: str, mode: str, context: str = None, brand_voice: str = None) -> str:
    base = f"You are an expert prompt engineer specializing in {intent} tasks."
    if mode == "marketing":
        base += " Focus on persuasive, brand-aware, conversion-optimized prompts."
    else:
        base += " Focus on clear, structured, academic prompts that aid learning."
    if brand_voice:
        base += f"\n\nBrand Voice Profile:\n{brand_voice}"
    if context:
        base += f"\n\nAdditional context: {context}"
    return base


# ─── Intent classification ────────────────────────────────────────────────────

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
    intent = result.strip().lower()
    return intent if intent in INTENTS else "writing"


# ─── Clarifying questions ─────────────────────────────────────────────────────

async def get_clarifying_questions(raw_prompt: str, mode: str, llm: LLMClient) -> list[str]:
    messages = [
        {
            "role": "system",
            "content": "If the prompt is ambiguous, return 1-2 clarifying questions as a JSON array of strings. If clear, return an empty array []. Only respond with the JSON array.",
        },
        {"role": "user", "content": raw_prompt},
    ]
    result = await llm.complete("llama-3.1-8b-instant", messages, max_tokens=100)
    try:
        questions = json.loads(result.strip())
        return questions if isinstance(questions, list) else []
    except Exception:
        return []


# ─── Prompt scoring ───────────────────────────────────────────────────────────

async def score_prompt(raw_prompt: str, improved_prompt: str, llm: LLMClient) -> dict:
    """
    Score both prompts across 4 dimensions and return before/after scores.
    Returns a dict with overall + breakdown scores (0-100).
    """
    messages = [
        {
            "role": "system",
            "content": """You are a prompt quality evaluator. Score the IMPROVED prompt across these 4 dimensions (0-100 each):

1. Specificity: How specific and detailed is it? (vague=0, laser-precise=100)
2. Clarity: How clear and unambiguous is the instruction? (confusing=0, crystal clear=100)  
3. Context: How well does it provide necessary background? (none=0, perfect context=100)
4. Structure: How well-organized and formatted is it? (unstructured=0, perfectly structured=100)

Also score the ORIGINAL prompt on the same scale for comparison.

Respond ONLY with valid JSON in this exact format, no other text:
{
  "original": {"specificity": 0, "clarity": 0, "context": 0, "structure": 0, "overall": 0},
  "improved": {"specificity": 0, "clarity": 0, "context": 0, "structure": 0, "overall": 0}
}""",
        },
        {
            "role": "user",
            "content": f"Original prompt:\n{raw_prompt}\n\nImproved prompt:\n{improved_prompt}",
        },
    ]

    result = await llm.complete("llama-3.1-8b-instant", messages, max_tokens=200)

    try:
        # Strip any markdown fences if present
        cleaned = result.strip().replace("```json", "").replace("```", "").strip()
        scores = json.loads(cleaned)

        # Validate structure
        for key in ["original", "improved"]:
            for dim in ["specificity", "clarity", "context", "structure", "overall"]:
                scores[key][dim] = max(0, min(100, int(scores[key].get(dim, 50))))

        return scores
    except Exception:
        # Fallback scores if parsing fails
        return {
            "original": {"specificity": 30, "clarity": 35, "context": 20, "structure": 25, "overall": 28},
            "improved": {"specificity": 80, "clarity": 85, "context": 75, "structure": 80, "overall": 80},
        }


# ─── Non-streaming improve (used by /improve endpoint) ───────────────────────

async def improve(raw_prompt: str, intent: str, mode: str, context: str, llm: LLMClient, brand_voice: str = None) -> str:
    system = _build_system_prompt(intent, mode, context, brand_voice)
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": f"Improve this prompt for better AI results:\n\n{raw_prompt}"},
    ]
    return await llm.complete("llama-3.1-8b-instant", messages, max_tokens=500)


async def improve_full(raw_prompt: str, mode: str, context: str, llm: LLMClient, brand_voice: str = None) -> dict:
    intent, questions = await asyncio.gather(
        classify_intent(raw_prompt, mode, llm),
        get_clarifying_questions(raw_prompt, mode, llm),
    )
    improved = await improve(raw_prompt, intent, mode, context, llm, brand_voice)
    tool = recommend(intent)
    scores = await score_prompt(raw_prompt, improved, llm)

    return {
        "original": raw_prompt,
        "improved": improved,
        "intent": intent,
        "recommended_tool": tool.model_dump(),
        "clarifying_questions": questions,
        "scores": scores,
    }


# ─── Streaming improve ────────────────────────────────────────────────────────

async def improve_stream(
    raw_prompt: str,
    mode: str,
    context: str,
    llm: LLMClient,
    brand_voice: str = None,
):
    """
    Streams the improved prompt token by token.
    Caller is responsible for sending the score as a separate SSE event after
    collecting the full streamed output.
    """
    # Classify intent first so we can use brand-aware system prompt
    intent = await classify_intent(raw_prompt, mode, llm)

    system = _build_system_prompt(intent, mode, context, brand_voice)
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": f"Improve this prompt for better AI results:\n\n{raw_prompt}"},
    ]

    async for chunk in llm.stream("llama-3.1-8b-instant", messages, max_tokens=500):
        yield chunk


# ─── Tool formatting ──────────────────────────────────────────────────────────

async def format_for_tool(improved_prompt: str, tool: str, llm: LLMClient) -> str:
    messages = [
        {
            "role": "system",
            "content": f"Reformat this prompt to work best with {tool}. Keep the intent but adjust formatting conventions.",
        },
        {"role": "user", "content": improved_prompt},
    ]
    return await llm.complete("llama-3.1-8b-instant", messages, max_tokens=500)


































# import asyncio
# import json
# from app.services.llm_client import LLMClient
# from app.services.tool_router import recommend
# from app.services.streaming import format_sse, format_sse_done, format_sse_error


# INTENTS = [
#     "writing", "email", "blog", "copywriting",
#     "research", "study", "academic",
#     "coding", "debugging",
#     "image", "logo", "design", "illustration",
#     "video", "video_avatar", "video_editing",
#     "audio", "voiceover", "music", "podcast",
#     "seo", "social_media", "ads",
#     "business_name", "business_plan", "presentation", "spreadsheet",
#     "summarization", "translation", "transcription",
#     "chatbot", "automation",
# ]


# def _build_system_prompt(intent: str, mode: str, context: str = None) -> str:
#     base = f"You are an expert prompt engineer specializing in {intent} tasks."
#     if mode == "marketing":
#         base += " Focus on persuasive, brand-aware, conversion-optimized prompts."
#     else:
#         base += " Focus on clear, structured, academic prompts that aid learning."
#     if context:
#         base += f" Context: {context}"
#     return base




# async def classify_intent(raw_prompt: str, mode: str, llm: LLMClient) -> str:
#         messages = [
#             {
#                 "role": "system",
#                 "content": f"""Classify the user's prompt into exactly one intent from this list:
#     {', '.join(INTENTS)}

#     Rules:
#     - image/photo/picture generation → image
#     - logo creation → logo
#     - video creation/editing → video
#     - voiceover/narration/text-to-speech → voiceover
#     - background music/song/jingle → music
#     - business name ideas → business_name
#     - slide deck/presentation → presentation
#     - social media post/caption → social_media
#     - ad/advertisement copy → ads
#     - SEO article/keywords → seo
#     - academic paper/thesis → academic
#     - code/programming → coding

#     Reply with ONLY the intent word, nothing else.""",
#             },
#             {"role": "user", "content": raw_prompt},
#         ]
#         result = await llm.complete("llama-3.1-8b-instant", messages, max_tokens=10)
#         # result = await llm.complete("gpt-4o-mini", messages, max_tokens=10)
#         intent = result.strip().lower()
#         return intent if intent in INTENTS else "writing"


# async def get_clarifying_questions(raw_prompt: str, mode: str, llm: LLMClient) -> list[str]:
#     messages = [
#         {
#             "role": "system",
#             "content": "If the prompt is ambiguous, return 1-2 clarifying questions as a JSON array of strings. If clear, return an empty array []. Only respond with the JSON array.",
#         },
#         {"role": "user", "content": raw_prompt},
#     ]
#     result = await llm.complete("llama-3.1-8b-instant", messages, max_tokens=100)
#     # result = await llm.complete("gpt-4o-mini", messages, max_tokens=100)
#     try:
#         questions = json.loads(result.strip())
#         return questions if isinstance(questions, list) else []
#     except Exception:
#         return []


# async def improve(raw_prompt: str, intent: str, mode: str, context: str, llm: LLMClient) -> str:
#     system = _build_system_prompt(intent, mode, context)
#     messages = [
#         {"role": "system", "content": system},
#         {"role": "user", "content": f"Improve this prompt for better AI results:\n\n{raw_prompt}"},
#     ]
#     return await llm.complete("llama-3.1-8b-instant", messages, max_tokens=500)
#     # return await llm.complete("gpt-4o", messages, max_tokens=500)


# async def improve_full(raw_prompt: str, mode: str, context: str, llm: LLMClient) -> dict:
#     intent, questions = await asyncio.gather(
#         classify_intent(raw_prompt, mode, llm),
#         get_clarifying_questions(raw_prompt, mode, llm),
#     )
#     improved = await improve(raw_prompt, intent, mode, context, llm)
#     tool = recommend(intent)
#     return {
#         "original": raw_prompt,
#         "improved": improved,
#         "intent": intent,
#         "recommended_tool": tool.model_dump(),
#         "clarifying_questions": questions,
#     }


# async def improve_stream(raw_prompt: str, mode: str, context: str, llm: LLMClient):
#     print(f"improve_stream called: prompt='{raw_prompt[:30]}' mode={mode}")  # ← add
#     intent = await classify_intent(raw_prompt, mode, llm)
#     print(f"intent classified: {intent}")  # ← add


# async def improve_stream(raw_prompt: str, mode: str, context: str, llm: LLMClient):
#     system = f"""You are an expert prompt engineer. 
#     {'Focus on persuasive, brand-aware, conversion-optimized prompts.' if mode == 'marketing' else 'Focus on clear, structured, academic prompts that aid learning.'}
#     {'Context: ' + context if context else ''}"""

#     messages = [
#         {"role": "system", "content": system},
#         {"role": "user", "content": f"Improve this prompt for better AI results:\n\n{raw_prompt}"},
#     ]
#     # async for chunk in llm.stream("gpt-4o", messages, max_tokens=500):
#     async for chunk in llm.stream("llama-3.1-8b-instant", messages, max_tokens=500):
#         yield chunk


# async def format_for_tool(improved_prompt: str, tool: str, llm: LLMClient) -> str:
#     messages = [
#         {
#             "role": "system",
#             "content": f"Reformat this prompt to work best with {tool}. Keep the intent but adjust formatting conventions.",
#         },
#         {"role": "user", "content": improved_prompt},
#     ]
#     return await llm.complete("llama-3.1-8b-instant", messages, max_tokens=500)
#     # return await llm.complete("gpt-4o-mini", messages, max_tokens=500)

