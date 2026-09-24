import { useState } from 'react';
import { useStore } from '../store/useStore';
import { getStepsForPathway } from '../data/steps';
import { pathways } from '../data/pathways';
import { Check, ChevronLeft, Menu, Copy, ExternalLink, Lightbulb, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function CopyBox({ text, label, previewLines = 2 }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const lines = text.split('\n');
  const preview = lines.slice(0, previewLines).join('\n');

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-[11px] font-semibold tracking-wide text-gray-500">{label}</span>
        <button onClick={copy} className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
          <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4">
        <pre className="text-[12px] leading-[1.7] font-mono text-gray-700 whitespace-pre-wrap break-words">
          {expanded ? text : preview}
          {!expanded && lines.length > previewLines && '\n...'}
        </pre>
        {lines.length > previewLines && (
          <button onClick={() => setExpanded(!expanded)} className="mt-3 text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
            {expanded ? <><EyeOff className="w-3 h-3" /> Show less</> : <><Eye className="w-3 h-3" /> Show {lines.length - previewLines} more lines</>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Wizard() {
  const { selectedPathway, currentStep, completedSteps, completeStep, goToStep, setMentorOpen, triggerConfetti, sidebarCollapsed, setSidebarCollapsed, user } = useStore();
  const navigate = useNavigate();
  const [microIndex, setMicroIndex] = useState(0);

  if (!user) {
    navigate('/', { replace: true });
    return null;
  }
  if (!selectedPathway) {
    navigate('/pathways', { replace: true });
    return null;
  }

  const steps = getStepsForPathway(selectedPathway);
  const step = steps[currentStep - 1];
  const pathway = pathways.find(p => p.id === selectedPathway);
  const isCompleted = completedSteps.includes(step.id);
  const microSteps = step.microSteps || [];
  const currentMicro = microSteps[microIndex];
  const isLastMicro = microIndex === microSteps.length - 1;
  const isFirstMicro = microIndex === 0;

  const handleNextMicro = () => {
    if (!isLastMicro) {
      setMicroIndex(microIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (!isCompleted) triggerConfetti();
      completeStep(step.id);
      setMicroIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevMicro = () => {
    if (!isFirstMicro) {
      setMicroIndex(microIndex - 1);
    } else if (currentStep > 1) {
      goToStep(currentStep - 1);
      setMicroIndex(0);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepChange = (newStep) => {
    goToStep(newStep);
    setMicroIndex(0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <aside className={`${sidebarCollapsed ? 'w-0 lg:w-[72px]' : 'w-[260px]'} shrink-0 transition-all duration-300 overflow-hidden border-r border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen`}>
        <div className="p-4">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-8`}>
            {!sidebarCollapsed && (
              <Link to="/pathways" className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pathway.color} flex items-center justify-center text-[16px] shadow-sm`}>{pathway.icon}</div>
                <div>
                  <p className="text-[13px] font-bold text-gray-900 leading-none">{pathway.name}</p>
                  <p className="text-[10px] text-gray-500">Build path</p>
                </div>
              </Link>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {!sidebarCollapsed ? (
            <>
              <div className="space-y-1">
                {steps.map(s => {
                  const done = completedSteps.includes(s.id);
                  const active = currentStep === s.id;
                  return (
                    <button key={s.id} onClick={() => handleStepChange(s.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${active ? 'bg-gray-900 text-white shadow-sm' : done ? 'bg-gray-50 text-gray-700 border border-gray-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${active ? 'bg-white text-gray-900' : done ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{done ? <Check className="w-4 h-4" /> : s.id}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold leading-tight truncate">{s.title}</p>
                        <p className={`text-[11px] leading-tight truncate ${active ? 'text-white/60' : 'text-gray-400'}`}>{s.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex justify-between text-[11px] text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>{completedSteps.length}/6</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-gray-900 transition-all duration-500" style={{ width: `${(completedSteps.length/6)*100}%` }} />
                </div>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-2">
              {steps.map(s => {
                const done = completedSteps.includes(s.id);
                const active = currentStep === s.id;
                return (
                  <button key={s.id} onClick={() => { setSidebarCollapsed(false); handleStepChange(s.id); }} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-gray-900 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{done ? <Check className="w-4 h-4" /> : s.id}</button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between p-4 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-full bg-gray-100 text-gray-600"><Menu className="w-5 h-5" /></button>
          <span className="text-sm font-bold text-gray-900">Step {currentStep} • {microIndex+1}/{microSteps.length}</span>
          <div className="w-9" />
        </div>

        <div className="max-w-[600px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
          <div className="mb-8 text-center">
            <div className={`w-16 h-16 mx-auto rounded-[20px] bg-gradient-to-br ${step.color} flex items-center justify-center text-[32px] shadow-sm mb-4`}>{step.icon}</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">Step {step.id} of 6</span>
              <span className="text-[11px] text-gray-400">{step.estimatedTime}</span>
            </div>
            <h1 className="text-[26px] font-[800] tracking-tight leading-[0.95] text-gray-900">{step.title}</h1>
            <p className="text-[13px] text-gray-500 mt-1">{step.subtitle}</p>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 mb-6">
            <p className="text-[14px] leading-[1.6] text-gray-700">{step.kidExplanation}</p>
            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[14px]">👉</span>
              <p className="text-[13px] font-semibold text-gray-900 leading-[1.4]">{step.oneBigAction}</p>
            </div>
          </div>

          {step.id === 1 && (
            <div className="mb-6">
              <CopyBox text={step.content.prompt} label="Your Blueprint - Replace [YOUR APP IDEA HERE] then Copy" previewLines={2} />
              <p className="text-[11px] text-gray-500 mt-2">💡 Be specific: "todo app where AI makes daily plan" is better than "todo app"</p>
              {pathway.id === 'arena' && (
                <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <p className="text-[12px] font-bold text-indigo-800">For Arena.ai / Z.ai special:</p>
                  <p className="text-[11px] leading-[1.5] text-indigo-700 mt-1">This prompt tells Arena you will send keys next. After it builds, it will ask for Supabase URL, anon key, service role, Gemini key, GitHub token, Vercel token, Render key — send them one by one and it will connect + deploy automatically using your tokens!</p>
                </div>
              )}
            </div>
          )}

          {currentMicro && (
            <div className="rounded-[24px] bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-[14px] shrink-0">{microIndex + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">Task {microIndex+1} of {microSteps.length}</p>
                    <h2 className="text-[17px] font-bold text-gray-900 leading-[1.2]">{currentMicro.title}</h2>
                  </div>
                </div>

                <p className="text-[14px] leading-[1.6] text-gray-600 mb-6">{currentMicro.desc}</p>

                {currentMicro.where && (
                  <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 mb-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">Where to get this <ExternalLink className="w-3 h-3" /></p>
                    {currentMicro.where.url && (
                      <a href={currentMicro.where.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 mb-3 shadow-sm">
                        Open website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <div className="space-y-2">
                      {currentMicro.where.steps.map((s, i) => (
                        <div key={i} className="flex gap-2.5 text-[13px] leading-[1.4] text-gray-600">
                          <span className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">{i+1}</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentMicro.keys && (
                  <div className="space-y-2.5 mb-6">
                    {currentMicro.keys.map((k, i) => (
                      <div key={i} className={`rounded-xl p-4 border ${k.safe ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-gray-900 text-[13px]">{k.name}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${k.safe ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'}`}>{k.safe ? 'SAFE' : 'SECRET'}</span>
                        </div>
                        <p className="font-mono text-[11px] text-gray-400 mb-1.5 break-all">{k.example}</p>
                        <p className="text-[12px] leading-[1.4] text-gray-600">{k.what}</p>
                      </div>
                    ))}
                  </div>
                )}

                {currentMicro.sql && (
                  <div className="mb-6">
                    <CopyBox text={currentMicro.sql} label="SQL - Copy all, paste in Supabase SQL Editor, click RUN" previewLines={2} />
                    <p className="text-[11px] text-gray-500 mt-2">This SQL works for ANY project - it makes generic tables (profiles + items). You can customize items table later for your idea. For Compass cloud sync, we already created compass_users + compass_progress tables (you ran it).</p>
                  </div>
                )}

                {currentMicro.code && (
                  <div className="mb-6">
                    <CopyBox text={currentMicro.code} label="Commands - Copy and paste" previewLines={3} />
                  </div>
                )}

                {step.id === 1 && microIndex === 2 && !currentMicro.sql && !currentMicro.code && (
                  <div className="mb-6">
                    <CopyBox text={step.content.prompt} label="Final Copy - Complete blueprint" previewLines={2} />
                  </div>
                )}

                {currentMicro.warning && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3 mb-6">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[12px] leading-[1.5] text-amber-800">
                      {step.id === 2 ? "Don't edit files yourself. Tell robot in chat to fix. Like asking chef to fix soup." : 
                       step.id === 4 ? "Never put AIza key in frontend! Hide in server/.env only. If leaked, bad people use your free limit." :
                       step.id === 5 ? "If you see .env or AIza on GitHub, delete repo NOW and make new keys!" :
                       "Important safety rule - read carefully!"}
                    </p>
                  </div>
                )}

                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Check when done:</p>
                  <p className="text-[13px] text-gray-700 flex items-start gap-2"><span className="text-emerald-600">✓</span> {currentMicro.action}</p>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <button onClick={handlePrevMicro} disabled={isFirstMicro && currentStep === 1} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-20 transition-colors shadow-sm">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button onClick={() => setMentorOpen(true, `Step ${step.id} Task ${microIndex+1}`)} className="px-4 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 text-[13px] font-medium flex items-center gap-1.5 shadow-sm">
                  <Lightbulb className="w-4 h-4" /> Help
                </button>

                <div className="flex-1" />

                <button onClick={handleNextMicro} className="px-6 py-2.5 rounded-full bg-gray-900 text-white font-bold text-[13px] hover:bg-gray-800 active:scale-[0.98] transition-all shadow-sm">
                  {isLastMicro ? (currentStep === 6 ? 'Finish 🎉' : 'Next Step →') : 'Next →'}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex gap-1.5">
              {microSteps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === microIndex ? 'w-8 bg-gray-900' : i < microIndex ? 'w-1.5 bg-emerald-500' : 'w-1.5 bg-gray-200'}`} />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 ml-2">{microIndex+1} / {microSteps.length}</span>
          </div>

          {isCompleted && currentStep === 6 && isLastMicro && (
            <div className="mt-8 rounded-[20px] bg-gray-900 text-white p-6 text-center shadow-lg">
              <div className="text-[28px] mb-2">🎉</div>
              <p className="font-bold text-[16px]">You built an app!</p>
              <p className="text-[13px] text-white/60 mt-1 mb-4">All 6 steps done. Check final list.</p>
              <Link to="/checklist" className="inline-flex px-6 py-3 rounded-full bg-white text-black font-bold text-sm">Final Checklist →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
