# PromptPilot

> **Stop guessing. Start prompting like a pro.**

PromptPilot is an AI-powered prompt improvement and tool recommendation platform targeting marketers and students. Write a messy idea, get back a polished prompt and the best AI tool for the job — in seconds.

---

## Architecture

```
promptpilot/
├── api/          # FastAPI backend (Python 3.12)
└── web/          # Next.js 14 frontend (TypeScript)
```

```
                 ┌─────────────────────┐
                 │   Next.js Frontend  │
                 │   (localhost:3000)  │
                 └────────┬────────────┘
                          │ REST + SSE
                 ┌────────▼────────────┐
                 │   FastAPI Backend   │
                 │   (localhost:8000)  │
                 └────────┬────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
    ┌──────▼──────┐ ┌─────▼─────┐ ┌────▼──────┐
    │ PostgreSQL  │ │ OpenAI    │ │ Redis     │
    │  (Database) │ │ (LLM API) │ │ (Future)  │
    └─────────────┘ └───────────┘ └───────────┘
```

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (or use SQLite for development)
- An OpenAI API key (or compatible API)

### 1. Clone & Configure

```bash
git clone https://github.com/umarkhemis/promptpilot.git
cd promptpilot
```

### 2. Start the Backend

```bash
cd api
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Start the Frontend

```bash
cd web
npm install

# Set your API URL (optional, defaults to http://localhost:8000)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

App available at: http://localhost:3000

---

## Environment Variables

### Backend (`api/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://...` | PostgreSQL connection string |
| `LLM_API_KEY` | — | OpenAI (or compatible) API key |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | LLM provider base URL |
| `JWT_SECRET` | — | Secret key for JWT signing |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `JWT_EXPIRATION_MINUTES` | `10080` (7 days) | Token expiration |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |

### Frontend (`web/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **State** | Zustand (with localStorage persistence) |
| **Backend** | FastAPI, Python 3.12, Pydantic v2 |
| **Database** | PostgreSQL (async via SQLAlchemy 2 + asyncpg) |
| **Migrations** | Alembic |
| **AI Engine** | OpenAI GPT-4o / GPT-4o-mini (via httpx) |
| **Auth** | JWT (python-jose) + bcrypt (passlib) |
| **Streaming** | SSE (Server-Sent Events) |

---

## Key Features

- 🚀 **Prompt Improver** — Transforms raw ideas into polished, tool-optimized prompts
- 🎯 **Tool Recommender** — Maps your intent to the best AI tool (Claude, Perplexity, Midjourney, etc.)
- 💬 **Clarifying Questions** — Asks smart follow-ups when your prompt is ambiguous
- 📚 **Template Library** — 13+ curated prompt templates for marketing and study
- 📜 **Prompt History** — Review and reuse past prompts
- ⚡ **Streaming** — Real-time output via SSE for fast perceived performance
- 🎓 **Dual Mode** — Marketing mode and Student mode with tailored prompts

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/prompts/improve` | Improve a prompt (sync) |
| `POST` | `/api/prompts/improve/stream` | Improve a prompt (SSE stream) |
| `GET` | `/api/tools/recommend` | Get tool recommendation by intent |
| `GET` | `/api/templates` | List templates |
| `GET` | `/api/templates/{id}` | Get single template |
| `GET` | `/api/history` | Get prompt history |
| `GET` | `/api/history/{id}` | Get single history entry |

Full interactive docs: http://localhost:8000/docs

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch and open a Pull Request
