import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Compass, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const { user, signup, login, setGuest, authError, clearAuthError } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signup'); // signup | login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState('');

  // If already logged in, go to pathways
  if (user) {
    navigate('/pathways', { replace: true });
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    if (!email || !password) {
      setLocalError('Please fill all fields');
      return;
    }
    if (mode === 'signup') {
      if (password !== confirm) {
        setLocalError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      const ok = signup(email.trim().toLowerCase(), password, email.split('@')[0]);
      if (ok) navigate('/pathways');
    } else {
      const ok = login(email.trim().toLowerCase(), password);
      if (ok) navigate('/pathways');
    }
  };

  const handleGuest = () => {
    setGuest();
    navigate('/pathways');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-full bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-white">BuildToShip Compass</h1>
          <p className="text-[13px] text-white/50 mt-1">Zero to deployed in 6 simple steps</p>
        </div>

        {/* Auth Card - Super Simple */}
        <div className="rounded-[24px] glass-strong border border-white/[0.08] p-6 sm:p-7">
          <div className="flex rounded-full bg-white/[0.06] p-1 mb-6">
            <button
              onClick={() => { setMode('signup'); setLocalError(''); clearAuthError(); }}
              className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all ${mode === 'signup' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'}`}
            >
              Sign up
            </button>
            <button
              onClick={() => { setMode('login'); setLocalError(''); clearAuthError(); }}
              className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all ${mode === 'login' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'}`}
            >
              Log in
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-white/40 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full px-4 py-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-white/40 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 pr-11 rounded-full bg-white/[0.06] border border-white/[0.08] text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-colors"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white/70">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-semibold tracking-wider uppercase text-white/40 mb-1.5 block">Confirm Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-colors"
                  required
                />
              </div>
            )}

            {(localError || authError) && (
              <div className="px-4 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-[12px] text-red-300">
                {localError || authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-white text-black font-bold text-[14px] hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {mode === 'signup' ? 'Create account' : 'Log in'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-white/20">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={handleGuest}
            className="w-full py-3 rounded-full glass border border-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.08] font-medium text-[13px] transition-colors"
          >
            Continue as Guest
          </button>

          <p className="text-[11px] leading-[1.4] text-white/30 text-center mt-4">
            Progress saved to your email. Log in on another device to continue. Guest progress stays on this device only.
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-white/[0.06] text-[11px] text-white/40">
            <Sparkles className="w-3 h-3" /> No spam • Works offline • Free forever
          </p>
        </div>
      </div>
    </div>
  );
}
