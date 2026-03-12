import pytest
from httpx import AsyncClient
from app.services.tool_router import recommend, TOOL_MAP


@pytest.mark.asyncio
async def test_recommend_writing(client: AsyncClient):
    response = await client.get("/api/tools/recommend?intent=writing")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Claude"
    assert "url" in data
    assert "reason" in data
    assert isinstance(data["alternatives"], list)


@pytest.mark.asyncio
async def test_recommend_research(client: AsyncClient):
    response = await client.get("/api/tools/recommend?intent=research")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Perplexity"


@pytest.mark.asyncio
async def test_recommend_coding(client: AsyncClient):
    response = await client.get("/api/tools/recommend?intent=coding")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "GitHub Copilot"


@pytest.mark.asyncio
async def test_recommend_image(client: AsyncClient):
    response = await client.get("/api/tools/recommend?intent=image")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Midjourney"


@pytest.mark.asyncio
async def test_recommend_study(client: AsyncClient):
    response = await client.get("/api/tools/recommend?intent=study")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "NotebookLM"


@pytest.mark.asyncio
async def test_recommend_seo(client: AsyncClient):
    response = await client.get("/api/tools/recommend?intent=seo")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ChatGPT"


@pytest.mark.asyncio
async def test_recommend_social_media(client: AsyncClient):
    response = await client.get("/api/tools/recommend?intent=social_media")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ChatGPT"


@pytest.mark.asyncio
async def test_recommend_email(client: AsyncClient):
    response = await client.get("/api/tools/recommend?intent=email")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Claude"


@pytest.mark.asyncio
async def test_recommend_unknown_intent_fallback(client: AsyncClient):
    # Unknown intent should fall back to writing (Claude)
    response = await client.get("/api/tools/recommend?intent=unknown_intent")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Claude"


@pytest.mark.asyncio
async def test_recommend_missing_intent(client: AsyncClient):
    response = await client.get("/api/tools/recommend")
    assert response.status_code == 422


def test_tool_router_recommend_all_intents():
    """Unit test: recommend() returns a valid ToolRecommendation for all known intents."""
    for intent in TOOL_MAP:
        result = recommend(intent)
        assert result.name
        assert result.url.startswith("http")
        assert result.reason
        assert isinstance(result.alternatives, list)


def test_tool_router_recommend_unknown():
    result = recommend("does_not_exist")
    assert result.name == "Claude"
