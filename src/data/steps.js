const getMasterPromptForPathway = (pathwayId) => {
  const idea = `[YOUR APP IDEA HERE]`;

  const safety = `
SAFETY RULES (MUST FOLLOW):
- NEVER put secret keys in frontend (client folder)
- Put ALL keys ONLY in server/.env file
- Create .gitignore file with: .env, node_modules, dist
- Hide passwords with bcrypt
- Folders: client/ = users see, server/ = brain`;

  const prompts = {
    replit: `Build me a simple app called "${idea}" in Replit.

I am a beginner. Make it very simple.

Stack:
- Frontend: React + Tailwind (pretty)
- Backend: Node.js + Express
- Database: Supabase (saves data)
- AI: Google Gemini (backend only, never frontend)

Features:
1. Sign up / log in with bcrypt
2. Main: ${idea} - users can add, see, edit, delete their own data
3. AI: Use Gemini to help users (summarize, etc)
4. Works on phone

${safety}

For Replit:
- Use Replit Agent (sparkles icon)
- Make it run with npm run dev
- Tell me how to run it

Start building now.`,

    antigravity: `Build me a simple app called "${idea}" using Antigravity IDE (local).

I am beginner on laptop.

Stack: React Vite + Tailwind (frontend), Node Express (backend), Supabase (database), Gemini AI (backend only)

Features:
1. Auth with bcrypt
2. Main: ${idea} - CRUD
3. AI feature with Gemini
4. Clean UI

${safety}

For Antigravity:
- Create client/ and server/ folders with package.json
- Tell me commands: cd client, npm install, npm run dev

Start now.`,

    antigravity2: `Build me a simple app called "${idea}" using Antigravity 2.0 multi-agent.

Stack: React + Tailwind, Express, Supabase, Gemini (backend only)
Features: Auth, CRUD for ${idea}, AI feature

${safety}

Use Frontend Agent, Backend Agent, DB Agent. Create checkpoints.

Start now.`,

    arena: `Build me a simple, beautiful, production-ready full-stack app called "${idea}" - make it fully working with NO bugs, amazing UI, mobile friendly, and deploy it live.

I am a beginner. Build EVERYTHING yourself - I will just give you keys and tokens. Instead of taking hours, please build it in around 45 minutes to maximum 1 hour 30 minutes.

Stack:
- Frontend: React + Tailwind (pretty, modern, light theme #F8FAFC, white cards, responsive, glassmorphism)
- Backend: Node.js + Express
- Database: Supabase (Postgres)
- AI: Google Gemini (backend only, never frontend)

Features:
1. Auth: Sign up / log in with bcrypt, email + password, save session, works cross-device
2. Main: ${idea} - users can add, see, edit, delete their own data (CRUD) - data saved in Supabase
3. AI: Gemini helps users (summarize, generate, assist) - backend route POST /api/ai/generate
4. UI: Beautiful, clean, light theme, amazing, works on phone

${safety}

CRITICAL INSTRUCTIONS FOR ARENA.AI / Z.AI - MASTER PROMPT CONTAINING EVERYTHING:

I will send you: supabase api url, anon key, service_role key, github access token (ghp_), vercel access token (vcp_), render api key (rnd_), gemini api key (AIza).

After you build the basic app, ASK me for keys and tokens one by one in chat. Then DO EVERYTHING YOURSELF:

1. CONNECT Supabase: put keys in server/.env as SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, never in frontend
2. CREATE Supabase tables AUTOMATICALLY yourself - DON'T ask me to run SQL manually. Create tables directly using service_role key:
   - create extension if not exists "uuid-ossp"
   - profiles table: id uuid primary key, email text unique, full_name text, created_at timestamp
   - items table: id uuid default uuid_generate_v4() primary key, user_id uuid references profiles(id), title text, description text, ai_summary text, created_at timestamp
   - Enable RLS and create policies: users see/update own profile, users CRUD own items
   - You create tables automatically - no manual step for me!

3. CONNECT Gemini: put GEMINI_API_KEY in server/.env backend only, create backend AI route, frontend calls backend not Google

4. CHECK EVERYTHING FIX ANY KIND OF BUGS AND MAKE SURE EVERYTHING IS SYNCED TO DATABASE AND ALSO MAKE SURE EVERYTHING IS CONNECTED AND CHECK FOR ALL KINDS OF BUGS AND FIX THEM AND ALSO CREATE SUPABASE TABLES - verify auth works, CRUD works, data stays after refresh, AI works, RLS works, no secrets in frontend, no CORS errors, everything connected

5. CREATE GitHub repo via GitHub API using my ghp_ token (POST https://api.github.com/user/repos) and push code automatically

6. DEPLOY backend to Render via Render API using rnd_ key and frontend to Vercel via Vercel API using vcp_ key, set env vars: VITE_API_BASE_URL = Render URL, CLIENT_URL = Vercel URL, fix CORS

7. Give me FINAL amazing fully working and no bugs full stack app: Frontend Vercel link, Backend Render link, GitHub repo link - production-ready, beautiful, no bugs

Make .env correctly and .gitignore that hides .env (contains .env, node_modules, dist). Start building now, then ask for keys one by one. Build in 45min to 1h30m max, final result amazing fully working no bugs.`,

    default: `Build me a simple app called "${idea}"

Beginner friendly, very simple.

Stack: React + Tailwind, Node + Express, Supabase, Gemini (backend only)
Features: Auth, CRUD for ${idea}, AI feature

${safety}

Start now.`
  };

  return prompts[pathwayId] || prompts.default;
};

