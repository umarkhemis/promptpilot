
from app.schemas.tool import ToolRecommendation

# ─── Tool Registry ─────────────────────────────────────────────────────────────

TOOL_MAP: dict[str, ToolRecommendation] = {

    # ── Writing & Content ──────────────────────────────────────────────────────
    "writing": ToolRecommendation(
        name="Claude",
        url="https://claude.ai",
        reason="Best for long-form writing, nuanced tone, and structured content.",
        alternatives=["ChatGPT", "Jasper", "Copy.ai"],
    ),
    "copywriting": ToolRecommendation(
        name="Copy.ai",
        url="https://copy.ai",
        reason="Purpose-built for marketing copy, ads, and sales content.",
        alternatives=["Jasper", "ChatGPT", "Claude"],
    ),
    "email": ToolRecommendation(
        name="Claude",
        url="https://claude.ai",
        reason="Excellent for professional, persuasive, and context-aware email writing.",
        alternatives=["ChatGPT", "Lavender", "Copy.ai"],
    ),
    "blog": ToolRecommendation(
        name="Jasper",
        url="https://jasper.ai",
        reason="Built specifically for SEO-optimized blog content at scale.",
        alternatives=["Claude", "ChatGPT", "Copy.ai"],
    ),

    # ── Research & Knowledge ───────────────────────────────────────────────────
    "research": ToolRecommendation(
        name="Perplexity",
        url="https://perplexity.ai",
        reason="Real-time web search with cited sources - best for up-to-date research.",
        alternatives=["Claude", "ChatGPT", "Elicit"],
    ),
    "study": ToolRecommendation(
        name="NotebookLM",
        url="https://notebooklm.google.com",
        reason="Upload your documents and get AI-powered summaries, Q&A, and study guides.",
        alternatives=["Perplexity", "Claude", "ChatGPT"],
    ),
    "academic": ToolRecommendation(
        name="Elicit",
        url="https://elicit.com",
        reason="AI research assistant trained on academic papers - perfect for literature reviews.",
        alternatives=["Perplexity", "NotebookLM", "Claude"],
    ),

    # ── Coding & Development ───────────────────────────────────────────────────
    "coding": ToolRecommendation(
        name="GitHub Copilot",
        url="https://github.com/features/copilot",
        reason="Best in-editor AI coding assistant with deep code context awareness.",
        alternatives=["Cursor", "Claude", "ChatGPT"],
    ),
    "debugging": ToolRecommendation(
        name="Cursor",
        url="https://cursor.sh",
        reason="AI-native code editor that understands your entire codebase for debugging.",
        alternatives=["GitHub Copilot", "Claude", "ChatGPT"],
    ),

    # ── Image & Visual ─────────────────────────────────────────────────────────
    "image": ToolRecommendation(
        name="Midjourney",
        url="https://midjourney.com",
        reason="Industry-leading image quality with exceptional artistic control.",
        alternatives=["DALL-E 3", "Stable Diffusion", "Adobe Firefly"],
    ),
    "logo": ToolRecommendation(
        name="Looka",
        url="https://looka.com",
        reason="AI logo and brand identity designer - generates professional logos instantly.",
        alternatives=["Design.com", "Canva AI", "Midjourney"],
    ),
    "design": ToolRecommendation(
        name="Canva AI",
        url="https://canva.com",
        reason="AI-powered design platform for social graphics, presentations, and marketing assets.",
        alternatives=["Adobe Firefly", "Looka", "Midjourney"],
    ),
    "illustration": ToolRecommendation(
        name="Adobe Firefly",
        url="https://firefly.adobe.com",
        reason="Best for commercial-safe AI illustrations and design assets.",
        alternatives=["Midjourney", "DALL-E 3", "Canva AI"],
    ),

    # ── Video ──────────────────────────────────────────────────────────────────
    "video": ToolRecommendation(
        name="Fliki",
        url="https://fliki.ai",
        reason="Turn text and scripts into polished videos with AI voices and visuals.",
        alternatives=["Runway ML", "Synthesia", "HeyGen"],
    ),
    "video_avatar": ToolRecommendation(
        name="HeyGen",
        url="https://heygen.com",
        reason="Create AI avatar videos with realistic presenters - ideal for marketing and training.",
        alternatives=["Synthesia", "Fliki", "D-ID"],
    ),
    "video_editing": ToolRecommendation(
        name="Runway ML",
        url="https://runwayml.com",
        reason="Professional AI video editing, generation, and visual effects in one platform.",
        alternatives=["Fliki", "HeyGen", "Pika Labs"],
    ),

    # ── Audio & Voice ──────────────────────────────────────────────────────────
    "audio": ToolRecommendation(
        name="ElevenLabs",
        url="https://elevenlabs.io",
        reason="Most realistic AI voice generation - perfect for voiceovers, podcasts, and narration.",
        alternatives=["Murf AI", "Play.ht", "Fliki"],
    ),
    "voiceover": ToolRecommendation(
        name="ElevenLabs",
        url="https://elevenlabs.io",
        reason="Industry-best AI voice cloning and text-to-speech for professional voiceovers.",
        alternatives=["Murf AI", "Fliki", "Play.ht"],
    ),
    "music": ToolRecommendation(
        name="Suno",
        url="https://suno.com",
        reason="Generate full songs with vocals and instrumentation from a text prompt.",
        alternatives=["Udio", "Mubert", "Soundraw"],
    ),
    "podcast": ToolRecommendation(
        name="Murf AI",
        url="https://murf.ai",
        reason="Studio-quality AI voices with fine-tuned pacing - built for podcast production.",
        alternatives=["ElevenLabs", "Play.ht", "Descript"],
    ),

    # ── Marketing & SEO ────────────────────────────────────────────────────────
    "seo": ToolRecommendation(
        name="Surfer SEO",
        url="https://surferseo.com",
        reason="AI content editor that optimizes for search rankings with real SERP data.",
        alternatives=["ChatGPT", "Jasper", "Frase"],
    ),
    "social_media": ToolRecommendation(
        name="Predis.ai",
        url="https://predis.ai",
        reason="AI social media content creator - generates posts, carousels, and reels from text.",
        alternatives=["ChatGPT", "Buffer AI", "Copy.ai"],
    ),
    "ads": ToolRecommendation(
        name="AdCreative.ai",
        url="https://adcreative.ai",
        reason="Generates high-converting ad creatives and copy optimized for paid campaigns.",
        alternatives=["Copy.ai", "Jasper", "ChatGPT"],
    ),

    # ── Business & Strategy ────────────────────────────────────────────────────
    "business_name": ToolRecommendation(
        name="Namelix",
        url="https://namelix.com",
        reason="AI business name generator - creates brandable, domain-available name ideas.",
        alternatives=["Shopify Business Name Generator", "BrandBucket", "ChatGPT"],
    ),
    "business_plan": ToolRecommendation(
        name="ChatGPT",
        url="https://chat.openai.com",
        reason="Excellent for drafting structured business plans, executive summaries, and strategy docs.",
        alternatives=["Claude", "Notion AI", "Canva Docs"],
    ),
    "presentation": ToolRecommendation(
        name="Gamma",
        url="https://gamma.app",
        reason="AI presentation builder - turns text outlines into beautiful decks instantly.",
        alternatives=["Beautiful.ai", "Canva AI", "ChatGPT"],
    ),
    "spreadsheet": ToolRecommendation(
        name="Rows",
        url="https://rows.com",
        reason="AI-powered spreadsheets that write formulas and analyze data from natural language.",
        alternatives=["ChatGPT", "Notion AI", "Google Sheets + Gemini"],
    ),

    # ── Productivity & Summarization ───────────────────────────────────────────
    "summarization": ToolRecommendation(
        name="Claude",
        url="https://claude.ai",
        reason="Handles very long documents with high accuracy - best for summarizing PDFs and reports.",
        alternatives=["ChatGPT", "Perplexity", "NotebookLM"],
    ),
    "translation": ToolRecommendation(
        name="DeepL",
        url="https://deepl.com",
        reason="Most accurate AI translation - significantly outperforms Google Translate for nuance.",
        alternatives=["ChatGPT", "Claude", "Google Translate"],
    ),
    "transcription": ToolRecommendation(
        name="Whisper (OpenAI)",
        url="https://openai.com/research/whisper",
        reason="Industry-leading speech-to-text accuracy across 99 languages.",
        alternatives=["Otter.ai", "Descript", "Fireflies.ai"],
    ),

    # ── Chatbot & Automation ───────────────────────────────────────────────────
    "chatbot": ToolRecommendation(
        name="Gemini",
        url="https://gemini.google.com",
        reason="Google's multimodal AI - great for conversational tasks with Google Workspace integration.",
        alternatives=["ChatGPT", "Claude", "Copilot"],
    ),
    "automation": ToolRecommendation(
        name="Zapier AI",
        url="https://zapier.com/ai",
        reason="Automate workflows with AI - connects 6,000+ apps without writing code.",
        alternatives=["Make (Integromat)", "n8n", "ChatGPT"],
    ),
}


