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

    arena: `Build me a simple app called "${idea}"

I am a beginner. Make it very simple.

Stack:
- Frontend: React + Tailwind (pretty UI)
- Backend: Node.js + Express
- Database: Supabase
- AI: Google Gemini (only from backend, never frontend)

Features:
1. Sign up / log in (bcrypt)
2. Main: ${idea} - users add, see, edit, delete their own data
3. AI: Gemini helps users
4. Nice UI, mobile friendly

${safety}

IMPORTANT FOR ARENA.AI / Z.AI:
I will send the supabase api url, anon key, service role key, and github access token and vercel access token and render api key, and gemini api key, can you connect to supabase and deploy in vercel and render and next create a repository in github and integrate ai in the app

After you build the basic app, ask me to send keys one by one. Then:
- Connect Supabase using URL + anon + service_role
- Connect Gemini using gemini api key (put in server/.env, backend only)
- Create GitHub repo using github access token (via GitHub API) and push code
- Deploy to Vercel using vercel access token and to Render using render api key
- Set env vars correctly (VITE_API_BASE_URL = Render URL, CLIENT_URL = Vercel URL)
- Give me live links

Make .env correctly and .gitignore that hides .env. Start now, then ask for keys.`,

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

  // CORRECTED FLOWS - verified against actual websites
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
        { title: 'Open Arena.ai / Z.ai', desc: 'Go to arena.ai/code (Code Arena) → Choose Agent Mode (for complex tasks) OR download ZCode from z.ai (ZCode desktop app for full control). For beginners, start with arena.ai/code in browser - no install needed!', action: 'Open arena.ai/code → Agent Mode', where: { url: 'https://arena.ai/code', steps: ['Go to arena.ai/code', 'Choose Agent Mode (built for complex tasks)', 'You see chat box + live preview + file tree'] } },
        { title: 'Paste blueprint with keys promise', desc: 'Paste your blueprint from Step 1. IMPORTANT: This blueprint already says "I will send supabase url, anon key, service role, github token, vercel token, render key, gemini key, can you connect and deploy and create github repo". Paste it, press Enter.', action: 'Paste blueprint that says "I will send keys..." → Enter' },
        { title: 'Watch it build + ask for keys', desc: 'Arena will plan with tool calls (create_file, edit_file) and build client/ and server/ folders. You see real-time preview. After basic build, it will say "Send me your Supabase keys" or "Send API keys". This is correct flow!', action: 'Wait for build, then it asks for keys' },
      ],
      step3: [
        { title: 'Arena asks for Supabase keys', desc: 'When Arena says "Send Supabase URL and keys", send them ONE BY ONE in chat: First paste Project URL (https://xxx.supabase.co), then anon key (eyJ...), then service_role key (different eyJ...). Tell it: "Put them in server/.env as SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, never in frontend!"', action: 'Paste Supabase URL → anon → service_role one by one when asked', where: { url: 'https://supabase.com/dashboard/project/_/settings/api', steps: ['Supabase → Settings → API → Copy URL, anon, service_role', 'Paste each in Arena chat when it asks'] }, keys: [{ name: 'Project URL', example: 'https://xxx.supabase.co', what: 'Get from Supabase → Settings → API → Project URL - SAFE', safe: true }, { name: 'Anon Key', example: 'eyJhbG...', what: 'Settings → API → anon public - SAFE for frontend', safe: true }, { name: 'Service Role', example: 'eyJhbG... different', what: 'Settings → API → service_role - SECRET, only server/.env!', safe: false }] },
        { title: 'SQL for YOUR app tables', desc: 'This SQL makes generic tables profiles + items that work for ANY project (todo, notes, recipes). You already ran SQL for Compass tables (compass_users, compass_progress) which saves Compass progress across devices. For YOUR app, Arena will create tables automatically OR you can run this SQL in Supabase SQL Editor → New Query → Paste → RUN. Works for any idea, customize later.', action: 'Arena auto-creates OR you run SQL in Supabase', copyable: true, sql: sqlMigration, where: { url: 'https://supabase.com/dashboard/project/_/sql', steps: ['SQL Editor → New Query', 'Paste generic SQL → RUN', 'Works for any project - generic starter'] } },
        { title: 'Verify connection', desc: 'After pasting keys, Arena will say "Connected to Supabase" and show it created .env file. Check file list → server/.env should have your keys (don\'t share screenshot with keys!).', action: 'Check Arena says Connected, .env created' },
      ],
      step4: [
        { title: 'Arena asks for Gemini key', desc: 'Next Arena will ask "Send Gemini API key". Paste your AIza... key (from aistudio.google.com/app/apikey → Create API key). Tell it: "Put in server/.env as GEMINI_API_KEY, backend only, never frontend!"', action: 'Paste Gemini AIza... key when asked', where: { url: 'https://aistudio.google.com/app/apikey', steps: ['Go to aistudio.google.com/app/apikey', 'Create API Key → Copy AIza...', 'Paste in Arena chat'] }, keys: [{ name: 'GEMINI_API_KEY', example: 'AIzaSy...', what: 'Get from aistudio.google.com/app/apikey → Create → SECRET, only server/.env!', safe: false }] },
        { title: 'Arena integrates AI', desc: 'Arena will create backend route POST /api/ai/generate that calls Gemini from backend. Frontend will call backend, not Google directly. This is correct and safe!', action: 'Arena creates backend AI route' },
        { title: 'Test no leak', desc: 'In Arena preview, try AI feature → Open browser F12 → Network → Should NOT see AIza key. If you see it, tell Arena: "Key leaked to frontend, move to backend only!"', action: 'Check Network has no AIza', warning: true },
      ],
      step5: [
        { title: 'Arena asks for GitHub token', desc: 'Arena does NOT have "Push to GitHub button" - instead it uses your GitHub access token to create repo via API! When Arena asks "Send GitHub access token", paste your ghp_... token. Get it from github.com/settings/tokens → Generate new token classic → Check repo scope → Generate → Copy ghp_...', action: 'Paste GitHub token ghp_... when asked', where: { url: 'https://github.com/settings/tokens', steps: ['GitHub → Settings → Developer Settings → Tokens → Generate new token classic', 'Check repo scope → Generate → Copy ghp_...', 'Paste in Arena chat'] }, keys: [{ name: 'GitHub Token', example: 'ghp_...', what: 'Get from github.com/settings/tokens → Generate classic → repo scope - SECRET!', safe: false }] },
        { title: 'Arena creates repo via API', desc: 'Using your token, Arena will call GitHub API: POST /user/repos → Creates repo my-ai-app → Pushes code automatically. You will see "Created repo https://github.com/YOU/my-ai-app" and it will push. No button click needed - AI does it with token!', action: 'Arena creates repo via GitHub API using your token' },
        { title: 'Check no secrets on GitHub', desc: 'Go to github.com/YOU/my-ai-app → Press t → Type .env → Should be 0 results. Search AIza → 0 results. Good! If leaked, tell Arena to fix .gitignore and recreate keys.', action: 'Check GitHub has no .env or AIza', warning: true },
      ],
      step6: [
        { title: 'Arena asks for Vercel and Render tokens', desc: 'Next Arena asks "Send Vercel token and Render API key". Paste them one by one: Vercel token from vercel.com/account/tokens → Create → Copy vcp_... or vercel_... Render key from dashboard.render.com/u/settings → API Keys → Create → Copy rnd_...', action: 'Paste Vercel token and Render key when asked', where: { url: 'https://vercel.com/account/tokens', steps: ['Vercel → Account → Tokens → Create → Copy vcp_...', 'Render → dashboard.render.com/u/settings → API Keys → Create → Copy rnd_...', 'Paste both in Arena chat'] }, keys: [{ name: 'Vercel Token', example: 'vcp_...', what: 'vercel.com/account/tokens → Create - SECRET', safe: false }, { name: 'Render API Key', example: 'rnd_...', what: 'dashboard.render.com/u/settings → API Keys - SECRET, yes Render HAS tokens!', safe: false }] },
        { title: 'Arena deploys via APIs', desc: 'Using tokens, Arena calls: Vercel API POST /v10/projects and /v13/deployments → Deploys frontend, and Render API POST /v1/services → Deploys backend (server folder). It sets ENV vars automatically: VITE_API_BASE_URL = Render URL, CLIENT_URL = Vercel URL. You will get live links!', action: 'Arena deploys via Vercel API + Render API using tokens' },
        { title: 'Get live links and cross-verify', desc: 'Arena will give you: Frontend live: https://your-app.vercel.app and Backend live: https://your-app.onrender.com and GitHub: https://github.com/YOU/my-ai-app. Open Vercel URL in incognito (private) window → Try sign up → Try AI feature → Should work! If CORS error, tell Arena: "Set CLIENT_URL in Render to Vercel URL and redeploy".', action: 'Get live links from Arena → Test in incognito → Cross-verify sign up + AI works', where: { steps: ['Copy Vercel URL → Open incognito → Test sign up', 'Test AI feature → Works?', 'If CORS error → Tell Arena to set CLIENT_URL = Vercel URL in Render'] } },
        { title: 'Done!', desc: 'You now have live app that anyone can use! Save live links for hackathon submission. If any step failed or response different, copy Arena response and paste to AI Mentor (top right Help button) - it will guide you!', action: 'Save live links, done!' },
      ],
    },
  };

  // Use same for antigravity2 as antigravity
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
      oneBigAction: 'Create Supabase project and send keys to AI',
      microSteps: flows[pathwayId]?.step3 || flows.arena.step3,
      content: { type: 'database', sql: sqlMigration },
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
      kidExplanation: 'App only works on YOUR computer. Put on internet so anyone can use! For Arena, AI uses your Vercel and Render tokens to deploy via APIs and gives live links.',
      oneBigAction: pathwayId === 'arena' ? 'Send Vercel and Render tokens to AI, get live links' : 'Deploy brain to Render first, then face to Vercel',
      microSteps: flows[pathwayId]?.step6 || flows.arena.step6,
      content: { type: 'deploy' },
      mentorContext: 'Kid on Step 6 deployment.',
    },
  ];
};

export const checklistItems = [
  { id: 1, text: 'I can make account and log in', desc: 'Sign up, log out, log in works?', critical: true },
  { id: 2, text: 'Passwords hidden safely', desc: 'Uses bcrypt.hash()', critical: true },
  { id: 3, text: 'Data stays after refresh', desc: 'Add, refresh, still there?', critical: true },
  { id: 4, text: 'Only I see my data', desc: 'Supabase RLS on', critical: true },
  { id: 5, text: 'AI brain from backend only', desc: 'Frontend has 0 GEMINI results', critical: true },
  { id: 6, text: 'No secret keys in frontend', desc: 'F12 → Search AIza → 0', critical: true },
  { id: 7, text: 'No secrets on GitHub', desc: 'GitHub search .env and AIza → 0', critical: true },
  { id: 8, text: 'Live link works for friends', desc: 'Vercel URL in private window works', critical: true },
  { id: 9, text: 'Live AI works', desc: 'On live site AI feature works', critical: true },
  { id: 10, text: 'Video 2 min', desc: 'Record: sign up, main, AI', critical: true },
];
