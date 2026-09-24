import { useStore } from '../store/useStore';
import { pathways } from '../data/pathways';
import { ArrowRight, Check, Compass, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PathwaySelect() {
  const { user, isGuest, logout, setPathway, selectedPathway } = useStore();
  const navigate = useNavigate();

  const handleSelect = (id) => {
    setPathway(id);
    navigate('/wizard');
  };

  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[70%] h-[50%] rounded-full bg-gradient-to-br from-cyan-100 to-indigo-100 blur-[60px]" />
      </div>

      <div className="relative mx-auto max-w-[960px] px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900">BuildToShip Compass</p>
              <p className="text-[11px] text-gray-500">Hi, {user.name} • {isGuest ? 'Guest' : user.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="max-w-[640px] mx-auto text-center mb-10">
          <h1 className="text-[28px] sm:text-[34px] font-[800] tracking-tight leading-[0.95] text-gray-900 mb-3">
            Choose your weapon
          </h1>
          <p className="text-[14px] leading-[1.5] text-gray-500">
            All paths lead to same deployment. Pick what feels easiest. You can change anytime.
          </p>
          {selectedPathway && (
            <p className="mt-4 inline-flex px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
              Currently: {pathways.find(p => p.id === selectedPathway)?.name} • Click another to switch
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[720px] mx-auto">
          {pathways.map(p => {
            const isSelected = selectedPathway === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`group text-left relative rounded-[20px] p-[1.5px] transition-all hover:scale-[1.01] ${isSelected ? 'scale-[1.01]' : ''}`}
              >
                <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${p.color} opacity-60 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`} />
                <div className={`relative rounded-[18px] border p-5 h-full flex flex-col transition-colors ${isSelected ? 'bg-gray-900 border-gray-900' : 'bg-white border-white'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-[18px] shadow-sm`}>
                      {p.icon}
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <h3 className={`font-bold text-[16px] ${isSelected ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                  <p className={`text-[12px] font-medium mb-2 ${isSelected ? 'text-white/60' : 'text-gray-500'}`}>{p.subtitle}</p>
                  <p className={`text-[13px] leading-[1.4] mb-4 flex-1 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>{p.description}</p>
                  <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${isSelected ? 'text-white/80' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    Select <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-[720px] mx-auto mt-8 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <span className="text-sm">💡</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-900">Not sure?</p>
            <p className="text-[12px] leading-[1.5] text-gray-500 mt-0.5">
              <strong className="text-gray-700">Replit</strong> = easiest, no installs, browser only. <strong className="text-gray-700">Arena.ai</strong> = prompt-to-app, live preview, no terminal. 
              <strong className="text-gray-700">Antigravity / ZCode</strong> = local IDE, more control. Pick one — progress saved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