# ─── Intent → Tool key mapping ─────────────────────────────────────────────────
INTENT_ALIASES: dict[str, str] = {
    # writing cluster
    "writing":      "writing",
    "email":        "email",
    "blog":         "blog",
    "copywriting":  "copywriting",
    # research cluster
    "research":     "research",
    "study":        "study",
    "academic":     "academic",
    # coding cluster
    "coding":       "coding",
    "debugging":    "debugging",
    # image cluster
    "image":        "image",
    "logo":         "logo",
    "design":       "design",
    "illustration": "illustration",
    # video cluster
    "video":        "video",
    "video_avatar": "video_avatar",
    "video_editing":"video_editing",
    # audio cluster
    "audio":        "audio",
    "voiceover":    "voiceover",
    "music":        "music",
    "podcast":      "podcast",
    # marketing cluster
    "seo":          "seo",
    "social_media": "social_media",
    "ads":          "ads",
    # business cluster
    "business_name":"business_name",
    "business_plan":"business_plan",
    "presentation": "presentation",
    "spreadsheet":  "spreadsheet",
    # productivity cluster
    "summarization":"summarization",
    "translation":  "translation",
    "transcription":"transcription",
    # other
    "chatbot":      "chatbot",
    "automation":   "automation",
}


def recommend(intent: str) -> ToolRecommendation:
    key = INTENT_ALIASES.get(intent.lower().strip(), "writing")
    return TOOL_MAP.get(key, TOOL_MAP["writing"])




