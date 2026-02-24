# Betasso Trail Direction Tracker

## What This Is
A Next.js app that infers the current mountain bike riding direction (CW/CCW) for Canyon Loop and Benjamin Loop at Betasso Preserve in Boulder, CO. Rangers change directions unpredictably and never post them online. This app crowdsources the answer by analyzing Strava segment data from connected riders.

## Live URL
- **Production:** https://betasso.vercel.app
- **GitHub:** https://github.com/mikefb02421/whatdirectionisbetasso.git

## Tech Stack
- Next.js 16 (App Router), Tailwind CSS v4, Vercel hosting (free tier)
- Neon Postgres (via Vercel Storage integration)
- Strava API for OAuth + webhooks + segment data

## Strava Segment IDs
- Benjamin CW: 1809798
- Benjamin CCW: 661111
- Canyon CW: 15627703
- Canyon CCW: 1809767, 1425550 (two segments, match on either)

## Strava API Credentials
- Client ID: 155739
- Client Secret: stored in Vercel env vars
- Webhook verify token: `739ad3514cd163b43624fafa02016eca`

## Database
- Hosted on Neon via Vercel Storage integration
- Connection string is in Vercel env var `POSTGRES_URL` (we had to add it manually as a regular env var because the Neon integration vars weren't visible to the build)
- Schema has been run — 4 tables exist: `users`, `segment_efforts`, `effort_count_readings`, `direction_changes`
- Tables are currently empty (no riders connected yet)

## Environment Variables (all set in Vercel)
- `STRAVA_CLIENT_ID` — 155739
- `STRAVA_CLIENT_SECRET` — set
- `NEXT_PUBLIC_STRAVA_CLIENT_ID` — 155739
- `STRAVA_WEBHOOK_VERIFY_TOKEN` — set
- `CRON_SECRET` — set
- `POSTGRES_URL` — set (manually added, separate from Neon integration vars)

## Project Structure
```
app/
  layout.js              — Root layout, meta tags, dark mode
  page.js                — Main page (client component, fetches /api/status)
  globals.css            — Tailwind + outdoor color vars
  api/
    auth/strava/route.js — OAuth callback (exchanges code, stores user)
    webhook/route.js     — Strava webhook (GET=verify, POST=process activities)
    status/route.js      — Public JSON API (returns directions, has mock fallback)
    cron/check/route.js  — Daily backup effort-count check
  connect/page.js        — "Connect your Strava" page with OAuth button
lib/
  segments.js            — Segment ID config and lookup maps
  db.js                  — All database queries (@vercel/postgres)
  strava.js              — Strava API helpers (token exchange, refresh, fetch)
  direction.js           — Direction inference logic + confidence scoring
components/
  DirectionCard.js       — Direction display card (arrow, label, confidence badge)
  TrailMap.js            — SVG map of both loops with direction arrows
  HistoryTable.js        — Recent direction changes table (Source col hidden on mobile)
  ClosureBanner.js       — Red banner on Wed/Sat (bike closure days)
schema.sql               — Database table definitions
vercel.json              — Cron config (daily at 8am UTC)
```

## What's Done
1. Full project scaffolded and coded
2. All API routes implemented (auth, webhook, status, cron)
3. Direction inference engine with confidence scoring (high/medium/low)
4. Responsive frontend — tested on desktop, mobile, dark mode
5. Git repo initialized, pushed to GitHub
6. Deployed to Vercel (production)
7. Database created on Neon, schema run, tables verified
8. All environment variables configured
9. Mock data fallback works when no DB is connected

## What's Left To Do
1. **Verify the deploy works with real DB** — a push was just made (commit 3aab0b6), waiting for Vercel to deploy. Once live, the app should show "No recent data" instead of mock data.
2. **Register the Strava webhook** — one-time curl command to tell Strava to send events to `https://betasso.vercel.app/api/webhook`. Needs the webhook verify token.
3. **Update Strava API app callback domain** — In Strava API settings, set the authorization callback domain to `betasso.vercel.app` (currently may be set to localhost).
4. **Test the OAuth flow** — Connect Mike's Strava account, verify user appears in DB.
5. **Test the webhook** — Upload a ride on Strava that hits a Betasso segment, verify direction updates.
6. **Remove mock data fallback** — Once everything is confirmed working with real data.
7. **Add a favicon** — Currently 404ing.
8. **Optional polish** — Improve trail map SVG with more realistic trail shapes, larger direction arrows in cards.

## Cron Limitation
Vercel free tier only supports daily crons (not the every-2-hours from the original plan). Changed to daily at 8am UTC. Webhook-based detection is the primary method anyway, so this is fine.

## Key Design Decisions
- `@vercel/postgres` is technically deprecated (Vercel migrated to Neon) but still works. Could migrate to `@neondatabase/serverless` later.
- Status API has a mock data fallback (`USE_MOCK`) that activates when no `POSTGRES_URL` or `DATABASE_URL` env var is found. This made local dev and initial deployment easier.
- The cron endpoint uses the first connected user's token to call the Strava segments API (no app-level token needed).
- Direction confidence: high (5+ efforts, 80%+ ratio), medium (3-4, 65%+), low (1-2 or mixed).
