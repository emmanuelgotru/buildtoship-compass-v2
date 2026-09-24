import { ArrowRight, Check, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function PathwayCard({ pathway, selected }) {
  const setPathway = useStore(s => s.setPathway);
  const navigate = useNavigate();

  const handleSelect = () => {
    setPathway(pathway.id);
    navigate('/wizard');
  };

  return (
    <div
      onClick={handleSelect}
      className={`group relative rounded-[20px] p-[1px] cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selected ? 'scale-[1.02]' : ''}`}
    >
      <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${pathway.color} opacity-60 group-hover:opacity-100 transition-opacity blur-[1px]`} />
      <div className="relative h-full rounded-[19px] glass-strong p-5 sm:p-6 flex flex-col overflow-hidden">
        {/* Glow orb */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${pathway.color} opacity-[0.15] blur-2xl group-hover:opacity-[0.25] transition-opacity`} />
        
        <div className="relative flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pathway.color} flex items-center justify-center text-xl shadow-lg ${pathway.glow} group-hover:scale-110 transition-transform`}>
            {pathway.icon}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r ${pathway.color} text-white shadow`}>
              {pathway.badge}
            </span>
            <span className="text-[11px] font-medium text-white/50 flex items-center gap-1">
              <Zap className="w-3 h-3" /> {pathway.level}
            </span>
          </div>
        </div>

        <h3 className="relative text-[18px] font-bold text-white tracking-tight">{pathway.name}</h3>
        <p className="relative text-[13px] font-medium text-white/60 -mt-0.5 mb-2">{pathway.subtitle}</p>
        <p className="relative text-[13.5px] leading-[1.5] text-white/70 mb-4 flex-1">{pathway.description}</p>

        <div className="relative flex flex-wrap gap-1.5 mb-5">
          {pathway.pros.map(p => (
            <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] font-medium text-white/70">
              <Check className="w-3 h-3 text-emerald-400" /> {p}
            </span>
          ))}
        </div>

        <div className="relative flex items-center justify-between mt-auto">
          <span className="text-xs font-semibold text-white/40 group-hover:text-white/70 transition-colors">Select pathway →</span>
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${pathway.color} flex items-center justify-center text-white shadow-lg group-hover:translate-x-0.5 transition-transform`}>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
