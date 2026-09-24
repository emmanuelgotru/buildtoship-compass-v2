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
    <div className="min-h-screen bg-[#0B0F19] relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[70%] h-[50%] rounded-full bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[960px] px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">BuildToShip Compass</p>
              <p className="text-[11px] text-white/50">Hi, {user.name} • {isGuest ? 'Guest' : user.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-full glass border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/10">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="max-w-[640px] mx-auto text-center mb-10">
          <h1 className="text-[28px] sm:text-[34px] font-[800] tracking-tight leading-[0.95] text-white mb-3">
            Choose your weapon
          </h1>
          <p className="text-[14px] leading-[1.5] text-white/50">
            All paths lead to same deployment. Pick what feels easiest. You can change anytime.
          </p>
          {selectedPathway && (
            <p className="mt-4 inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
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
                className={`group text-left relative rounded-[20px] p-[1px] transition-all hover:scale-[1.01] ${isSelected ? 'scale-[1.01]' : ''}`}
              >
                <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${p.color} opacity-60 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`} />
                <div className="relative rounded-[19px] bg-[#151C2C] border border-white/[0.06] p-5 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-[18px] shadow-lg`}>
                      {p.icon}
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-[16px]">{p.name}</h3>
                  <p className="text-[12px] font-medium text-white/50 mb-2">{p.subtitle}</p>
                  <p className="text-[13px] leading-[1.4] text-white/60 mb-4 flex-1">{p.description}</p>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white/70 group-hover:text-white">
                    Select <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-[720px] mx-auto mt-8 p-4 rounded-2xl glass border border-white/[0.06] flex gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <span className="text-sm">💡</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white">Not sure?</p>
            <p className="text-[12px] leading-[1.5] text-white/50 mt-0.5">
              <strong className="text-white/80">Replit</strong> = easiest, no installs. <strong className="text-white/80">Arena.ai</strong> = fastest if you like prompting. 
              Antigravity = more control locally. Pick one, you can switch later — progress is saved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
