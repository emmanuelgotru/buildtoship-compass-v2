import { useState, useEffect } from 'react';
import { Check, Copy, ExternalLink, Key, Database, Rocket, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [serviceKey, setServiceKey] = useState('');
  const [vercelToken, setVercelToken] = useState('');
  const [renderKey, setRenderKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setSupabaseUrl(localStorage.getItem('btc_supabase_url') || 'https://gnrphhtndvihayqoeghn.supabase.co');
    setAnonKey(localStorage.getItem('btc_supabase_anon') || '');
    setServiceKey(localStorage.getItem('btc_supabase_service') || '');
    setVercelToken(localStorage.getItem('btc_vercel_token') || '');
    setRenderKey(localStorage.getItem('btc_render_key') || '');
  }, []);

  const save = () => {
    localStorage.setItem('btc_supabase_url', supabaseUrl.trim());
    localStorage.setItem('btc_supabase_anon', anonKey.trim());
    localStorage.setItem('btc_supabase_service', serviceKey.trim());
    localStorage.setItem('btc_vercel_token', vercelToken.trim());
    localStorage.setItem('btc_render_key', renderKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testSupabase = async () => {
    if (!supabaseUrl || !anonKey) {
      setTestResult({ ok: false, msg: 'Need URL + anon key' });
      return;
    }
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/compass_users?select=*&limit=1`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
      });
      if (res.ok) {
        setTestResult({ ok: true, msg: `Connected! Tables exist - cloud sync enabled` });
      } else {
        const txt = await res.text();
        setTestResult({ ok: false, msg: `Status ${res.status}: ${txt.slice(0,200)} - Run SQL in SQL Editor` });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: `Error: ${e.message}` });
    }
  };

  const copySQL = async () => {
    const sql = `-- For BuildToShip Compass cloud sync (progress across devices)
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

-- For YOUR app (generic starter - works for any project, customize items table for your idea!)
create extension if not exists "uuid-ossp";
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  created_at timestamp default now()
);
create table if not exists public.items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  ai_summary text,
  created_at timestamp default now()
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
    await navigator.clipboard.writeText(sql);
    setTestResult({ ok: true, msg: 'SQL copied! Paste in Supabase SQL Editor → RUN' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-8">
        <Link to="/pathways" className="text-xs text-gray-500 hover:text-gray-700 mb-6 inline-flex">← Back</Link>
        
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2"><Key className="w-5 h-5" /> Connect Your Keys</h1>
          <p className="text-[13px] text-gray-500 mt-1">Paste Supabase + deploy tokens to enable cloud sync & auto-deploy. Keys saved locally only.</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-[20px] bg-white border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Database className="w-4 h-4 text-emerald-600" /> Supabase (for cross-device progress)</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Project URL</label>
                <input value={supabaseUrl} onChange={e=>setSupabaseUrl(e.target.value)} placeholder="https://abcdefgh.supabase.co" className="w-full px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-300 focus:bg-white" />
                <p className="text-[11px] text-gray-400 mt-1">Supabase → Settings → Data API → Project URL (NOT /rest/v1/ path, just https://xxx.supabase.co)</p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Anon Key (public)</label>
                <div className="relative">
                  <input type={showKeys ? 'text' : 'password'} value={anonKey} onChange={e=>setAnonKey(e.target.value)} placeholder="eyJhbG..." className="w-full px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-300 pr-10" />
                  <button onClick={()=>setShowKeys(!showKeys)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Eye className="w-4 h-4" /></button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Settings → API → anon public key — safe for frontend</p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Service Role Key (secret)</label>
                <input type={showKeys ? 'text' : 'password'} value={serviceKey} onChange={e=>setServiceKey(e.target.value)} placeholder="eyJhbG... service_role" className="w-full px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-300" />
                <p className="text-[11px] text-amber-600 mt-1">MASTER KEY - only for creating tables, never in frontend code!</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={testSupabase} className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-gray-800">Test Connection</button>
                <button onClick={copySQL} className="px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1"><Copy className="w-3 h-3" /> Copy SQL</button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs border ${testResult.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {testResult.msg}
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-[11px] font-bold text-blue-800">Does this SQL work for any project?</p>
                <p className="text-[11px] leading-[1.5] text-blue-700 mt-1">Yes! <strong>compass_users + compass_progress</strong> tables are for THIS Compass app (saves your progress across devices). <strong>profiles + items</strong> tables are generic starter for YOUR app — works for any project (todo, notes, recipes). You should customize items table columns for your specific idea, but it will work as-is for MVP.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Rocket className="w-4 h-4 text-indigo-600" /> Deployment Tokens</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Vercel Token</label>
                <input type={showKeys ? 'text' : 'password'} value={vercelToken} onChange={e=>setVercelToken(e.target.value)} placeholder="vercel_xxx..." className="w-full px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-[13px] text-gray-900 placeholder:text-gray-400" />
                <p className="text-[11px] text-gray-400 mt-1">vercel.com/account/tokens → Create token</p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Render API Key</label>
                <input type={showKeys ? 'text' : 'password'} value={renderKey} onChange={e=>setRenderKey(e.target.value)} placeholder="rnd_xxx..." className="w-full px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-[13px] text-gray-900 placeholder:text-gray-400" />
                <p className="text-[11px] text-gray-400 mt-1">dashboard.render.com/u/settings → API Keys → Create. Yes, Render HAS tokens!</p>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 mt-3">
                <p className="text-[11px] font-bold text-gray-700 mb-1">How AI uses tokens to deploy:</p>
                <p className="text-[11px] leading-[1.5] text-gray-500">
                  Yes! When you give Arena.ai / Z.ai your tokens in chat, it can:<br/>
                  1. Create GitHub repo via GitHub API (using ghp_ token)<br/>
                  2. Push code to repo<br/>
                  3. Create Vercel project via Vercel API (vercel_ token) + deploy<br/>
                  4. Create Render service via Render API (rnd_ token) + deploy<br/>
                  5. Set env vars automatically<br/>
                  Our prompt tells Arena to ask for keys after building, then connect everything.
                </p>
              </div>
            </div>
          </div>

          <button onClick={save} className={`w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${saved ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
            {saved ? <><Check className="w-4 h-4" /> Saved locally!</> : 'Save Keys Locally'}
          </button>

          <p className="text-[11px] text-gray-400 text-center">Keys in localStorage only • Never sent to our server • Clear browser to remove</p>
        </div>
      </div>
    </div>
  );
}
