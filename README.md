# IronPrint Web

Frontend for IronPrint — a personal workout tracking app. Built with Next.js 16 App Router.

> **Monorepo sibling:** [`ironprint-api`](https://github.com/kQuiroga/ironprint-api) (.NET 10 backend)

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4 — Material You design system
- **Data fetching:** TanStack Query v5
- **Forms:** React Hook Form 7 + Zod 4
- **HTTP client:** Axios
- **Utilities:** date-fns 4, Recharts 3

## Features

- Monthly/weekly training calendar with planned days, logged sessions, and day logs
- Daily hub (`/today`) — rest day card, exercise preview, or active session redirect
- Routine management — create routines with days and exercises, activate/deactivate
- Workout session logging — per-exercise set tracking (reps + weight)
- JWT auth — access token in memory, refresh token in `httpOnly` cookie with auto-retry on 401

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for local API + database)

### Installation

```bash
git clone https://github.com/kQuiroga/ironprint-web.git
cd ironprint-web
npm install
```

### Running locally

Start the API and database (from the monorepo root):

```bash
docker compose up -d
```

Start the frontend dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Protected routes (calendar, today, routines, workout)
│   ├── api/auth/         # Route handlers — token refresh/revoke
│   ├── login/
│   └── register/
├── components/ui/        # Reusable UI primitives
├── hooks/                # TanStack Query wrappers (one file per resource)
├── services/             # Axios service functions (one file per resource)
├── providers/            # React Context (AuthProvider, QueryProvider)
├── types/                # Shared TypeScript types
└── lib/                  # Utilities (cn, axios instance)
```

## Routes

| Path | Description |
|------|-------------|
| `/today` | Daily hub — rest / planned / active session |
| `/calendar` | Monthly & weekly training calendar |
| `/routines` | Routine list — activate, deactivate, delete |
| `/routines/new` | Create routine with days and exercises |
| `/routines/[id]` | Routine detail |
| `/routines/[id]/edit` | Edit routine |
| `/workout/[date]` | Workout session — log sets per exercise |
| `/stats` | Monthly statistics |

## Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
```
