# PromptPilot API

FastAPI backend for the PromptPilot application — an AI-powered prompt improvement and tool recommendation service.

## Features

- **Prompt Improvement**: Sends prompts through an LLM pipeline to improve clarity and structure
- **Intent Classification**: Automatically detects prompt intent (writing, coding, research, etc.)
- **Tool Recommendations**: Recommends the best AI tool for each intent
- **Streaming**: Server-sent events (SSE) for real-time streamed responses
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Prompt History**: Persisted history per user with pagination
- **Templates**: Seeded library of reusable prompt templates
- **Token Counting**: tiktoken-based token usage tracking
- **Rate Limiting**: In-memory sliding window rate limiter (20 req/hour)

## Requirements

- Python 3.12+
- PostgreSQL (for production) or SQLite (for tests)
- An OpenAI-compatible LLM API key

## Setup

```bash
cd api

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, LLM_API_KEY, JWT_SECRET, etc.

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Running Tests

```bash
pytest tests/ -v
```

Tests use an in-memory SQLite database and a mock LLM client — no external services required.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Current user info |
| POST | `/api/prompts/improve` | Yes | Improve a prompt (full response) |
| POST | `/api/prompts/improve/stream` | Yes | Improve a prompt (SSE stream) |
| GET | `/api/tools/recommend?intent=` | No | Recommend AI tool by intent |
| GET | `/api/templates` | No | List templates (filter by mode, category) |
| GET | `/api/templates/{id}` | No | Get single template |
| GET | `/api/history` | Yes | List user's prompt history (paginated) |
| GET | `/api/history/{id}` | Yes | Get single history item |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://...` | Async SQLAlchemy database URL |
| `LLM_API_KEY` | `` | OpenAI (or compatible) API key |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | LLM API base URL |
| `JWT_SECRET` | `changeme-secret` | Secret for JWT signing |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `JWT_EXPIRATION_MINUTES` | `10080` (7 days) | JWT expiry duration |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin |

## Docker

```bash
docker build -t promptpilot-api .
docker run -p 8000:8000 --env-file .env promptpilot-api
```

## Project Structure

```
api/
├── app/
│   ├── main.py          # FastAPI app, middleware, lifespan
│   ├── config.py        # Pydantic settings
│   ├── dependencies.py  # DB session, auth, LLM client deps
│   ├── routers/         # Route handlers
│   ├── services/        # LLM client, prompt engine, tool router
│   ├── models/          # SQLAlchemy ORM models
│   ├── schemas/         # Pydantic request/response schemas
│   └── utils/           # Token counter, rate limiter
├── alembic/             # Database migration scripts
├── tests/               # Pytest test suite
├── .env.example
├── requirements.txt
└── Dockerfile
```
