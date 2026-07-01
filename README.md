# ⚕️ ACRF — AI Anaesthesia Risk & Surgical Planning

12-stage expert perioperative assessment powered by Claude AI.

## Quick Deploy (Vercel — recommended, free)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Add these environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
   - `VITE_SUPABASE_URL` = https://vhqlobpzrlfaecyvykwv.supabase.co
   - `VITE_SUPABASE_KEY` = your Supabase anon key
   - `VITE_API_PROXY` = /api/chat
4. Deploy — live in ~60 seconds

## Local Development

```bash
npm install
cp .env.example .env
# Fill in .env with your keys
npm run dev
```

## Supabase Table Setup (one-time)

Run in Supabase SQL Editor:

```sql
create table acrf_cases (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);
alter table acrf_cases enable row level security;
create policy "Allow all" on acrf_cases
  for all to anon, authenticated
  using (true) with check (true);
```

## Features

- 12-stage AI anaesthetic plan (streaming, no truncation)
- RCRI, ARISCAT, STOP-BANG calculators
- Password-gated consultant review with 10-domain scoring (0/1/2)
- Case dashboard with analytics
- Shared case history via Supabase (visible to all team members)
- Continue button for truncated assessments

## Project Structure

```
src/
  App.jsx       — main application
  main.jsx      — React entry point
  storage.js    — Supabase storage layer
api/
  chat.js       — Vercel edge function (API key proxy)
```

## Disclaimer

Clinical decision support only. Not a substitute for clinical judgement.
