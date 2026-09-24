import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Header from './components/Header';
import Landing from './pages/Landing';
import PathwaySelect from './pages/PathwaySelect';
import Wizard from './pages/Wizard';
import Checklist from './pages/Checklist';
import Settings from './pages/Settings';
import MentorModal from './components/MentorModal';
import Confetti from './components/Confetti';

function App() {
  const { showConfetti } = useStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-cyan-500/30 selection:text-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/pathways" element={<PathwaySelect />} />
            <Route path="/wizard" element={<Wizard />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <MentorModal />
        <Confetti active={showConfetti} />
        
        <footer className="border-t border-white/[0.06] py-4 mt-auto">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 flex items-center justify-between text-[11px] text-white/30">
            <span>BuildToShip Compass v2 • Simple Mode • <a href="/settings" className="underline hover:text-white/60">Connect Supabase & Deploy Tokens</a></span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Progress saved by email</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
