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
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[560px] mx-auto px-4 sm:px-6 py-8">
        <Link to="/wizard" className="text-xs text-gray-500 hover:text-gray-700 mb-6 inline-flex">← Back to Steps</Link>
        
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-gray-900">Final Checklist</h1>
          <p className="text-[13px] text-gray-500 mt-1">{completed}/{total} done • Do all before submitting</p>
          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden mt-4 max-w-[320px] mx-auto">
            <div className="h-full bg-gray-900 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-[20px] bg-white border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {checklistItems.map(item => {
            const done = checklist[item.id];
            return (
              <label key={item.id} className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 ${done ? 'opacity-60' : ''}`}>
                <input type="checkbox" checked={!!done} onChange={() => toggleChecklist(item.id)} className="sr-only" />
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${done ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-300 bg-white'}`}>
                  {done && <Check className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.text}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                {item.critical && !done && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">MUST</span>}
              </label>
            );
          })}
        </div>

        <button onClick={handleExport} className="w-full mt-6 py-3 rounded-full bg-gray-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 shadow-sm">
          <Download className="w-4 h-4" /> {copied ? 'Copied & Downloaded!' : 'Export Submission MD'}
        </button>

        {progress === 100 && (
          <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
            <p className="text-sm font-bold text-emerald-700">Ready to ship! 🚀</p>
            <p className="text-xs text-gray-500 mt-1">Paste exported markdown into hackathon form</p>
          </div>
        )}
      </div>
    </div>
  );
}
