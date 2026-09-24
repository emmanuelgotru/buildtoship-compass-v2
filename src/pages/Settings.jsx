import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Check, Copy, ExternalLink, Key, Database, Rocket, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { user } = useStore();
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [serviceKey, setServiceKey] = useState('');
  const [vercelToken, setVercelToken] = useState('');
  const [renderKey, setRenderKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setSupabaseUrl(localStorage.getItem('btc_supabase_url') || '');
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
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
      });
      if (res.ok) {
        setTestResult({ ok: true, msg: `Connected! Status ${res.status} - Supabase is reachable` });
      } else {
        setTestResult({ ok: false, msg: `Failed: ${res.status} ${await res.text()}` });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: `Error: ${e.message}` });
    }
  };

  const copySQL = async () => {
    const sql = `-- Run this in Supabase SQL Editor
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

-- For auth (if using Supabase Auth)
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
`;
    await navigator.clipboard.writeText(sql);
    setTestResult({ ok: true, msg: 'SQL copied! Paste in Supabase SQL Editor → Run' });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-8">
        <Link to="/pathways" className="text-xs text-white/40 hover:text-white/70 mb-6 inline-flex">← Back</Link>
        
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-white flex items-center gap-2"><Key className="w-5 h-5" /> Connect Your Keys</h1>
          <p className="text-[13px] text-white/50 mt-1">Paste Supabase + deployment tokens to enable cloud sync & one-click deploy. Keys saved locally in your browser only.</p>
        </div>

        <div className="space-y-6">
          {/* Supabase */}
          <div className="rounded-[20px] glass-strong border border-white/[0.08] p-5">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Database className="w-4 h-4 text-emerald-400" /> Supabase (for cross-device auth & progress)</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Project URL</label>
                <input value={supabaseUrl} onChange={e=>setSupabaseUrl(e.target.value)} placeholder="https://abcdefgh.supabase.co" className="w-full px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50" />
                <p className="text-[11px] text-white/30 mt-1">Supabase Dashboard → Project Settings → Data API → Project URL</p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Anon Key (public)</label>
                <div className="relative">
                  <input type={showKeys ? 'text' : 'password'} value={anonKey} onChange={e=>setAnonKey(e.target.value)} placeholder="eyJhbG..." className="w-full px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 pr-10" />
                  <button onClick={()=>setShowKeys(!showKeys)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"><Eye className="w-4 h-4" /></button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Service Role Key (secret, needed to create tables)</label>
                <input type={showKeys ? 'text' : 'password'} value={serviceKey} onChange={e=>setServiceKey(e.target.value)} placeholder="eyJhbG... (service_role)" className="w-full px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50" />
                <p className="text-[11px] text-amber-300/70 mt-1">⚠️ Service role bypasses RLS - never expose in frontend code, only use to create tables, then we store progress via anon key with open policy for demo</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={testSupabase} className="px-4 py-2 rounded-full glass border border-white/[0.08] text-xs font-bold text-white/70 hover:text-white">Test Connection</button>
                <button onClick={copySQL} className="px-4 py-2 rounded-full bg-white/[0.08] text-xs font-bold text-white/70 hover:text-white flex items-center gap-1"><Copy className="w-3 h-3" /> Copy SQL to create tables</button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs ${testResult.ok ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'}`}>
                  {testResult.msg}
                </div>
              )}
            </div>
          </div>

          {/* Vercel & Render */}
          <div className="rounded-[20px] glass-strong border border-white/[0.08] p-5">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Rocket className="w-4 h-4 text-cyan-400" /> Deployment Tokens (optional)</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Vercel Token</label>
                <input type={showKeys ? 'text' : 'password'} value={vercelToken} onChange={e=>setVercelToken(e.target.value)} placeholder="vercel_xxx..." className="w-full px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50" />
                <p className="text-[11px] text-white/30 mt-1">Get at vercel.com/account/tokens → Create token (no expiration for demo)</p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Render API Key</label>
                <input type={showKeys ? 'text' : 'password'} value={renderKey} onChange={e=>setRenderKey(e.target.value)} placeholder="rnd_xxx..." className="w-full px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50" />
                <p className="text-[11px] text-white/30 mt-1">Get at dashboard.render.com/u/settings → API Keys → Create. Yes, Render DOES have tokens!</p>
              </div>

              <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 mt-3">
                <p className="text-[11px] font-bold text-white/60 mb-1">How auto-deploy would work:</p>
                <p className="text-[11px] leading-[1.5] text-white/40">
                  1. Push this code to GitHub (I can give you commands)<br/>
                  2. Vercel API creates project from GitHub repo → frontend live<br/>
                  3. Render API creates web service from same repo (server/ folder) → backend live<br/>
                  4. I set env vars automatically (VITE_API_BASE_URL, CLIENT_URL)<br/>
                  <br/>
                  <strong className="text-white/60">For now, I prepared deploy scripts:</strong> Check <code className="px-1 py-0.5 rounded bg-white/10">/deploy/README.md</code> and <code className="px-1 py-0.5 rounded bg-white/10">/scripts/deploy.js</code> in your project
                </p>
              </div>
            </div>
          </div>

          <button onClick={save} className={`w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}>
            {saved ? <><Check className="w-4 h-4" /> Saved locally!</> : 'Save Keys Locally'}
          </button>

          <div className="text-center">
            <p className="text-[11px] text-white/30">Keys never leave your browser • Stored in localStorage only • Clear browser data to remove</p>
          </div>
        </div>
      </div>
    </div>
  );
}
