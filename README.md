# Command Centre

Personal AI command centre — tracks projects, clients, travel plans, reflections, and action items. Uses Claude API for analysis and next-step suggestions.

## Architecture

```
Layer 1 (Cloud)        Layer 2 (Local)         Layer 3 (Intelligence)
─────────────────      ─────────────────       ─────────────────────
Supabase (DB)          OpenClaw (Telegram)     Claude API (analysis)
FastAPI (API)          Local agent             NewsAPI (monitoring)
React dashboard                                ClickUp API (tasks)
Railway (hosting)
```

**Phase 1 (current):** Supabase schema + FastAPI backend running locally.

## Tech Stack

- **Database:** Supabase (PostgreSQL + pgvector)
- **Backend:** FastAPI (Python 3.13, uv)
- **Frontend:** React + Tailwind + shadcn/ui (planned)
- **Hosting:** Railway (planned)
- **AI:** Claude API
- **Integrations:** OpenClaw, NewsAPI, ClickUp

## Database Schema

| Table | Purpose |
|-------|---------|
| `clients` | Contact info and notes for each client |
| `projects` | Tracked projects with status (active/on_hold/completed/archived) |
| `project_clients` | Many-to-many junction between projects and clients |
| `travel_plans` | Upcoming travel with dates, destination, purpose |
| `reflections` | Post-session notes, optionally linked to project/client. Has `embedding` column (vector(1536)) for future semantic search |
| `action_items` | Tasks with priority/status/due date, can originate from reflections or AI |

## Setup

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) package manager
- A [Supabase](https://supabase.com) project

### Install

```bash
uv sync
```

### Configure

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

### Database Migrations

Run each SQL file in `supabase/migrations/` in order via the Supabase Dashboard SQL Editor:

1. `00001_enable_extensions.sql` — pgvector + uuid-ossp
2. `00002_create_clients.sql` — clients table + updated_at trigger function
3. `00003_create_projects.sql` — projects table + status enum
4. `00004_create_project_clients.sql` — junction table
5. `00005_create_travel_plans.sql` — travel plans table
6. `00006_create_reflections.sql` — reflections table with pgvector column
7. `00007_create_action_items.sql` — action items with status/priority/source enums
8. `00008_create_indexes.sql` — indexes on frequently queried columns

### Run

```bash
uv run uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## API Endpoints

All resource endpoints are under `/api/v1/`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| **Clients** | | |
| GET | `/api/v1/clients/` | List clients |
| GET | `/api/v1/clients/{id}` | Get client |
| POST | `/api/v1/clients/` | Create client |
| PATCH | `/api/v1/clients/{id}` | Update client |
| DELETE | `/api/v1/clients/{id}` | Delete client |
| **Projects** | | |
| GET | `/api/v1/projects/` | List projects |
| GET | `/api/v1/projects/{id}` | Get project |
| POST | `/api/v1/projects/` | Create project |
| PATCH | `/api/v1/projects/{id}` | Update project |
| DELETE | `/api/v1/projects/{id}` | Delete project |
| GET | `/api/v1/projects/{id}/clients` | Get project's clients |
| POST | `/api/v1/projects/{id}/clients/{client_id}` | Link client to project |
| DELETE | `/api/v1/projects/{id}/clients/{client_id}` | Unlink client |
| **Travel Plans** | | |
| GET | `/api/v1/travel-plans/` | List travel plans |
| GET | `/api/v1/travel-plans/{id}` | Get travel plan |
| POST | `/api/v1/travel-plans/` | Create travel plan |
| PATCH | `/api/v1/travel-plans/{id}` | Update travel plan |
| DELETE | `/api/v1/travel-plans/{id}` | Delete travel plan |
| **Reflections** | | |
| GET | `/api/v1/reflections/` | List reflections (filter: `project_id`, `client_id`) |
| GET | `/api/v1/reflections/{id}` | Get reflection |
| POST | `/api/v1/reflections/` | Create reflection |
| PATCH | `/api/v1/reflections/{id}` | Update reflection |
| DELETE | `/api/v1/reflections/{id}` | Delete reflection |
| **Action Items** | | |
| GET | `/api/v1/action-items/` | List action items (filter: `status`, `priority`, `project_id`) |
| GET | `/api/v1/action-items/{id}` | Get action item |
| POST | `/api/v1/action-items/` | Create action item |
| PATCH | `/api/v1/action-items/{id}` | Update action item |
| DELETE | `/api/v1/action-items/{id}` | Delete action item |

## Design Decisions

- **supabase-py over SQLAlchemy** — consistent client for both backend and future OpenClaw agent; no ORM layer between you and the Supabase API
- **Sync client** — simpler for Phase 1 single-user use; FastAPI runs sync deps in threadpool
- **PATCH for updates** — partial updates with `exclude_none=True`; practical for changing one field at a time
- **No auth in Phase 1** — runs locally only; RLS policies are permissive; tighten when deploying to Railway
- **Plain SQL migrations** — applied via Supabase Dashboard; avoids Alembic overhead for a Supabase-hosted DB
- **Embedding index deferred** — ivfflat index on reflections.embedding requires data to be effective; add when reflections exist
