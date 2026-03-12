from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, prompts, tools, templates, history
from app.services.llm_client import LLMClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.llm_client = LLMClient()
    yield
    await app.state.llm_client.close()


app = FastAPI(title="PromptPilot API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(prompts.router, prefix="/api")
app.include_router(tools.router, prefix="/api")
app.include_router(templates.router, prefix="/api")
app.include_router(history.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
