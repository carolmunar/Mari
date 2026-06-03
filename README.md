# AI Project Planner (ProjectAI)

A four-step AI sprint planning app: Context Input → AI Analysis → Assignments → Kanban Board.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env` with your **Google Gemini** key (free tier works):

```
GEMINI_API_KEY=AQ.your-key-from-google-ai-studio
```

Get it at [Google AI Studio → API keys](https://aistudio.google.com/apikey). Copy the key **exactly** as shown — do not add `sk-proj-` in front.

Optional: use OpenAI instead with `OPENAI_API_KEY=sk-...`

## Run

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API server: http://localhost:3001 (proxied via Vite at `/api`)

## Notion documentation links

When you paste a Notion URL, the server **fetches the page text** before AI runs (no more guessing from the URL alone).

**Public pages:** In Notion, use **Share → Publish to web**, then paste that link.

**Private workspace pages:** Add a Notion integration:

1. Create an integration at [notion.so/myintegrations](https://www.notion.so/myintegrations)
2. Copy the secret into `.env` as `NOTION_API_KEY=secret_...`
3. In Notion, open your page → **⋯** → **Connections** → add your integration

You’ll see a green or amber banner on the Analysis screen confirming whether the doc was fetched.

## Flow

1. **Context Input** — Add doc URL, upload a text file, notes, and toggle team availability.
2. Click **Analyze with AI** — Runs Context + Analysis agents.
3. **AI Analysis** — Effort/Impact matrix and backlog.
4. **Assignments** — Auto-loads Assignment agent; approve sprint.
5. **Kanban Board** — All approved tickets start in **To Do** (empty In Progress, Review, Done).

## Architecture

| Step | API route | Agent |
|------|-----------|-------|
| Context | `POST /api/agents/context` | ContextAgent |
| Analysis | `POST /api/agents/analyze` | AnalysisAgent |
| Assignments | `POST /api/agents/assign` | AssignmentAgent |
| Board | `POST /api/agents/sprint` | SprintAgent |

Schemas live in `shared/schemas/` and are used by both client and server.

## Deploy (Vercel + GitHub)

This repo is set up for [Vercel](https://vercel.com):

1. Push to GitHub: `https://github.com/carolmunar/Mari`
2. Import the repo in Vercel (or connect via `vercel` CLI)
3. Add environment variables in Vercel → Settings → Environment Variables:
   - `GEMINI_API_KEY` — required for AI features
   - `NOTION_API_KEY` — optional, for private Notion pages

Production serves the React app from `dist/` and API routes from `api/index.ts`.
