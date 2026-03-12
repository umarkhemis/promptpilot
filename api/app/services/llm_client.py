import json
import httpx
from app.config import settings


class LLMClient:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=settings.LLM_BASE_URL,
            headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
            timeout=60.0,
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        )

    async def complete(self, model: str, messages: list, max_tokens: int = 1000) -> str:
        response = await self.client.post(
            "/chat/completions",
            json={"model": model, "messages": messages, "max_tokens": max_tokens},
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    async def stream(self, model: str, messages: list, max_tokens: int = 1000):
        async with self.client.stream(
            "POST",
            "/chat/completions",
            json={"model": model, "messages": messages, "max_tokens": max_tokens, "stream": True},
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    data = json.loads(line[6:])
                    delta = data["choices"][0]["delta"].get("content", "")
                    if delta:
                        yield delta

    async def close(self):
        await self.client.aclose()
