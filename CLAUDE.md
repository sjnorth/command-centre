# Command Centre — Claude Code Project Guide

## What This Is

Personal AI command centre with three layers:
1. **Cloud** — Supabase DB + FastAPI backend + React dashboard (Railway)
2. **Local** — OpenClaw for Telegram interface and local agent
3. **Intelligence** — Claude API for analysis, NewsAPI for monitoring, ClickUp for task sync

## Current State

Phase 1 complete: Supabase schema + FastAPI CRUD backend running locally.
Phase 2 complete: Claude API integration for on-demand reflection analysis.
Phase 3 complete: React dashboard (Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui) in `dashboard/`.

## Project Structure

```
app/
  main.py          — FastAPI app factory, CORS, router registration
  config.py        — pydantic-settings (reads .env)
  database.py      — Supabase client dependency (sync, swap to async later)
  routers/         — One file per resource (clients, projects, travel_plans, reflections, action_items)
  schemas/         — Pydantic Create/Update/Read models per resource + analysis response
  services/        — External API integrations (claude.py)
supabase/
  migrations/      — 9 numbered SQL files, applied via Supabase Dashboard
dashboard/
  src/
    types/index.ts      — TS interfaces mirroring backend schemas
    lib/api.ts          — Typed fetch wrappers for all resources
    lib/queryKeys.ts    — Centralised TanStack Query key factory
    lib/utils.ts        — cn(), formatDate(), timeAgo(), nextStatus()
    components/
      layout/           — Layout.tsx, Sidebar.tsx, PageHeader.tsx
      ui/               — shadcn auto-generated components
      shared/           — StatusBadge, PriorityBadge, SentimentBadge, ConfirmDialog, EmptyState
    pages/              — overview, projects, clients, travel, reflections, action-items
```

## Commands

- **Run server (dev):** `uv run uvicorn app.main:app --reload --port 8000`
- **Run dashboard (dev):** `cd dashboard && npm run dev` (opens at http://localhost:5173)
- **Production service:** managed by launchd (`com.commandcentre.api`) — runs on boot, serves dashboard at http://localhost:8000
- **Deploy update:** `./deploy.sh` (git pull + npm build + restart service)
- **Service logs:** `tail -f ~/Library/Logs/commandcentre-api.log`
- **Restart service:** `launchctl kickstart -k gui/$(id -u)/com.commandcentre.api`
- **Install deps:** `uv sync`
- **Add a dep:** `uv add <package>`
- **Lint:** `uv run ruff check app/`
- **Format:** `uv run ruff format app/`

## Key Conventions

- **Package manager:** uv (not pip, not poetry)
- **Python:** 3.13+ with modern syntax (str | None, not Optional[str])
- **Database access:** supabase-py sync client via `Depends(get_supabase)` — no SQLAlchemy/ORM
- **API versioning:** all routes under `/api/v1/`
- **URL style:** hyphenated (`/travel-plans`, `/action-items`)
- **Updates:** PATCH with partial payloads (`exclude_none=True`)
- **UUIDs:** all primary keys; convert to str when passing to supabase-py
- **Enums:** defined in schema files as `str, Enum` subclasses; mirrored in Postgres as custom types
- **No auth yet** — Phase 1 is local-only with permissive RLS

## Database

Hosted on Supabase. Tables: clients, projects, project_clients (junction), travel_plans, reflections (has pgvector embedding column), action_items.

All tables use UUID PKs, created_at/updated_at with auto-trigger, and RLS enabled (permissive for now).

## Environment Variables

Required in `.env` (see `.env.example`):
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_KEY` — anon or service_role key
- `ANTHROPIC_API_KEY` — Claude API key for reflection analysis

## Future Phases

- Phase 4: OpenClaw Telegram bot + news monitoring
- Phase 5: ClickUp sync, Railway deployment
