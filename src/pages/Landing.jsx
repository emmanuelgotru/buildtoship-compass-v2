import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Compass, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const { user, signup, login, setGuest, authError, clearAuthError } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState('');

  if (user) {
    navigate('/pathways', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
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
      const ok = await signup(email.trim().toLowerCase(), password, email.split('@')[0]);
      if (ok) navigate('/pathways');
    } else {
      const ok = await login(email.trim().toLowerCase(), password);
      if (ok) navigate('/pathways');
    }
  };

  const handleGuest = () => {
    setGuest();
    navigate('/pathways');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-full bg-gradient-to-br from-cyan-100 to-indigo-100 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 items-center justify-center shadow-lg shadow-indigo-500/10 mb-4">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-gray-900">BuildToShip Compass</h1>
          <p className="text-[13px] text-gray-500 mt-1">Zero to deployed in 6 simple steps</p>
        </div>

        <div className="rounded-[24px] bg-white border border-gray-200 shadow-sm p-6 sm:p-7">
          <div className="flex rounded-full bg-gray-100 p-1 mb-6">
            <button
              onClick={() => { setMode('signup'); setLocalError(''); clearAuthError(); }}
              className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all ${mode === 'signup' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign up
            </button>
            <button
              onClick={() => { setMode('login'); setLocalError(''); clearAuthError(); }}
              className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all ${mode === 'login' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Log in
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 pr-11 rounded-full bg-gray-50 border border-gray-200 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 mb-1.5 block">Confirm Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                  required
                />
              </div>
            )}

            {(localError || authError) && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-700">
                {localError || authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gray-900 text-white font-bold text-[14px] hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {mode === 'signup' ? 'Create account' : 'Log in'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            onClick={handleGuest}
            className="w-full py-3 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium text-[13px] transition-colors shadow-sm"
          >
            Continue as Guest
          </button>

          <p className="text-[11px] leading-[1.5] text-gray-400 text-center mt-4">
            Progress saved to your email. Log in on another device to continue.
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-[11px] text-gray-500 shadow-sm">
            <Sparkles className="w-3 h-3" /> No spam • Works offline • Free forever
          </p>
        </div>
      </div>
    </div>
  );
}
