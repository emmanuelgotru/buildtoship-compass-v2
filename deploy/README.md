# Deploy BuildToShip Compass

## Option 1: One-Click Vercel (Easiest - Frontend only, but app is frontend-only so this works!)

This app is a static React SPA, so you only need Vercel for now. Backend is mock/optional.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set env vars if you have Supabase:
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY
```

Or connect GitHub repo to Vercel dashboard:
1. Push code to GitHub
2. vercel.com → Add New Project → Import GitHub repo
3. Framework: Vite, Build: npm run build, Output: dist
4. Add env vars if any
5. Deploy → Live URL

## Option 2: Vercel API with Token (Auto-deploy)

Use the script `scripts/deploy-vercel.js`:

```bash
# Set token
export VERCEL_TOKEN=vercel_xxx...

# Run
node scripts/deploy-vercel.js
```

It will:
- Create a new Vercel project
- Upload dist/ folder
- Return live URL

## Option 3: Render (If you add a backend later)

This current app has no backend server (mentor is client-side). If you add Express backend:

1. dashboard.render.com → New Web Service → Connect GitHub repo
2. Root: server, Build: npm install, Start: npm start
3. Add env vars: GEMINI_API_KEY, SUPABASE_URL, etc.
4. Deploy → Get backend URL
5. In Vercel, set VITE_API_BASE_URL = Render URL

Render DOES have API keys:
- Go to dashboard.render.com/u/settings → API Keys → Create
- Use with Render API: https://api.render.com/docs

Example:
```bash
curl --request POST \
  --url https://api.render.com/v1/services \
  --header "Authorization: Bearer rnd_xxx" \
  --header "Content-Type: application/json" \
  --data '{
    "type": "web_service",
    "name": "buildtoship-backend",
    "repo": "https://github.com/you/repo",
    "branch": "main",
    "buildCommand": "npm install",
    "startCommand": "npm start",
    "rootDir": "server"
  }'
```

## Supabase Setup for Cross-Device Auth

If you pasted Supabase keys in /settings page, run this SQL in Supabase SQL Editor:

```sql
create table if not exists public.compass_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  progress jsonb default '{}'::jsonb,
  created_at timestamp default now()
);
alter table public.compass_users enable row level security;
drop policy if exists "Allow all for anon" on public.compass_users;
create policy "Allow all for anon" on public.compass_users for all using (true) with check (true);

create table if not exists public.compass_progress (
  user_id text primary key,
  email text,
  pathway text,
  current_step int default 1,
  completed_steps jsonb default '[]'::jsonb,
  checklist jsonb default '{}'::jsonb,
  updated_at timestamp default now()
);
alter table public.compass_progress enable row level security;
drop policy if exists "Allow all" on public.compass_progress;
create policy "Allow all" on public.compass_progress for all using (true) with check (true);
```

Then your auth will sync across devices via Supabase instead of localStorage.

## Quick Push to GitHub

```bash
git init
git add .
git commit -m "Initial: BuildToShip Compass v2 simple"
git branch -M main
# Create empty repo on github.com first, no README
git remote add origin https://github.com/YOURNAME/buildtoship-compass.git
git push -u origin main
```
