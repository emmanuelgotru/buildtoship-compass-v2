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
    <div className="rounded-2xl border border-white/10 bg-[#0F141F] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <span className="text-[11px] font-semibold tracking-wide text-white/60">{label}</span>
        <button onClick={copy} className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}>
          <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4">
        <pre className="text-[12px] leading-[1.7] font-mono text-white/75 whitespace-pre-wrap break-words">
          {expanded ? text : preview}
          {!expanded && lines.length > previewLines && '\n...'}
        </pre>
        {lines.length > previewLines && (
          <button onClick={() => setExpanded(!expanded)} className="mt-3 text-xs font-medium text-white/50 hover:text-white/80 flex items-center gap-1">
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
    <div className="min-h-screen bg-[#0B0F19] flex">
      {/* Sidebar - cleaner */}
      <aside className={`${sidebarCollapsed ? 'w-0 lg:w-[72px]' : 'w-[260px]'} shrink-0 transition-all duration-300 overflow-hidden border-r border-white/[0.06] bg-[#0E131F] lg:sticky lg:top-0 lg:h-screen`}>
        <div className="p-4">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-8`}>
            {!sidebarCollapsed && (
              <Link to="/pathways" className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pathway.color} flex items-center justify-center text-[16px]`}>{pathway.icon}</div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-none">{pathway.name}</p>
                  <p className="text-[10px] text-white/40">Build path</p>
                </div>
              </Link>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors">
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
                    <button key={s.id} onClick={() => handleStepChange(s.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${active ? 'bg-white text-black' : done ? 'bg-white/[0.06] text-white/80 border border-white/10' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${active ? 'bg-black text-white' : done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>{done ? <Check className="w-4 h-4" /> : s.id}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold leading-tight truncate">{s.title}</p>
                        <p className={`text-[11px] leading-tight truncate ${active ? 'text-black/60' : 'text-white/30'}`}>{s.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <div className="flex justify-between text-[11px] text-white/30 mb-2">
                  <span>Progress</span>
                  <span>{completedSteps.length}/6</span>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-white transition-all duration-500" style={{ width: `${(completedSteps.length/6)*100}%` }} />
                </div>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-2">
              {steps.map(s => {
                const done = completedSteps.includes(s.id);
                const active = currentStep === s.id;
                return (
                  <button key={s.id} onClick={() => { setSidebarCollapsed(false); handleStepChange(s.id); }} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-white text-black' : done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40 hover:bg-white/15'}`}>{done ? <Check className="w-4 h-4" /> : s.id}</button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main - cleaner, less clumsy */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between p-4 border-b border-white/[0.06] bg-[#0B0F19]/90 backdrop-blur-xl">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-full bg-white/10 text-white/70"><Menu className="w-5 h-5" /></button>
          <span className="text-sm font-bold text-white">Step {currentStep} • {microIndex+1}/{microSteps.length}</span>
          <div className="w-9" />
        </div>

        <div className="max-w-[600px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
          {/* Header - clean, no "10 year old" label */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-[24px] shadow-lg`}>{step.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-white/30">Step {step.id} of 6</span>
                  <span className="text-[11px] text-white/20">•</span>
                  <span className="text-[11px] text-white/30">{step.estimatedTime}</span>
                </div>
                <h1 className="text-[22px] font-bold tracking-tight text-white leading-tight">{step.title}</h1>
                <p className="text-[12px] text-white/40">{step.subtitle}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#151A28] border border-white/[0.06] p-5">
              <p className="text-[14px] leading-[1.6] text-white/75">{step.kidExplanation}</p>
              <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <span className="text-[14px]">👉</span>
                <p className="text-[13px] font-semibold text-white leading-[1.4]">{step.oneBigAction}</p>
              </div>
            </div>
          </div>

          {/* Always show prompt for step 1 at top with copy */}
          {step.id === 1 && (
            <div className="mb-6">
              <CopyBox text={step.content.prompt} label="Your Magic Blueprint - Replace [YOUR APP IDEA HERE]" previewLines={2} />
              <p className="text-[11px] text-white/30 mt-2">💡 Replace bracket text with your real idea. Example: "todo app where AI makes daily plan"</p>
            </div>
          )}

          {/* Micro Step - ONE per screen, clean */}
          {currentMicro && (
            <div className="rounded-[24px] bg-[#151A28] border border-white/[0.08] overflow-hidden">
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-[14px] shrink-0">{microIndex + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-white/30 mb-1">Task {microIndex+1} of {microSteps.length}</p>
                    <h2 className="text-[17px] font-bold text-white leading-[1.2]">{currentMicro.title}</h2>
                  </div>
                </div>

                <p className="text-[14px] leading-[1.6] text-white/65 mb-6">{currentMicro.desc}</p>

                {currentMicro.where && (
                  <div className="rounded-2xl bg-[#0B0F19] border border-white/10 p-4 mb-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1.5">Where to get this <ExternalLink className="w-3 h-3" /></p>
                    {currentMicro.where.url && (
                      <a href={currentMicro.where.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 mb-3">
                        Open website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <div className="space-y-2">
                      {currentMicro.where.steps.map((s, i) => (
                        <div key={i} className="flex gap-2.5 text-[13px] leading-[1.4] text-white/60">
                          <span className="w-6 h-6 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">{i+1}</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentMicro.keys && (
                  <div className="space-y-2.5 mb-6">
                    {currentMicro.keys.map((k, i) => (
                      <div key={i} className={`rounded-xl p-4 border ${k.safe ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-[13px]">{k.name}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${k.safe ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'}`}>{k.safe ? 'SAFE' : 'SECRET'}</span>
                        </div>
                        <p className="font-mono text-[11px] text-white/30 mb-1.5 break-all">{k.example}</p>
                        <p className="text-[12px] leading-[1.4] text-white/60">{k.what}</p>
                      </div>
                    ))}
                  </div>
                )}

                {currentMicro.sql && (
                  <div className="mb-6">
                    <CopyBox text={currentMicro.sql} label="SQL - Copy all, paste in Supabase SQL Editor, RUN" previewLines={2} />
                  </div>
                )}

                {currentMicro.code && (
                  <div className="mb-6">
                    <CopyBox text={currentMicro.code} label="Commands - Copy and paste in terminal" previewLines={3} />
                  </div>
                )}

                {/* For step 1 task 3, ensure copy button visible even if no copyable flag */}
                {step.id === 1 && microIndex === 2 && !currentMicro.sql && !currentMicro.code && (
                  <div className="mb-6">
                    <CopyBox text={step.content.prompt} label="Final Copy - Your complete blueprint" previewLines={2} />
                  </div>
                )}

                {currentMicro.warning && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3 mb-6">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] leading-[1.5] text-amber-200/80">
                      {step.id === 2 ? "Don't edit files yourself. Tell robot in chat to fix. Like asking chef to fix soup." : 
                       step.id === 4 ? "Never put AIza key in frontend! Hide in server/.env only. If leaked, bad people use your free limit." :
                       step.id === 5 ? "If you see .env or AIza on GitHub, delete repo NOW and make new keys!" :
                       "Important safety rule - read carefully!"}
                    </p>
                  </div>
                )}

                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Check when done:</p>
                  <p className="text-[13px] text-white/70 flex items-start gap-2"><span className="text-emerald-400">✓</span> {currentMicro.action}</p>
                </div>
              </div>

              <div className="p-4 border-t border-white/[0.06] bg-white/[0.02] flex items-center gap-3">
                <button onClick={handlePrevMicro} disabled={isFirstMicro && currentStep === 1} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button onClick={() => setMentorOpen(true, `Step ${step.id} Task ${microIndex+1}`)} className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors">
                  <Lightbulb className="w-4 h-4" /> Help
                </button>

                <div className="flex-1" />

                <button onClick={handleNextMicro} className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-[13px] hover:bg-white/90 active:scale-[0.98] transition-all">
                  {isLastMicro ? (currentStep === 6 ? 'Finish 🎉' : 'Next Step →') : 'Next →'}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex gap-1.5">
              {microSteps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === microIndex ? 'w-8 bg-white' : i < microIndex ? 'w-1.5 bg-emerald-400' : 'w-1.5 bg-white/20'}`} />
              ))}
            </div>
            <span className="text-[11px] text-white/20 ml-2">{microIndex+1} / {microSteps.length}</span>
          </div>

          {isCompleted && currentStep === 6 && isLastMicro && (
            <div className="mt-8 rounded-[20px] bg-white text-black p-6 text-center">
              <div className="text-[28px] mb-2">🎉</div>
              <p className="font-bold text-[16px]">You built an app!</p>
              <p className="text-[13px] text-black/60 mt-1 mb-4">All 6 steps done. Check final list before submit.</p>
              <Link to="/checklist" className="inline-flex px-6 py-3 rounded-full bg-black text-white font-bold text-sm">Final Checklist →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
