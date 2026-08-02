# Road Intelligence — Frontend

Next.js 14 (App Router) + Tailwind + React Leaflet.

## Run locally

```bash
cd frontend
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your FastAPI backend
npm run dev
```

Open http://localhost:3000

## Pages

- `/` — citizen report flow: capture photo → auto GPS → submit → shows AI detection result
  (damage type, severity, confidence, priority score).
- `/dashboard` — live municipality view: stat cards, Leaflet map with severity-colored markers,
  and a priority-sorted report queue. Polls the backend every 8s (no dummy data — everything
  comes from `GET /reports` and `GET /dashboard`).

## Backend contract expected

- `POST /report` — multipart form: `image`, `latitude`, `longitude` → returns a `RoadReport`
  (see `lib/types.ts`).
- `GET /reports` — returns `RoadReport[]`.
- `GET /dashboard` — returns `DashboardStats`.
- `POST /verify` — multipart form: `report_id`, `after_image` → `{ verified, status }`.

## Deploy

Push to GitHub → import into Vercel → set `NEXT_PUBLIC_API_URL` env var to your deployed
Render backend URL.
