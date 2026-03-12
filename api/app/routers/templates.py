import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.dependencies import get_db
from app.models.template import Template

router = APIRouter(prefix="/templates", tags=["templates"])

STARTER_TEMPLATES = [
    {
        "title": "Academic Essay Outline",
        "description": "Generate a structured outline for an academic essay on any topic.",
        "content": "Create a detailed academic essay outline for the topic: [TOPIC]. Include an introduction with thesis statement, 3-5 main body sections with supporting points, and a conclusion. Format as a hierarchical outline.",
        "category": "writing",
        "mode": "student",
    },
    {
        "title": "Research Literature Review",
        "description": "Summarize and synthesize academic sources on a research topic.",
        "content": "Conduct a literature review on [TOPIC]. Identify key themes, compare methodologies, highlight consensus and debates, and suggest gaps for future research. Use an academic tone.",
        "category": "research",
        "mode": "student",
    },
    {
        "title": "Math Problem Solver",
        "description": "Step-by-step solution walkthrough for math problems.",
        "content": "Solve the following math problem step by step, explaining each step clearly for a student learning the concept: [PROBLEM]. Show all working and explain the reasoning behind each step.",
        "category": "study",
        "mode": "student",
    },
    {
        "title": "Flashcard Generator",
        "description": "Convert study material into Q&A flashcard format.",
        "content": "Convert the following study material into 10-15 flashcard pairs (question and answer). Focus on key concepts, definitions, and important facts. Material: [CONTENT]",
        "category": "study",
        "mode": "student",
    },
    {
        "title": "Code Review Assistant",
        "description": "Analyze code for bugs, performance, and best practices.",
        "content": "Review the following [LANGUAGE] code for: 1) bugs or errors, 2) performance issues, 3) security vulnerabilities, 4) adherence to best practices and style guidelines. Provide specific suggestions for improvement.\n\n```\n[CODE]\n```",
        "category": "coding",
        "mode": "student",
    },
    {
        "title": "Product Launch Email",
        "description": "Compelling email campaign for a new product launch.",
        "content": "Write a compelling product launch email for [PRODUCT NAME]. Target audience: [AUDIENCE]. Key benefits: [BENEFITS]. Include a strong subject line, engaging opening, feature highlights, social proof placeholder, and a clear CTA. Tone: professional yet exciting.",
        "category": "email",
        "mode": "marketing",
    },
    {
        "title": "Social Media Content Calendar",
        "description": "Create a week of social media posts for a brand.",
        "content": "Create a 7-day social media content calendar for [BRAND/PRODUCT] targeting [AUDIENCE]. For each day provide: platform, post type, caption copy, hashtags, and optimal posting time. Mix educational, promotional, and engagement content.",
        "category": "social_media",
        "mode": "marketing",
    },
    {
        "title": "SEO Blog Post",
        "description": "Write an SEO-optimized blog post for organic traffic.",
        "content": "Write an SEO-optimized 1500-word blog post targeting the keyword '[KEYWORD]'. Include: H1 title, meta description (160 chars max), introduction with keyword, 3-4 H2 sections, internal/external link placeholders, and a conclusion with CTA. Tone: [TONE].",
        "category": "seo",
        "mode": "marketing",
    },
    {
        "title": "Ad Copy Variants",
        "description": "Generate multiple ad copy variations for A/B testing.",
        "content": "Write 5 variations of ad copy for [PRODUCT/SERVICE] targeting [AUDIENCE]. Each variant should test a different angle: 1) pain point, 2) benefit-led, 3) social proof, 4) urgency/scarcity, 5) curiosity. Include headline (30 chars), description (90 chars), and CTA.",
        "category": "writing",
        "mode": "marketing",
    },
    {
        "title": "Image Generation Prompt",
        "description": "Craft detailed prompts for AI image generators.",
        "content": "Create a detailed image generation prompt for [SUBJECT/SCENE]. Include: subject description, art style (e.g., photorealistic, oil painting), lighting conditions, color palette, camera angle/lens, mood/atmosphere, and any negative prompts to exclude. Optimize for Midjourney.",
        "category": "image",
        "mode": "student",
    },
    {
        "title": "Bug Report Template",
        "description": "Structure a clear bug report for developer handoff.",
        "content": "Write a detailed bug report for the following issue: [ISSUE DESCRIPTION]. Include: environment details, steps to reproduce, expected behavior, actual behavior, screenshots placeholder, severity level, and suggested fix if known.",
        "category": "coding",
        "mode": "marketing",
    },
    {
        "title": "Customer Persona Builder",
        "description": "Build a detailed customer persona for marketing strategy.",
        "content": "Create a detailed customer persona for [PRODUCT/SERVICE]. Include: demographic profile, psychographics, pain points and challenges, goals and motivations, preferred channels and content types, typical buyer journey, and key messaging angles.",
        "category": "research",
        "mode": "marketing",
    },
    {
        "title": "Concept Explainer",
        "description": "Explain complex topics using the Feynman technique.",
        "content": "Explain [CONCEPT] using the Feynman technique as if teaching a [GRADE LEVEL] student. Use simple language, real-world analogies, and concrete examples. Break down any technical jargon. End with a brief summary and 3 follow-up questions to check understanding.",
        "category": "study",
        "mode": "student",
    },
]


class TemplateResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    content: str
    category: str
    mode: str
    created_at: str

    model_config = {"from_attributes": True}


async def _seed_templates(db: AsyncSession):
    result = await db.execute(select(Template).limit(1))
    if result.scalar_one_or_none() is not None:
        return
    for t in STARTER_TEMPLATES:
        db.add(Template(**t))
    await db.commit()


@router.get("", response_model=list[TemplateResponse])
async def list_templates(
    mode: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    await _seed_templates(db)
    stmt = select(Template)
    if mode:
        stmt = stmt.where(Template.mode == mode)
    if category:
        stmt = stmt.where(Template.category == category)
    stmt = stmt.order_by(Template.created_at)
    result = await db.execute(stmt)
    templates = result.scalars().all()
    return [
        TemplateResponse(
            id=str(t.id),
            title=t.title,
            description=t.description,
            content=t.content,
            category=t.category,
            mode=t.mode,
            created_at=t.created_at.isoformat(),
        )
        for t in templates
    ]


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return TemplateResponse(
        id=str(template.id),
        title=template.title,
        description=template.description,
        content=template.content,
        category=template.category,
        mode=template.mode,
        created_at=template.created_at.isoformat(),
    )
