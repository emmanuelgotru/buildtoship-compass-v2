import { useStore } from '../store/useStore';
import { Compass, MessageCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, setMentorOpen, currentStep, selectedPathway } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide header on auth page (first screen)
  if (location.pathname === '/' && !user) return null;

  const isWizard = location.pathname === '/wizard';

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[#0B0F19]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 h-[56px] flex items-center justify-between">
        <Link to={user ? "/pathways" : "/"} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[14px] text-white tracking-tight">BuildToShip</span>
          {isWizard && selectedPathway && (
            <span className="hidden sm:inline-flex ml-3 pl-3 border-l border-white/10 text-[11px] text-white/40">Step {currentStep}/6</span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMentorOpen(true, isWizard ? `Step ${currentStep}` : 'General')}
            className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black text-[13px] font-bold hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Mentor</span>
            <span className="sm:hidden">Help</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#0B0F19] animate-pulse" />
          </button>
        </div>
      </div>
      {isWizard && (
        <div className="h-[2px] w-full bg-white/[0.06]">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500" style={{ width: `${(currentStep / 6) * 100}%` }} />
        </div>
      )}
    </header>
  );
}
