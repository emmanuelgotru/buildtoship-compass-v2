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
      <div className="min-h-screen bg-[#F8FAFC] text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
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
        
        <footer className="border-t border-gray-200 bg-white py-4 mt-auto">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 flex items-center justify-between text-[11px] text-gray-400">
            <span>BuildToShip Compass v3 • Light & Simple • <a href="/settings" className="underline hover:text-gray-600">Connect Supabase & Deploy Tokens</a></span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Progress saved by email + Supabase</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
