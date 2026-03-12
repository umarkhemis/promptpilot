import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.dependencies import get_db
from app.models.user import Base
from app.models.prompt import Prompt  # noqa: F401
from app.models.template import Template  # noqa: F401
from app.services.llm_client import LLMClient

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


class MockLLMClient:
    async def complete(self, model: str, messages: list, max_tokens: int = 1000) -> str:
        last_msg = messages[-1]["content"] if messages else ""
        system_msg = messages[0]["content"] if messages else ""

        if "Classify the intent" in system_msg:
            return "writing"
        if "clarifying questions" in system_msg.lower():
            return "[]"
        return "This is an improved version of your prompt with more context and clarity."

    async def stream(self, model: str, messages: list, max_tokens: int = 1000):
        chunks = ["This ", "is ", "streamed ", "output."]
        for chunk in chunks:
            yield chunk

    async def close(self):
        pass


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture(scope="session")
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture(scope="session")
async def client(setup_db):
    app.dependency_overrides[get_db] = override_get_db
    app.state.llm_client = MockLLMClient()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="session")
async def test_user(client):
    import uuid as _uuid
    email = f"testuser_{_uuid.uuid4().hex[:8]}@example.com"
    response = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "testpassword123"},
    )
    assert response.status_code == 201
    return {"email": email, "password": "testpassword123"}


@pytest_asyncio.fixture(scope="session")
async def auth_headers(client, test_user):
    response = await client.post(
        "/api/auth/login",
        json={"email": test_user["email"], "password": test_user["password"]},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
