import { useStore } from '../store/useStore';
import { checklistItems } from '../data/steps';
import { Check, Download } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Checklist() {
  const { checklist, toggleChecklist, user } = useStore();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  const completed = Object.values(checklist).filter(Boolean).length;
  const total = checklistItems.length;
  const progress = (completed / total) * 100;

  const generateMarkdown = () => {
    const date = new Date().toLocaleDateString();
    return `# BuildToShip Submission - ${date}
Live: https://your-app.vercel.app
Backend: https://your-app-backend.onrender.com
GitHub: https://github.com/you/repo

Checklist:
${checklistItems.map(item => `- [${checklist[item.id] ? 'x' : ' '}] ${item.text}`).join('\n')}

Progress: ${completed}/${total}
`;
  };

  const handleExport = async () => {
    const md = generateMarkdown();
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submission.md';
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-[560px] mx-auto px-4 sm:px-6 py-8">
        <Link to="/wizard" className="text-xs text-white/40 hover:text-white/70 mb-6 inline-flex">← Back to Steps</Link>
        
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-white">Final Checklist</h1>
          <p className="text-[13px] text-white/50 mt-1">{completed}/{total} done • Do all before submitting</p>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-4 max-w-[320px] mx-auto">
            <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-[20px] glass-strong border border-white/[0.08] overflow-hidden divide-y divide-white/[0.06]">
          {checklistItems.map(item => {
            const done = checklist[item.id];
            return (
              <label key={item.id} className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-white/[0.03] ${done ? 'opacity-60' : ''}`}>
                <input type="checkbox" checked={!!done} onChange={() => toggleChecklist(item.id)} className="sr-only" />
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${done ? 'bg-white border-white text-black' : 'border-white/20'}`}>
                  {done && <Check className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium ${done ? 'text-white/50 line-through' : 'text-white'}`}>{item.text}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{item.description}</p>
                </div>
                {item.critical && !done && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold">MUST</span>}
              </label>
            );
          })}
        </div>

        <button onClick={handleExport} className="w-full mt-6 py-3 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90">
          <Download className="w-4 h-4" /> {copied ? 'Copied & Downloaded!' : 'Export Submission MD'}
        </button>

        {progress === 100 && (
          <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
            <p className="text-sm font-bold text-emerald-300">Ready to ship! 🚀</p>
            <p className="text-xs text-white/50 mt-1">Paste the exported markdown into hackathon form</p>
          </div>
        )}
      </div>
    </div>
  );
}
