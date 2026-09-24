const getMasterPromptForPathway = (pathwayId) => {
  const baseIdea = `[YOUR APP IDEA HERE]`;

  const commonSafety = `
Safety - VERY IMPORTANT:
- NEVER put secret keys in frontend (what users see)
- Put GEMINI_API_KEY and SUPABASE keys ONLY in server/.env file
- Make a .gitignore file that hides .env files
- Hide passwords with bcrypt
- Folders: client/ = what users see, server/ = brain`;

  const prompts = {
    replit: `Build me a simple app called "${baseIdea}" in Replit.

I am a beginner. Make it very simple.

Use:
- Frontend: React + Tailwind (pretty UI)
- Backend: Node.js + Express
- Database: Supabase (saves data forever)
- AI: Google Gemini (only from backend, never frontend)

What app should do:
1. People can sign up and log in safely
2. Main idea: ${baseIdea} - users can add, see, edit, delete their own stuff
3. AI magic: Use Gemini to help users (summarize, quiz, etc)
4. Works on phone too

${commonSafety}

For Replit:
- Use Replit Agent to build
- Make it run with "npm run dev" in both client and server
- Tell me how to run it in Replit

Start now.`,

    antigravity: `Build me a simple app called "${baseIdea}" using Antigravity IDE.

I am a beginner on my laptop. Make it very simple.

Use:
- Frontend: React (Vite) + Tailwind
- Backend: Node.js + Express
- Database: Supabase
- AI: Google Gemini (backend only)

Features:
1. Sign up / log in with bcrypt
2. Main: ${baseIdea} - CRUD for user data
3. AI: Gemini feature
4. Clean UI, mobile friendly

${commonSafety}

For Antigravity:
- Create client/ and server/ folders
- Make package.json in both
- Tell me exact commands: cd client, npm install, npm run dev

Start building step by step.`,

    antigravity2: `Build me a simple app called "${baseIdea}" using Antigravity 2.0 multi-agent.

Use:
- Frontend: React + Tailwind
- Backend: Express
- Database: Supabase
- AI: Gemini (backend only)

Features: Auth with bcrypt, CRUD for ${baseIdea}, AI feature, nice UI

${commonSafety}

For Antigravity 2.0:
- Use Frontend Agent, Backend Agent, DB Agent
- Create checkpoints
- Make it easy to run

Start now.`,

    arena: `Build me a simple app called "${baseIdea}"

I am a beginner. Make it very simple and easy.

Use:
- Frontend: React + Tailwind (pretty)
- Backend: Node.js + Express
- Database: Supabase (memory box)
- AI: Google Gemini (only from backend)

What app does:
1. People can sign up and log in (bcrypt)
2. Main: ${baseIdea} - users add, see, edit, delete
3. AI: Use Gemini to help (summarize, etc)
4. Nice UI, works on phone

${commonSafety}

IMPORTANT FOR ARENA.AI:
I will send the supabase api url, anon key, service role key, and github access token and vercel access token and render api key, and gemini api key, can you connect to supabase and deploy in vercel and render and next create a repository in github and integrate ai in the app

After you build, ask me to send keys one by one. Then connect everything and deploy. Make .env file correctly and .gitignore that hides .env.

Start building now. When ready, ask for keys.`,

    default: `Build me a simple app called "${baseIdea}"

I am a beginner. Make it very simple.

Use: React + Tailwind (frontend), Node.js + Express (backend), Supabase (database), Gemini AI (backend only)

Features:
1. Sign up / log in safely
2. Main: ${baseIdea}
3. AI help with Gemini
4. Nice UI

${commonSafety}

Start now.`
  };

  return prompts[pathwayId] || prompts.default;
};