const sqlMigration = `-- Makes tables for your app - generic starter, works for ANY project
-- For YOUR app idea, you can rename 'items' table later, but this works for MVP
-- Copy ALL, go to Supabase -> SQL Editor -> New Query -> Paste -> Click RUN

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  ai_summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
alter table public.items enable row level security;

create policy "Users see own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users see own items" on public.items for select using (auth.uid() = user_id);
create policy "Users add own items" on public.items for insert with check (auth.uid() = user_id);
create policy "Users edit own items" on public.items for update using (auth.uid() = user_id);
create policy "Users delete own items" on public.items for delete using (auth.uid() = user_id);
`;

export const getStepsForPathway = (pathwayId) => {
  const toolName = {
    replit: 'Replit',
    antigravity: 'Antigravity IDE',
    antigravity2: 'Antigravity 2.0',
    arena: 'Arena.ai / Z.ai',
  }[pathwayId] || 'your tool';

  const masterPrompt = getMasterPromptForPathway(pathwayId);

  const flows = {
    replit: {
      step2: [
        { title: 'Open Replit', desc: 'Go to replit.com → Click + Create Repl → Choose Blank Repl. Works in browser, no install.', action: 'Open replit.com → Create Repl', where: { url: 'https://replit.com', steps: ['Click Create Repl', 'Blank Repl', 'Name: my-app'] } },
        { title: 'Open Replit Agent', desc: 'Left sidebar → Click sparkles icon ✨ (Replit Agent). This is your builder robot.', action: 'Click sparkles icon → Replit Agent', where: { steps: ['Left sidebar → Sparkles icon', 'Replit Agent chat opens'] } },
        { title: 'Paste blueprint', desc: 'Paste your blueprint from Step 1 (replace [YOUR APP IDEA HERE] first!). Press Enter. Watch it build.', action: 'Paste blueprint, press Enter' },
        { title: 'Say continue if stops', desc: 'If Agent pauses, type "continue". Don\'t edit files yourself!', action: 'Type continue if needed', warning: true },
      ],
      step3: [
        { title: 'Create Supabase project', desc: 'supabase.com → Start project → New Project → Name: my-app-memory → Wait 2 min.', action: 'Create Supabase project', where: { url: 'https://supabase.com', steps: ['Start your project', 'New Project', 'Name: my-app-memory', 'Wait'] } },
        { title: 'Copy 3 keys from Settings → API', desc: 'Settings (gear) → API → Copy Project URL, anon key, service_role key to notepad.', action: 'Copy URL, anon, service_role', where: { url: 'https://supabase.com/dashboard/project/_/settings/api', steps: ['Settings → API', 'Copy Project URL', 'Copy anon key', 'Copy service_role key'] }, keys: [{ name: 'Project URL', example: 'https://xxx.supabase.co', what: 'Address of memory box - SAFE', safe: true }, { name: 'Anon Key', example: 'eyJhbG...', what: 'Public key - SAFE for frontend', safe: true }, { name: 'Service Role', example: 'eyJhbG... different', what: 'MASTER KEY - SECRET, only server/.env', safe: false }] },
        { title: 'Run SQL', desc: 'SQL Editor → New Query → Paste SQL below → RUN. Makes tables.', action: 'Paste SQL → RUN', copyable: true, sql: sqlMigration, where: { url: 'https://supabase.com/dashboard/project/_/sql', steps: ['SQL Editor → New Query', 'Paste → RUN'] } },
        { title: 'Tell Agent to connect', desc: 'Tell Replit Agent: "Connect Supabase, put keys in server/.env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY. Never service_role in frontend!"', action: 'Tell Agent to connect Supabase' },
      ],
      step4: [
        { title: 'Get Gemini key', desc: 'aistudio.google.com/app/apikey → Create API key → New Project → Copy AIza... (once only!)', action: 'Get Gemini key', where: { url: 'https://aistudio.google.com/app/apikey', steps: ['Create API Key → New Project', 'Copy AIza...'] } },
        { title: 'Tell Agent to hide key in backend', desc: 'Tell Agent: "Put GEMINI_API_KEY in server/.env only. Make POST /api/ai/generate route that calls Gemini from backend. Frontend calls backend, not Google."', action: 'Tell Agent: backend only' },
        { title: 'Test no leak', desc: 'Try AI feature → F12 → Network → Should NOT see AIza key.', action: 'Check Network has no AIza', warning: true },
      ],
      step5: [
        { title: 'Check .gitignore', desc: 'File list → Open .gitignore → Must have .env, node_modules, dist.', action: 'Check .gitignore has .env' },
        { title: 'Push to GitHub from Replit', desc: 'Left sidebar → Git icon (branch) → Create Git Repo → Connect GitHub → Push. No terminal needed in Replit!', action: 'Git icon → Create Repo → Push' },
        { title: 'Check no secrets', desc: 'GitHub repo → Search .env → 0 results, AIza → 0 results.', action: 'Check clean', warning: true },
      ],
      step6: [
        { title: 'Backend already live on Replit', desc: 'Replit hosts backend! Copy its URL from webview (https://your-repl.username.repl.co).', action: 'Copy Replit backend URL' },
        { title: 'Deploy frontend to Vercel', desc: 'vercel.com → New Project → Import GitHub repo → Root: client → ENV: VITE_API_BASE_URL = Replit URL → Deploy.', action: 'Deploy frontend to Vercel', where: { url: 'https://vercel.com/new', steps: ['Import repo', 'Root: client', 'VITE_API_BASE_URL = Replit URL'] } },
        { title: 'Test live', desc: 'Open Vercel URL in private window → Sign up works?', action: 'Test live' },
      ],
    },
    antigravity: {
      step2: [
        { title: 'Open Antigravity IDE', desc: 'Open Antigravity on laptop → Create folder my-ai-app → Open folder in IDE.', action: 'Create folder and open in IDE', where: { url: 'https://antigravity.google', steps: ['Create folder my-ai-app on Desktop', 'Open Antigravity → Open Folder'] } },
        { title: 'Open AI Chat', desc: 'Cmd+Shift+P (Mac) or Ctrl+Shift+P (Win) → Type "Antigravity: New Chat" → Enter.', action: 'Command Palette → New Chat' },
        { title: 'Paste blueprint', desc: 'Paste blueprint from Step 1, press Enter. Creates client/ and server/.', action: 'Paste blueprint' },
        { title: 'Install & run', desc: 'Terminal: cd client → npm install → npm run dev. New terminal: cd server → npm install → npm run dev. Check localhost.', action: 'npm install in both folders', warning: true },
      ],
      step3: [
        { title: 'Create Supabase project', desc: 'supabase.com → New Project → Wait 2 min.', action: 'Create Supabase', where: { url: 'https://supabase.com', steps: ['New Project', 'Wait'] } },
        { title: 'Copy 3 keys', desc: 'Settings → API → Copy URL, anon, service_role.', action: 'Copy 3 keys', where: { url: 'https://supabase.com/dashboard/project/_/settings/api', steps: ['Settings → API', 'Copy keys'] }, keys: [{ name: 'Project URL', example: 'https://xxx.supabase.co', what: 'SAFE', safe: true }, { name: 'Anon', example: 'eyJ...', what: 'SAFE for frontend', safe: true }, { name: 'Service Role', example: 'eyJ... different', what: 'SECRET - only server/.env', safe: false }] },
        { title: 'Run SQL', desc: 'SQL Editor → New Query → Paste SQL below → RUN.', action: 'Paste SQL → RUN', copyable: true, sql: sqlMigration },
        { title: 'Tell Antigravity to connect', desc: 'Chat: "Connect Supabase, put keys in server/.env"', action: 'Tell AI to connect' },
      ],
      step4: [
        { title: 'Get Gemini key', desc: 'aistudio.google.com/app/apikey → Create API key → Copy AIza...', action: 'Get Gemini key', where: { url: 'https://aistudio.google.com/app/apikey', steps: ['Create API Key'] } },
        { title: 'Tell Antigravity backend only', desc: 'Chat: "Put GEMINI_API_KEY in server/.env only, make POST /api/ai/generate backend route"', action: 'Tell AI backend only' },
        { title: 'Test', desc: 'F12 Network → No AIza key visible.', action: 'Check no leak', warning: true },
      ],
      step5: [
        { title: 'Check .gitignore', desc: 'Open .gitignore → Must have .env, node_modules.', action: 'Check .gitignore' },
        { title: 'Create empty GitHub repo', desc: 'github.com/new → Name: my-ai-app → Public → No README → Create → Copy URL.', action: 'Create empty repo', where: { url: 'https://github.com/new', steps: ['Name: my-ai-app', 'Public', 'No README'] } },
        { title: 'Push via terminal', desc: 'Terminal: git init, git add ., git commit -m "app", git remote add origin YOUR_URL, git push -u origin main', action: 'Push via terminal', copyable: true, code: `git init\ngit add .\ngit commit -m "my app"\ngit branch -M main\ngit remote add origin https://github.com/YOURNAME/my-ai-app.git\ngit push -u origin main` },
        { title: 'Check no secrets', desc: 'GitHub search .env → 0, AIza → 0.', action: 'Check clean', warning: true },
      ],
      step6: [
        { title: 'Deploy backend to Render first', desc: 'render.com → New Web Service → Connect GitHub repo → Root: server → Build: npm install → Start: npm start → ENV vars from server/.env → Deploy → Copy URL.', action: 'Deploy backend to Render', where: { url: 'https://dashboard.render.com', steps: ['New → Web Service', 'Connect repo', 'Root: server'] } },
        { title: 'Deploy frontend to Vercel second', desc: 'vercel.com → New Project → Import same repo → Root: client → ENV: VITE_API_BASE_URL = Render URL → Deploy.', action: 'Deploy frontend to Vercel', where: { url: 'https://vercel.com/new', steps: ['Import repo', 'Root: client', 'VITE_API_BASE_URL = Render URL'] } },
        { title: 'Fix CORS', desc: 'Render → Environment → Add CLIENT_URL = Vercel URL → Save → Redeploy.', action: 'Set CLIENT_URL = Vercel URL in Render' },
        { title: 'Test live', desc: 'Open Vercel URL in incognito → Sign up + AI works?', action: 'Test live' },
      ],
    },
    arena: {
      step2: [
        { title: 'Open Arena.ai / Z.ai', desc: 'Go to arena.ai/code → Choose Agent Mode (for complex tasks). For Z.ai, download ZCode from z.ai. For beginners, arena.ai/code in browser - no install!', action: 'Open arena.ai/code → Agent Mode', where: { url: 'https://arena.ai/code', steps: ['Go to arena.ai/code', 'Choose Agent Mode', 'You see chat + live preview + file tree'] } },
        { title: 'Paste MASTER blueprint', desc: 'Paste your MASTER blueprint from Step 1 - it already contains EVERYTHING: build instructions, safety rules, time limit 45min-1h30m, and says "I will send supabase url, anon, service_role, github token, vercel token, render key, gemini key, check everything fix any kind of bugs and make sure everything is synced to database and also make sure everything is connected and check for all kinds of bugs and fix them and also create supabase tables". Paste it, press Enter.', action: 'Paste MASTER blueprint with all instructions → Enter' },
        { title: 'Watch it build + ask for keys', desc: 'Arena will plan with tool calls (create_file, edit_file) and build client/ and server/ folders. Real-time preview. After basic build, it will say "Send me your Supabase keys" - this is correct! It will do everything itself after you give keys.', action: 'Wait for build, then it asks for keys' },
      ],
      step3: [
        { title: 'Arena asks for Supabase keys - it creates tables itself!', desc: 'When Arena says "Send Supabase URL and keys", send them ONE BY ONE: First Project URL (https://xxx.supabase.co), then anon key (eyJ...), then service_role key (different eyJ...). Tell it: "Create Supabase tables automatically yourself using service_role, don\'t ask me to run SQL!" - Arena will create tables automatically via SQL using service_role, no manual SQL step needed!', action: 'Paste Supabase URL → anon → service_role one by one, tell it to create tables itself', where: { url: 'https://supabase.com/dashboard/project/_/settings/api', steps: ['Supabase → Settings → API → Copy URL, anon, service_role', 'Paste each in Arena chat when it asks', 'Tell: create tables automatically yourself!'] }, keys: [{ name: 'Project URL', example: 'https://xxx.supabase.co', what: 'Supabase → Settings → API → Project URL - SAFE', safe: true }, { name: 'Anon Key', example: 'eyJhbG...', what: 'Settings → API → anon public - SAFE for frontend', safe: true }, { name: 'Service Role', example: 'eyJhbG... different', what: 'Settings → API → service_role - SECRET, only server/.env! Arena uses it to create tables automatically', safe: false }] },
        { title: 'Arena auto-creates tables + checks everything', desc: 'Arena will now: Create tables profiles + items with RLS automatically using service_role, connect Supabase, and CHECK EVERYTHING FIX ANY KIND OF BUGS AND MAKE SURE EVERYTHING IS SYNCED TO DATABASE AND ALSO MAKE SURE EVERYTHING IS CONNECTED AND CHECK FOR ALL KINDS OF BUGS AND FIX THEM. You don\'t need to run SQL manually - Arena does it! Verify it says "Created tables" and "Connected".', action: 'Arena auto-creates tables + checks bugs + syncs DB - no manual SQL!' },
      ],
      step4: [
        { title: 'Arena asks for Gemini key', desc: 'Next Arena asks "Send Gemini API key". Paste AIza... key from aistudio.google.com/app/apikey → Create API key. Tell it: "Put in server/.env as GEMINI_API_KEY, backend only!"', action: 'Paste Gemini AIza... key when asked', where: { url: 'https://aistudio.google.com/app/apikey', steps: ['aistudio.google.com/app/apikey → Create → Copy AIza...', 'Paste in Arena chat'] }, keys: [{ name: 'GEMINI_API_KEY', example: 'AIzaSy...', what: 'aistudio.google.com/app/apikey → Create → SECRET, only server/.env!', safe: false }] },
        { title: 'Arena integrates AI + checks bugs', desc: 'Arena creates backend route POST /api/ai/generate that calls Gemini from backend. Frontend calls backend not Google. Arena also checks everything is connected and fixes bugs automatically!', action: 'Arena creates backend AI route + fixes bugs' },
        { title: 'Test no leak', desc: 'In Arena preview, try AI feature → F12 → Network → Should NOT see AIza key. If you see it, tell Arena: "Key leaked, move to backend only!"', action: 'Check Network has no AIza', warning: true },
      ],
      step5: [
        { title: 'Arena asks for GitHub token', desc: 'Arena has NO "Push to GitHub button" - it uses your GitHub access token to create repo via API! When Arena asks "Send GitHub token", paste ghp_... token from github.com/settings/tokens → Generate new token classic → repo scope → Copy ghp_...', action: 'Paste GitHub token ghp_... when asked', where: { url: 'https://github.com/settings/tokens', steps: ['GitHub → Settings → Tokens → Generate classic → repo scope → Copy ghp_...', 'Paste in Arena chat'] }, keys: [{ name: 'GitHub Token', example: 'ghp_...', what: 'github.com/settings/tokens → Generate classic → repo scope - SECRET!', safe: false }] },
        { title: 'Arena creates repo via API', desc: 'Using token, Arena calls GitHub API POST /user/repos → Creates repo my-ai-app → Pushes code automatically. You see "Created repo https://github.com/YOU/my-ai-app". No button needed - AI does it!', action: 'Arena creates repo via GitHub API using your token' },
        { title: 'Check no secrets', desc: 'Go to GitHub repo → Search .env → 0 results, AIza → 0. If leaked, tell Arena to fix .gitignore and recreate keys.', action: 'Check GitHub has no .env or AIza', warning: true },
      ],
      step6: [
        { title: 'Arena asks for Vercel and Render tokens', desc: 'Next Arena asks "Send Vercel token and Render key". Paste one by one: Vercel token from vercel.com/account/tokens → Create → Copy vcp_... Render key from dashboard.render.com/u/settings → API Keys → Create → Copy rnd_...', action: 'Paste Vercel token and Render key when asked', where: { url: 'https://vercel.com/account/tokens', steps: ['Vercel → Account → Tokens → Create → Copy vcp_...', 'Render → dashboard.render.com/u/settings → API Keys → Create → Copy rnd_...', 'Paste both in Arena chat'] }, keys: [{ name: 'Vercel Token', example: 'vcp_...', what: 'vercel.com/account/tokens → Create - SECRET', safe: false }, { name: 'Render API Key', example: 'rnd_...', what: 'dashboard.render.com/u/settings → API Keys - SECRET, yes Render HAS tokens!', safe: false }] },
        { title: 'Arena deploys via APIs + final bug check', desc: 'Using tokens, Arena calls Vercel API and Render API to deploy. It sets ENV vars: VITE_API_BASE_URL = Render URL, CLIENT_URL = Vercel URL. Then it does final CHECK: "check everything fix any kind of bugs and make sure everything is synced to database and also make sure everything is connected and check for all kinds of bugs and fix them". Fixes CORS, RLS, env, everything! Takes around 45min-1h30m total.', action: 'Arena deploys via APIs + final bug fix check - 45min to 1h30m total' },
        { title: 'Get FINAL amazing fully working no bugs app!', desc: 'Arena gives you: Frontend live: https://your-app.vercel.app (amazing, fully working, no bugs), Backend: https://your-app.onrender.com, GitHub: https://github.com/YOU/my-ai-app. Open Vercel URL in incognito → Test sign up → Test CRUD → Test AI → All works! Data synced to database! No bugs! If any issue, copy Arena response to Mentor (top right Help) - it guides you!', action: 'Get FINAL live links → Test incognito → Amazing fully working no bugs app!', where: { steps: ['Copy Vercel URL → Open incognito → Test sign up', 'Test CRUD → Data stays after refresh? → Synced to DB?', 'Test AI → Works? → No bugs?', 'Done! Save links for hackathon'] } },
      ],
    },
  };

  flows.antigravity2 = flows.antigravity;

  return [
    {
      id: 1,
      title: 'Your Idea Blueprint',
      subtitle: 'Tell AI what to build',
      icon: '💡',
      color: 'from-cyan-400 to-blue-500',
      estimatedTime: '5 min',
      kidExplanation: 'Robot friend needs exact instructions. Not "build car" but "build red car with 4 wheels". Write perfect instructions here.',
      oneBigAction: 'Change [YOUR APP IDEA HERE] to your real idea and copy',
      microSteps: [
        { title: 'Think of ONE simple idea', desc: 'What app do YOU need? Example: "App that turns my class notes into flashcards" or "Recipe app from fridge photo". Pick one.', action: 'Write idea on paper - 1 sentence' },
        { title: 'Replace the [BRACKETS] part', desc: 'In box below, find [YOUR APP IDEA HERE]. Delete it, type your real idea. Be specific! Good: "todo app where AI makes daily plan".', action: 'Edit prompt - replace bracket text', copyable: true },
        { title: 'Copy the whole prompt', desc: 'Click Copy button below. Keeps all magic instructions. Keep tab open!', action: 'Click Copy button below', copyable: true },
      ],
      content: { type: 'blueprint', prompt: masterPrompt },
      mentorContext: 'Help kid pick simple idea.',
    },
    {
      id: 2,
      title: 'Let Robot Build It',
      subtitle: `Use ${toolName}`,
      icon: '🤖',
      color: 'from-violet-400 to-purple-500',
      estimatedTime: '10 min',
      kidExplanation: `Give instructions to ${toolName} robot. It makes files automatically. Just watch and say "continue" if it stops.`,
      oneBigAction: `Open ${toolName} and paste your magic words`,
      microSteps: flows[pathwayId]?.step2 || flows.arena.step2,
      content: { type: 'instructions', tool: toolName },
      mentorContext: `Kid on Step 2 using ${toolName}.`,
    },
    {
      id: 3,
      title: 'Memory Box',
      subtitle: 'Where app remembers',
      icon: '🧠',
      color: 'from-emerald-400 to-teal-500',
      estimatedTime: '8 min',
      kidExplanation: 'App forgets when you refresh! Need cloud notebook called Supabase that never forgets. Free to make.',
      oneBigAction: pathwayId === 'arena' ? 'Create Supabase project and send keys to AI - it creates tables itself!' : 'Create Supabase project and run SQL',
      microSteps: flows[pathwayId]?.step3 || flows.arena.step3,
      content: { type: 'database', sql: pathwayId === 'arena' ? '-- Arena creates tables automatically using service_role - no manual SQL needed! If you want to check, tables are: profiles (id, email, name) and items (id, user_id, title, description, ai_summary). Arena will create them via API.' : sqlMigration },
      mentorContext: 'Kid on Step 3 Supabase.',
    },
    {
      id: 4,
      title: 'Give App a Brain',
      subtitle: 'Connect Gemini AI',
      icon: '✨',
      color: 'from-orange-400 to-pink-500',
      estimatedTime: '5 min',
      kidExplanation: 'App has body and memory but no brain! Give it smart brain Gemini from Google. Free!',
      oneBigAction: 'Get free Gemini key and send to AI',
      microSteps: flows[pathwayId]?.step4 || flows.arena.step4,
      content: { type: 'ai-brain' },
      mentorContext: 'Kid on Step 4 Gemini.',
    },
    {
      id: 5,
      title: 'Save to Backpack',
      subtitle: 'Backup code safely',
      icon: '🎒',
      color: 'from-slate-400 to-gray-600',
      estimatedTime: '6 min',
      kidExplanation: 'GitHub is magic backpack that saves code in cloud. If computer breaks, code safe! But DON\'T put secret keys in public backpack!',
      oneBigAction: pathwayId === 'arena' ? 'Send GitHub token to AI, it creates repo via API' : 'Push code to GitHub without secrets',
      microSteps: flows[pathwayId]?.step5 || flows.arena.step5,
      content: { type: 'github' },
      mentorContext: 'Kid on Step 5 GitHub.',
    },
    {
      id: 6,
      title: 'Put on Internet',
      subtitle: 'Friends can use app',
      icon: '🚀',
      color: 'from-cyan-400 to-indigo-500',
      estimatedTime: '10 min',
      kidExplanation: 'App only works on YOUR computer. Put on internet so anyone can use! For Arena, AI uses your Vercel and Render tokens to deploy via APIs and gives live links - final amazing fully working no bugs app in 45min-1h30m!',
      oneBigAction: pathwayId === 'arena' ? 'Send Vercel and Render tokens to AI, get FINAL live link - amazing no bugs!' : 'Deploy brain to Render first, then face to Vercel',
      microSteps: flows[pathwayId]?.step6 || flows.arena.step6,
      content: { type: 'deploy' },
      mentorContext: 'Kid on Step 6 deployment.',
    },
  ];
};

export const checklistItems = [
  { id: 1, text: 'I can make account and log in', desc: 'Sign up, log out, log in works?', critical: true },
  { id: 2, text: 'Passwords hidden safely', desc: 'Uses bcrypt.hash()', critical: true },
  { id: 3, text: 'Data stays after refresh', desc: 'Add, refresh, still there? Synced to DB?', critical: true },
  { id: 4, text: 'Only I see my data', desc: 'Supabase RLS on', critical: true },
  { id: 5, text: 'AI brain from backend only', desc: 'Frontend has 0 GEMINI results', critical: true },
  { id: 6, text: 'No secret keys in frontend', desc: 'F12 → Search AIza → 0', critical: true },
  { id: 7, text: 'No secrets on GitHub', desc: 'GitHub search .env and AIza → 0', critical: true },
  { id: 8, text: 'Live link works for friends', desc: 'Vercel URL in private window works - fully working no bugs', critical: true },
  { id: 9, text: 'Live AI works', desc: 'On live site AI feature works, everything connected', critical: true },
  { id: 10, text: 'Video 2 min', desc: 'Record: sign up, main, AI - show amazing app', critical: true },
];
