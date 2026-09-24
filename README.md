# BuildToShip Compass 🧭

**Zero to Deployed AI App in 6 Steps** — Interactive hackathon guide + AI mentor for beginners.

Ultra-modern dark obsidian UI with neon gradients, glassmorphism, and full pathway personalization.

## ✨ Features

- **4 Pathways**: Replit (Browser Fast-Track), Antigravity IDE (Local Power-User), Antigravity 2.0 (Experimental), Arena.ai / z.ai (Prompt-to-App)
- **6-Step Wizard**: Master Blueprint → Scaffolding → Supabase DB → Gemini AI → GitHub Vault → Live Launch (Render + Vercel)
- **Context-Aware AI Mentor**: Knows your pathway + current step, handles text, screenshot uploads, GitHub/Vercel URL audits
- **Security-First**: Teaches .env placement, RLS policies, secret drawer explanations, .gitignore sanity checks
- **Progress Persistence**: Zustand + localStorage fallback (works offline, survives refresh)
- **Final Checklist**: 12 baseline items + markdown export for hackathon submission

## 🎨 Tech Stack

- React 19 + Vite
- Tailwind CSS 3 + custom glassmorphism
- Zustand (persist)
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
```

If not set, mentor uses intelligent mock responses that are context-aware per step.

## 📁 Structure

```
src/
  components/
    Header.jsx - Sticky header with progress + mentor button
    PathwayCard.jsx - Gradient cards with glow
    CodeBlock.jsx - Copyable code with terminal header
    MentorModal.jsx - Context-aware chat + file upload
    Confetti.jsx - Celebration on milestones
  pages/
    Landing.jsx - Hero + pathway selector + quick audit banner
    Wizard.jsx - 6-step sequential wizard (one card at a time)
    Checklist.jsx - 12-item toggle + markdown export
  data/
    pathways.js - 4 tool definitions
    steps.js - 6 steps dynamic per tool + SQL migration + checklist
  store/useStore.js - Zustand with localStorage
```

## 🧠 The 6 Steps

1. **Master Blueprint**: Copy-paste master prompt, replace `[YOUR APP IDEA HERE]`
2. **Scaffolding**: Let AI builder create files, don't edit manually
3. **Database**: Supabase setup, secret drawer (URL, anon key, service role), SQL migration runner
4. **AI Brain**: Google AI Studio key, security alert (server/.env only), backend example
5. **GitHub Vault**: Push without leaking keys, .gitignore check
6. **Live Launch**: Dual cards Render backend + Vercel frontend, env dict explanations (VITE_API_BASE_URL, CLIENT_URL)

## 🔐 Security Highlights

- Mentor modal shows system prompt injection
- Secret Drawer explains keys in plain English
- SQL includes RLS policies
- Deployment cards explain CORS

## 📦 Build

```bash
npm run build
npm run preview
```

Deploy `dist/` to Vercel.

## 🎯 Hackathon Submission Export

Go to `/checklist` → Toggle 12 items → Export generates:

- Live URLs
- GitHub repo
- Demo video structure
- Tech stack
- Security checklist
- Setup instructions

Ready to paste into submission form.

---

Built for beginners, by builders. Save progress locally, no data sent to server.
