import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_improve_prompt(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/prompts/improve",
        json={"raw_prompt": "write an essay about climate change", "mode": "student"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["original"] == "write an essay about climate change"
    assert "improved" in data
    assert data["improved"] != ""
    assert "intent" in data
    assert "recommended_tool" in data
    assert "name" in data["recommended_tool"]
    assert "clarifying_questions" in data
    assert isinstance(data["clarifying_questions"], list)


@pytest.mark.asyncio
async def test_improve_prompt_with_context(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/prompts/improve",
        json={
            "raw_prompt": "create a blog post about machine learning",
            "mode": "marketing",
            "context": "targeting developers, technical audience",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "improved" in data


@pytest.mark.asyncio
async def test_improve_prompt_unauthenticated(client: AsyncClient):
    response = await client.post(
        "/api/prompts/improve",
        json={"raw_prompt": "write something", "mode": "student"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_improve_prompt_missing_body(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/prompts/improve",
        json={},
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_improve_stream(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/prompts/improve/stream",
        json={"raw_prompt": "explain quantum computing", "mode": "student"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
    content = response.text
    assert "event:" in content or "data:" in content


@pytest.mark.asyncio
async def test_improve_stream_unauthenticated(client: AsyncClient):
    response = await client.post(
        "/api/prompts/improve/stream",
        json={"raw_prompt": "explain something", "mode": "student"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_history_after_improve(client: AsyncClient, auth_headers):
    """After improving a prompt, it should appear in history."""
    await client.post(
        "/api/prompts/improve",
        json={"raw_prompt": "test history entry prompt", "mode": "student"},
        headers=auth_headers,
    )
    response = await client.get("/api/history", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("test history entry prompt" in item["raw_prompt"] for item in data["items"])
