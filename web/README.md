# PromptPilot Web

Next.js 14 frontend for the PromptPilot application.

## Prerequisites

- Node.js 18+
- npm / yarn / pnpm

## Setup

```bash
cd web
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Base URL for the PromptPilot API |

## Build

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (font, metadata, providers)
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles + Tailwind directives
│   ├── (auth)/             # Auth route group (no URL segment)
│   │   ├── login/          # /login
│   │   └── register/       # /register
│   └── (app)/              # Authenticated route group
│       ├── layout.tsx      # App shell (sidebar + header + auth guard)
│       ├── dashboard/      # /dashboard — main prompt workspace
│       ├── templates/      # /templates — browse prompt templates
│       ├── history/        # /history — past prompt improvements
│       └── settings/       # /settings — profile & preferences
├── components/             # Shared React components
│   ├── providers.tsx       # Client-side providers wrapper
│   ├── sidebar.tsx         # Navigation sidebar
│   ├── header.tsx          # Top header with user menu
│   ├── prompt-input.tsx    # Prompt textarea + submit button
│   ├── prompt-output.tsx   # Streaming output display
│   ├── tool-card.tsx       # AI tool recommendation card
│   ├── template-card.tsx   # Template browse card
│   ├── mode-switcher.tsx   # Marketing / Student toggle
│   └── clarifying-questions.tsx  # Follow-up Q&A form
├── lib/
│   ├── api.ts              # API client (auth, prompts, templates, history)
│   ├── store.ts            # Zustand state (user, token, mode, output)
│   └── utils.ts            # cn() helper (clsx + tailwind-merge)
└── public/
    └── logo.svg            # PromptPilot compass logo
```

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.3 | React framework (App Router) |
| React | 18.3 | UI library |
| TypeScript | 5.4 | Type safety |
| Tailwind CSS | 3.4 | Utility-first styling |
| Zustand | 4.5 | Global state (auth, mode, output) |
| lucide-react | 0.378 | Icon library |
| clsx + tailwind-merge | latest | Conditional class merging |

## Features

- **Landing Page** — Marketing site with hero, features, how-it-works, CTA
- **Auth** — Login & register with JWT token storage via Zustand persist
- **Dashboard** — Real-time streaming prompt improvement with SSE
- **Mode Switcher** — Toggle between Marketing and Student modes
- **Templates** — Browse & filter curated prompt templates by mode/category
- **History** — Paginated list of past prompt improvements
- **Settings** — Mode preference and context profile
- **Dark Mode** — Full dark mode support via Tailwind `darkMode: "class"`