const sqlMigration = `-- Makes tables for your app - like boxes to store things
-- Copy ALL, go to Supabase -> SQL Editor -> New Query -> Paste -> RUN

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
    antigravity: 'Antigravity',
    antigravity2: 'Antigravity 2.0',
    arena: 'Arena.ai',
  }[pathwayId] || 'your tool';

  const toolLinks = {
    replit: 'https://replit.com',
    antigravity: 'https://antigravity.google',
    antigravity2: 'https://antigravity.google',
    arena: 'https://arena.ai',
  };

  const masterPrompt = getMasterPromptForPathway(pathwayId);

  // Pathway-specific microSteps for Step 2 and others
  const step2Micro = {
    replit: [
      { title: 'Open Replit', desc: 'Go to replit.com → Click Create Repl → Choose Blank or Import. No need to install anything, works in browser.', action: 'Open Replit in new tab', where: { url: 'https://replit.com', steps: ['Click Create Repl', 'Choose Blank Repl', 'Name it my-app'] } },
      { title: 'Find AI Agent', desc: 'On left side, look for sparkles icon ✨ labeled Replit Agent. Click it. This is your robot builder.', action: 'Click Replit Agent (sparkles icon)', where: { steps: ['Left sidebar → Find sparkles icon', 'Click Replit Agent'] } },
      { title: 'Paste magic words', desc: 'Copy your blueprint from Step 1, paste in Agent chat, press Enter. Watch it build client/ and server/ folders.', action: 'Paste blueprint and press Enter' },
      { title: 'Say continue if it stops', desc: 'If Agent pauses, type "continue" or "keep building". Don\'t edit files yourself!', action: 'Type continue if needed', warning: true },
    ],
    antigravity: [
      { title: 'Open Antigravity IDE', desc: 'Open Antigravity on your laptop. Create new folder called my-ai-app. Open that folder in IDE.', action: 'Create folder my-ai-app and open in IDE', where: { url: 'https://antigravity.google', steps: ['Create folder on Desktop: my-ai-app', 'Open Antigravity → Open Folder → Select my-ai-app'] } },
      { title: 'Open AI Chat', desc: 'Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows) → Type "Antigravity: New Chat" → Enter. This opens robot chat.', action: 'Open Command Palette → New Chat' },
      { title: 'Paste blueprint', desc: 'Paste your magic words from Step 1. Be specific with idea. Press Enter. It will create client/ and server/ folders.', action: 'Paste blueprint, press Enter' },
      { title: 'Install and run', desc: 'When it says, open terminal and run: cd client → npm install → npm run dev. Then new terminal: cd server → npm install → npm run dev. See if it loads at localhost.', action: 'Run npm install in both folders', warning: true },
    ],
    antigravity2: [
      { title: 'Open Antigravity 2.0', desc: 'Launch Antigravity 2.0 → Create Workspace → Name it my-app. Enable Multi-Agent Mode in settings.', action: 'Create Workspace, enable Multi-Agent' },
      { title: 'Paste to orchestrator', desc: 'In main orchestrator chat (top), paste blueprint. It will split work to Frontend Agent, Backend Agent, DB Agent.', action: 'Paste blueprint to orchestrator chat' },
      { title: 'Watch agents build', desc: 'You will see live file changes from 3 agents. Click Checkpoint often to save progress.', action: 'Watch files appear, click Checkpoint' },
      { title: 'Don\'t edit manually', desc: 'Let agents finish. If bug, tell orchestrator: "Fix this".', action: 'Let agents work', warning: true },
    ],
    arena: [
      { title: 'Open Arena.ai', desc: 'Go to arena.ai or z.ai → Click New Project. You will see big box: "What do you want to build?" No terminal here, just chat!', action: 'Open Arena.ai → New Project', where: { url: 'https://arena.ai', steps: ['Go to arena.ai', 'Click New Project', 'See big prompt box'] } },
      { title: 'Paste blueprint', desc: 'Paste your magic blueprint from Step 1 (replace [YOUR APP IDEA HERE] first!). Press Enter. Arena will start building and show preview on right side.', action: 'Paste blueprint in big box, press Enter' },
      { title: 'Watch preview', desc: 'Right side shows your app preview live. Left side shows files. Click Save Checkpoint often. This is visual, no terminal needed!', action: 'Watch preview, Save Checkpoint' },
      { title: 'Arena will ask for keys next', desc: 'After building, Arena will say "Send me your keys". Then you will send Supabase URL, anon key, service role, Gemini key one by one. It will connect everything automatically!', action: 'Wait for Arena to ask for keys', warning: false },
    ],
  };

  const step5Micro = {
    replit: [
      { title: 'Check bouncer file', desc: 'In Replit file list, open .gitignore. Should have .env, node_modules, dist. If missing, tell Agent: "Add .gitignore that hides .env"', action: 'Open .gitignore, check has .env' },
      { title: 'Create GitHub backpack', desc: 'In Replit sidebar, click Git icon (branch symbol) → Create Git Repo → Connect GitHub → Authorize.', action: 'Click Git icon → Create Repo' },
      { title: 'Push to GitHub', desc: 'Click Push button, message "my first app". Go to github.com to see your code. Search .env - should be 0 results!', action: 'Push and check no .env on GitHub', warning: true },
    ],
    antigravity: [
      { title: 'Check .gitignore', desc: 'Open .gitignore file. Must have .env, node_modules, dist inside. This stops secrets from going to GitHub.', action: 'Check .gitignore has .env' },
      { title: 'Create empty repo on GitHub', desc: 'Go to github.com/new → Name: my-ai-app → Public → DON\'T add README → Create → Copy URL.', action: 'Create empty public repo', where: { url: 'https://github.com/new', steps: ['Name: my-ai-app', 'Public', 'No README', 'Create'] } },
      { title: 'Push from terminal', desc: 'In Antigravity terminal (bottom), run: git init, git add ., git commit -m "app", git remote add origin YOUR_URL, git push -u origin main. Replace YOUR_URL with GitHub URL.', action: 'Run git commands in terminal' },
      { title: 'Check no secrets leaked', desc: 'On GitHub, press t, type .env → 0 results good! Search AIza → 0 results good! If leaked, delete repo and make new keys.', action: 'Check GitHub has no secrets', warning: true },
    ],
    antigravity2: [
      { title: 'Check .gitignore', desc: 'Antigravity 2.0 auto makes .gitignore. Check it has .env inside.', action: 'Check .gitignore' },
      { title: 'Publish to GitHub', desc: 'Source Control panel → Publish to GitHub → Choose repo name → Private first → Sync.', action: 'Publish to GitHub from IDE' },
      { title: 'Verify no secrets', desc: 'Check GitHub web - no .env or AIza keys visible.', action: 'Verify clean', warning: true },
    ],
    arena: [
      { title: 'Check bouncer exists', desc: 'Arena auto makes .gitignore. In file list, open .gitignore → Should have .env inside.', action: 'Open .gitignore, check .env' },
      { title: 'Export to GitHub', desc: 'Top right → Export → Push to GitHub → Authorize → Name: my-ai-app → Push. No terminal needed, Arena does it!', action: 'Click Export → Push to GitHub', where: { steps: ['Top right → Export button', 'Push to GitHub → Authorize', 'Name repo → Push'] } },
      { title: 'Check secrets not leaked', desc: 'Go to GitHub repo → Search .env → 0 results. Search AIza → 0 results. Good!', action: 'Check GitHub clean', warning: true },
    ],
  };

  const step6Micro = {
    replit: [
      { title: 'Backend already live!', desc: 'Replit already hosts your backend! In Replit webview, copy its URL (like https://your-repl.username.repl.co). That is your brain URL.', action: 'Copy Replit backend URL' },
      { title: 'Deploy frontend to Vercel', desc: 'Go to vercel.com → Add New Project → Import GitHub repo → Root: client → Add ENV: VITE_API_BASE_URL = your Replit URL → Deploy.', action: 'Deploy frontend to Vercel', where: { url: 'https://vercel.com/new', steps: ['Import GitHub repo', 'Root: client', 'Add VITE_API_BASE_URL = Replit URL', 'Deploy'] } },
      { title: 'Test live!', desc: 'Open Vercel URL in private window → Sign up → Use app → Should work!', action: 'Test live URL' },
    ],
    antigravity: [
      { title: 'Put brain on Render first', desc: 'Go to render.com → New Web Service → Connect GitHub repo → Root: server → Build: npm install → Start: npm start → Add ENV vars from server/.env → Deploy → Copy URL.', action: 'Deploy backend to Render', where: { url: 'https://dashboard.render.com', steps: ['New → Web Service → Connect repo', 'Root: server, Build: npm install, Start: npm start', 'Add ENV vars', 'Deploy → Copy URL'] } },
      { title: 'Put face on Vercel second', desc: 'vercel.com → New Project → Import same repo → Root: client → Add ENV: VITE_API_BASE_URL = Render URL → Deploy → Copy URL.', action: 'Deploy frontend to Vercel', where: { url: 'https://vercel.com/new', steps: ['Import repo', 'Root: client', 'Add VITE_API_BASE_URL = Render URL', 'Deploy'] } },
      { title: 'Connect them (fix CORS)', desc: 'Go BACK to Render → Environment → Add CLIENT_URL = Vercel URL → Save → Redeploy. This tells brain to allow face.', action: 'Set CLIENT_URL in Render = Vercel URL' },
      { title: 'Test live!', desc: 'Open Vercel URL in incognito → Sign up → AI works? Good!', action: 'Test live' },
    ],
    antigravity2: [
      { title: 'One-click deploy', desc: 'In Antigravity 2.0, click Deploy tab → Backend: Render → One-click → Frontend: Vercel → One-click. It auto-fills ENV!', action: 'Click Deploy tab → One-click' },
      { title: 'Check URLs', desc: 'Copy both URLs, test in incognito.', action: 'Test live URLs' },
    ],
    arena: [
      { title: 'Arena asks for deploy keys', desc: 'Arena will ask: "Send Vercel token and Render key". Send them one by one. Arena will deploy automatically! If it doesn\'t, you can do manual steps below.', action: 'Send deploy keys to Arena when asked' },
      { title: 'Manual: Brain on Render', desc: 'If Arena didn\'t auto-deploy: render.com → New Web Service → Connect GitHub repo → Root: server → Build: npm install → Start: npm start → ENV vars → Deploy.', action: 'Manual Render deploy if needed', where: { url: 'https://dashboard.render.com', steps: ['New → Web Service', 'Connect repo', 'Root: server'] } },
      { title: 'Manual: Face on Vercel', desc: 'vercel.com → New Project → Import repo → Root: client → VITE_API_BASE_URL = Render URL → Deploy.', action: 'Manual Vercel deploy', where: { url: 'https://vercel.com/new', steps: ['Import repo', 'Root: client'] } },
      { title: 'Test live!', desc: 'Open Vercel URL in private window, test sign up and AI.', action: 'Test live' },
    ],
  };

  return [
    {
      id: 1,
      title: 'Your Idea Blueprint',
      subtitle: 'Tell AI what to build',
      icon: '💡',
      color: 'from-cyan-400 to-blue-500',
      estimatedTime: '5 min',
      kidExplanation: 'Your robot friend needs exact instructions. Not "build car" but "build red car with 4 wheels". Write perfect instructions here.',
      oneBigAction: 'Change [YOUR APP IDEA HERE] to your real idea and copy',
      microSteps: [
        { title: 'Think of ONE simple idea', desc: 'What app do YOU need? Example: "App that turns my class notes into flashcards" or "Recipe app from fridge photo". Pick one you care about.', action: 'Write idea on paper - 1 sentence' },
        { title: 'Replace the [BRACKETS] part', desc: 'In box below, find [YOUR APP IDEA HERE]. Delete it, type your real idea. Be specific! Good: "todo app where AI makes daily plan".', action: 'Edit prompt - replace bracket text', copyable: true },
        { title: 'Copy the whole prompt', desc: 'Click Copy button below. Keeps all magic instructions. Keep tab open!', action: 'Click Copy button below', copyable: true },
      ],
      content: { type: 'blueprint', prompt: masterPrompt },
      mentorContext: 'Help kid pick simple idea with login + list + AI.',
    },
    {
      id: 2,
      title: 'Let Robot Build It',
      subtitle: `Use ${toolName}`,
      icon: '🤖',
      color: 'from-violet-400 to-purple-500',
      estimatedTime: '10 min',
      kidExplanation: `Give instructions to ${toolName} robot. It makes files automatically. Just watch and say "continue" if it stops. Don't touch code yourself!`,
      oneBigAction: `Open ${toolName} and paste your magic words`,
      microSteps: step2Micro[pathwayId] || step2Micro.arena,
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
      kidExplanation: 'App forgets when you refresh! We need cloud notebook called Supabase that never forgets. Free to make.',
      oneBigAction: 'Create Supabase project and copy 3 keys',
      microSteps: [
        { title: 'Go to Supabase', desc: 'Open supabase.com → Start your project → Sign in GitHub → New Project → Name: my-app-memory → Set password (write down!) → Choose region near you → Create → Wait 2 min.', action: 'Create project at supabase.com', where: { url: 'https://supabase.com', steps: ['Start your project', 'Sign in GitHub', 'New Project → Name: my-app-memory → Create → Wait'] } },
        { title: 'Copy 3 keys', desc: 'Project ready → Click Settings (gear) → API → See Project URL, anon key, service_role key. Copy each to notepad.', action: 'Copy URL, anon key, service_role', where: { url: 'https://supabase.com/dashboard/project/_/settings/api', steps: ['Settings → API', 'Copy Project URL (https://xxx.supabase.co)', 'Copy anon key (eyJ... long)', 'Copy service_role key (different long)'] }, keys: [{ name: 'Project URL', example: 'https://abcdefgh.supabase.co', what: 'Address of memory box - safe to show', safe: true }, { name: 'Anon Key', example: 'eyJhbG...', what: 'Public key - safe for frontend', safe: true }, { name: 'Service Role Key', example: 'eyJhbG... different', what: 'MASTER KEY - NEVER frontend, only server/.env', safe: false }] },
        { title: 'Run SQL to make tables', desc: 'Click SQL Editor → New Query → Copy SQL below → Paste → Click RUN green button. Creates boxes inside memory box.', action: 'Copy SQL → Paste in SQL Editor → RUN', copyable: true, sql: sqlMigration, where: { url: 'https://supabase.com/dashboard/project/_/sql', steps: ['SQL Editor → New Query', 'Paste SQL → RUN → Success'] } },
        { title: 'Tell robot to connect', desc: `Tell ${toolName}: "Connect Supabase. Put keys in server/.env: SUPABASE_URL=your_url, SUPABASE_ANON_KEY=anon, SUPABASE_SERVICE_ROLE_KEY=service_role. Never service_role in frontend!"`, action: 'Tell AI builder to connect Supabase' },
      ],
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
      oneBigAction: 'Get free Gemini key from Google',
      microSteps: [
        { title: 'Go to Google AI Studio', desc: 'Open aistudio.google.com/app/apikey → Sign in Google → Create API key → Create in new project → Copy key starting with AIza... (you see it only once!)', action: 'Get Gemini API key', where: { url: 'https://aistudio.google.com/app/apikey', steps: ['Go to aistudio.google.com/app/apikey', 'Create API Key → New Project', 'Copy AIza... key'] } },
        { title: 'Hide key safely', desc: 'Copy AIza... key. SECRET like house key! Hide in backend only, never frontend. If stolen, someone uses your free limit!', action: 'Copy AIza... key', keys: [{ name: 'GEMINI_API_KEY', example: 'AIzaSy...', what: 'Secret brain key - ONLY server/.env, never client or GitHub!', safe: false }] },
        { title: 'Tell robot where to hide', desc: 'Tell builder: "Add Gemini. Put GEMINI_API_KEY in server/.env. Make backend route POST /api/ai/generate that calls Gemini from backend only. Frontend calls backend, not Google directly."', action: 'Tell AI: put key in server/.env, backend only' },
        { title: 'Test brain', desc: 'Try AI feature in app. Press F12 → Network tab → Try AI → Should NOT see AIza key in requests. If you see it, wrong place!', action: 'Test AI, check Network has no AIza', warning: true },
      ],
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
      oneBigAction: 'Push code to GitHub without secrets',
      microSteps: step5Micro[pathwayId] || step5Micro.arena,
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
      kidExplanation: 'App only works on YOUR computer. Put on internet so anyone can use! Render = brain lives, Vercel = face lives. Brain first!',
      oneBigAction: 'Deploy brain to Render first, then face to Vercel',
      microSteps: step6Micro[pathwayId] || step6Micro.arena,
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
