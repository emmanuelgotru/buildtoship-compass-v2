import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function CodeBlock({ code, language = 'bash', title, showLineNumbers = false }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#0D1117]">
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs font-medium text-white/60">
            <Terminal className="w-3.5 h-3.5" />
            {title}
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 pr-12 overflow-x-auto text-[13px] leading-relaxed font-mono text-[#E6EDF3] scrollbar-thin">
          <code>{code}</code>
        </pre>
        <button
          onClick={copy}
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/70 hover:text-white transition-all"
          title="Copy"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export function PromptBlock({ prompt, onCopy }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.06] to-indigo-500/[0.06] backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
      <div className="relative p-1">
        <div className="rounded-[12px] bg-[#0B0F19]/80 backdrop-blur-xl border border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-white/80">Master Prompt • Replace [YOUR APP IDEA HERE]</span>
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Prompt</>}
            </button>
          </div>
          <pre className="p-4 max-h-[320px] overflow-y-auto text-[12.5px] leading-[1.6] font-mono text-white/80 whitespace-pre-wrap break-words">
            {prompt}
          </pre>
        </div>
      </div>
    </div>
  );
}
