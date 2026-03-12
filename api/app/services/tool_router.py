from app.schemas.tool import ToolRecommendation

TOOL_MAP = {
    "writing": ToolRecommendation(
        name="Claude",
        url="https://claude.ai",
        reason="Best for long-form writing and nuanced content",
        alternatives=["ChatGPT", "Jasper"],
    ),
    "research": ToolRecommendation(
        name="Perplexity",
        url="https://perplexity.ai",
        reason="Real-time web access for up-to-date research",
        alternatives=["Claude", "ChatGPT"],
    ),
    "image": ToolRecommendation(
        name="Midjourney",
        url="https://midjourney.com",
        reason="Best image quality and artistic control",
        alternatives=["DALL-E", "Stable Diffusion"],
    ),
    "coding": ToolRecommendation(
        name="GitHub Copilot",
        url="https://github.com/features/copilot",
        reason="Best in-context coding assistance",
        alternatives=["ChatGPT", "Claude"],
    ),
    "study": ToolRecommendation(
        name="NotebookLM",
        url="https://notebooklm.google.com",
        reason="Best for studying documents and generating summaries",
        alternatives=["ChatGPT", "Claude"],
    ),
    "seo": ToolRecommendation(
        name="ChatGPT",
        url="https://chat.openai.com",
        reason="Excellent for SEO content and keyword optimization",
        alternatives=["Claude", "Jasper"],
    ),
    "social_media": ToolRecommendation(
        name="ChatGPT",
        url="https://chat.openai.com",
        reason="Great for social media copy and engagement",
        alternatives=["Claude", "Copy.ai"],
    ),
    "email": ToolRecommendation(
        name="Claude",
        url="https://claude.ai",
        reason="Excellent for professional email writing",
        alternatives=["ChatGPT", "Copy.ai"],
    ),
}


def recommend(intent: str) -> ToolRecommendation:
    return TOOL_MAP.get(intent, TOOL_MAP["writing"])
