# BuildToShip Compass 🧭

**Zero to Deployed AI App in 6 Steps** — Interactive hackathon guide + AI mentor for beginners.

**Live:** https://build-to-ship-app.vercel.app
- Also: https://build-to-ship-compass.vercel.app
- Also: https://build-to-ship-guide.vercel.app
- Legacy: https://buildtoship-compass-v2-simple.vercel.app

Light theme (#F8FAFC) with clean white cards, 4 pathways, 6 steps, mentor modal.

## ✨ Features

- **4 Pathways**: Replit (Browser Fast-Track), Antigravity IDE (Local Power-User), Antigravity 2.0 (Experimental), Arena.ai / z.ai (Prompt-to-App) — verified flow
- **6-Step Wizard**: Master Blueprint → Scaffolding → Supabase DB → Gemini AI → GitHub Vault → Live Launch (Render + Vercel)
- **One step per screen**: collapsible sidebar, 2-line prompt preview + Show more + Copy
- **Context-Aware AI Mentor**: Knows your pathway + current step, handles text, screenshot uploads, GitHub/Vercel URL audits
- **Auth**: Email + password x2, save progress by email, cross-device sync via Supabase
- **Security-First**: Teaches .env placement, RLS policies, secret drawer explanations, .gitignore sanity checks
- **Progress Persistence**: Zustand + localStorage + Supabase cloud fallback

## 🎨 Tech Stack

- React 19 + Vite
- Tailwind CSS 3 + light theme
- Zustand (persist) — key: `build-to-ship-app`
- React Router
- Lucide React icons
- Gemini 1.5 Flash (optional real API, mock fallback)

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Optional: Real Gemini Mentor

Create `.env`:

```
VITE_GEMINI_API_KEY=AIzaSy...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

If not set, mentor uses intelligent mock responses that are context-aware per step.

## 🔑 Verified Arena.ai Flow (no Push button)

Arena.ai uses **API tokens**, not buttons:

1. Go to `arena.ai/code` → **Agent Mode**
2. Paste master prompt that says: *"I will send supabase url, anon key, service_role key, github token, vercel token, render key, gemini key — can you connect to supabase and deploy in vercel and render and create a repository in github and integrate ai"*
3. Arena builds app → asks keys one by one:
   - Supabase URL `https://xxx.supabase.co` (from supabase.com Dashboard → Project Settings → API)
   - anon key `eyJ...` (same page)
   - service_role key `eyJ...` (same page, keep secret)
   - Gemini `AIza...` (aistudio.google.com → Get API key)
   - GitHub `ghp_...` (github.com/settings/tokens → classic → repo scope)
   - Vercel `vcp_...` (vercel.com/account/tokens)
   - Render `rnd_...` (dashboard.render.com/u/settings → API Keys)
4. AI calls GitHub API `POST /user/repos` to create repo, Vercel API `/v10/projects` + `/v13/deployments`, Render API `/v1/services` → sets `VITE_API_BASE_URL=Render URL` + `CLIENT_URL=Vercel URL`
5. Returns live links → cross-verify incognito: sign up works + AI works

## 🧠 The 6 Steps

1. **Master Blueprint**: Copy-paste master prompt, replace `[YOUR APP IDEA HERE]`
2. **Scaffolding**: Let AI builder create files, don't edit manually
3. **Database**: Supabase setup, secret drawer (URL, anon key, service role), SQL migration runner — tables `compass_users` + `compass_progress` for Compass sync, generic `profiles/items` starter works for any project
4. **AI Brain**: Google AI Studio key, security alert (server/.env only), backend example
5. **GitHub Vault**: AI creates repo via GitHub API using `ghp_` token, no button
6. **Live Launch**: Dual cards Render backend + Vercel frontend, env dict explanations (VITE_API_BASE_URL, CLIENT_URL), get live links

## 📦 Build & Deploy

```bash
npm run build
```

Vercel Project: `buildtoship` (id: prj_S6nkB2bPd0PNb6LNned23KrJ1CXl)
- Prod alias auto: `buildtoship-404-2426.vercel.app` + `buildtoship-compass-v2-simple.vercel.app`
- Custom simple: `build-to-ship-app.vercel.app` (manually aliased via API after each prod deploy)

To re-alias after deploy:
```bash
export VERCEL_TOKEN=vcp_...
npx vercel alias set <deployment>.vercel.app build-to-ship-app.vercel.app --token $VERCEL_TOKEN --scope team_nfl7nZe5q0OO5N8xk0iqmdfN
```

## 🎯 Checklist Export

Go to `/checklist` → Toggle 12 items → Export generates markdown ready for hackathon submission.
