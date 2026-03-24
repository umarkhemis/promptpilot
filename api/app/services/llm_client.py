import json
import httpx
from app.config import settings
from app.services import prompt_engine
import asyncio



class LLMClient:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=settings.LLM_BASE_URL,
            headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
            timeout=60.0,
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        )

    

    async def complete(self, model: str, messages: list, max_tokens: int = 1000) -> str:
        for attempt in range(3):
            response = await self.client.post(
                "/chat/completions",
                json={"model": model, "messages": messages, "max_tokens": max_tokens},
            )
            if response.status_code == 429:
                wait = 2 ** attempt  # 1s, 2s, 4s
                print(f"Rate limited, retrying in {wait}s...")
                await asyncio.sleep(wait)
                continue
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        raise Exception("Rate limit exceeded after 3 retries")

    async def stream(self, model: str, messages: list, max_tokens: int = 1000):
        request = self.client.build_request(
            "POST",
            "/chat/completions",
            json={"model": model, "messages": messages, "max_tokens": max_tokens, "stream": True},
        )
        response = await self.client.send(request, stream=True)
        response.raise_for_status()
        try:
            async for line in response.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    try:
                        data = json.loads(line[6:])
                        delta = data["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield delta
                    except (json.JSONDecodeError, KeyError):
                        continue
        finally:
            await response.aclose()


