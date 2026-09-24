import { useStore } from '../store/useStore';
import { Compass, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { user, setMentorOpen, currentStep, selectedPathway } = useStore();
  const location = useLocation();
  
  if (location.pathname === '/' && !user) return null;

  const isWizard = location.pathname === '/wizard';

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 h-[56px] flex items-center justify-between">
        <Link to={user ? "/pathways" : "/"} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[14px] text-gray-900 tracking-tight">BuildToShip</span>
          {isWizard && selectedPathway && (
            <span className="hidden sm:inline-flex ml-3 pl-3 border-l border-gray-200 text-[11px] text-gray-500">Step {currentStep}/6</span>
          )}
        </Link>

        <button
          onClick={() => setMentorOpen(true, isWizard ? `Step ${currentStep}` : 'General')}
          className="relative flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-[13px] font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Ask Mentor</span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      </div>
      {isWizard && (
        <div className="h-[2px] w-full bg-gray-100">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-500" style={{ width: `${(currentStep / 6) * 100}%` }} />
        </div>
      )}
    </header>
  );
}
