import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getStepsForPathway } from '../data/steps';
import { X, Send, Image as ImageIcon, Sparkles, Loader2, Upload } from 'lucide-react';

export default function MentorModal() {
  const { mentorOpen, setMentorOpen, selectedPathway, currentStep } = useStore();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm your mentor 👋\n\nStuck? Just tell me what's happening. I know which tool you're using and which step you're on.\n\nTry: \"My data disappears after refresh\" or drop a screenshot." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const steps = selectedPathway ? getStepsForPathway(selectedPathway) : [];
  const currentStepData = steps[currentStep - 1];
  const toolName = selectedPathway || 'your tool';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateMockResponse = async (userMessage) => {
    const lower = userMessage.toLowerCase();
    const hasGithub = lower.includes('github.com');
    const hasVercel = lower.includes('vercel.app') || lower.includes('vercel');
    const hasError = lower.includes('error') || lower.includes('failed');

    let response = '';
    if (hasGithub) {
      response = `I checked your GitHub link.

Quick security check:
1. Open repo → Press 't' → Search '.env' → Should be 0 results
2. Search 'AIza' → Should be 0 results
3. Check .gitignore has .env, node_modules

If leaked keys:
- aistudio.google.com → Revoke old key → New one
- Supabase → Settings → API → Reset keys
- Update in Render/Vercel, NOT in code`;
    } else if (hasVercel || lower.includes('deploy')) {
      response = `Deployment fix:

Vercel:
- Settings → Env Vars → VITE_API_BASE_URL must be Render URL (https://...onrender.com) not localhost
- Change env → Redeploy

Render:
- Logs → Look for "Server running"
- Free tier sleeps - first request 50s normal
- Env tab: Check all vars present?
- Set CLIENT_URL = Vercel URL for CORS`;
    } else if (lower.includes('supabase') || lower.includes('data') || currentStep === 3) {
      response = `Supabase data not saving?

Most common: RLS blocking.

Fix in SQL Editor:
create policy "Allow authenticated"
on public.items for all
using (auth.role() = 'authenticated');

Keys:
- Frontend: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY only
- Backend: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
- Service_role in frontend = security issue!`;
    } else if (lower.includes('gemini') || lower.includes('ai') || currentStep === 4) {
      response = `Gemini API fix:

"API key not valid"?
- Starts with AIzaSy...? Good
- Copied full? No spaces?
- Still active in aistudio.google.com?

Key in frontend? Wrong!
❌ Frontend: new GoogleGenerativeAI("AIza...")
✅ Backend only: server/.env → GEMINI_API_KEY=AIza...

Frontend should call backend:
fetch(VITE_API_BASE_URL + '/api/ai/generate', { method: 'POST', body: { prompt } })`;
    } else {
      response = `You're on Step ${currentStep}: ${currentStepData?.title} using ${toolName}.

Help for "${userMessage.slice(0, 50)}":

${currentStep === 1 ? 'Idea stuck? Pick something YOU need. Example: "App that turns notes into flashcards".' : ''}
${currentStep === 2 ? 'Stuck? Tell AI builder: "Continue building, create missing files, show how to run"' : ''}

Say "explain simpler" for simpler help.`;
    }
    return new Promise(resolve => setTimeout(() => resolve(response), 600));
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    let responseText = '';
    if (geminiKey) {
      try {
        const systemPrompt = `You are friendly peer tutor helping beginner in Build to Ship hackathon. Student uses ${toolName} on step ${currentStep} - ${currentStepData?.title}. Explain simply, no jargon.`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nQuestion: ${userMsg}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
          }),
        });
        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch {}
    }
    if (!responseText) responseText = await generateMockResponse(userMsg);
    setMessages(m => [...m, { role: 'assistant', content: responseText }]);
    setIsTyping(false);
  };

  const handleFile = (file) => {
    if (!file) return;
    setMessages(m => [...m, { role: 'user', content: `📸 Screenshot: ${file.name}` }]);
    setTimeout(async () => {
      setIsTyping(true);
      const res = await generateMockResponse(`screenshot error: ${file.name}`);
      setMessages(m => [...m, { role: 'assistant', content: res }]);
      setIsTyping(false);
    }, 600);
  };

  if (!mentorOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMentorOpen(false)} />
      
      <div className="relative w-full sm:max-w-[560px] h-[90vh] sm:h-[600px] rounded-t-[24px] sm:rounded-[24px] bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-[14px]">AI Mentor</h3>
              <p className="text-[11px] text-gray-500">{toolName} • Step {currentStep}</p>
            </div>
          </div>
          <button onClick={() => setMentorOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-[16px] px-4 py-3 text-[13px] leading-[1.5] whitespace-pre-wrap ${m.role === 'user' ? 'bg-gray-900 text-white rounded-br-[4px]' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-[4px] shadow-sm'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-[16px] rounded-bl-[4px] px-4 py-3 flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={`relative border-t border-gray-100 p-3 bg-white ${dragOver ? 'bg-gray-50' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}>
          {dragOver && (
            <div className="absolute inset-0 z-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Upload className="w-5 h-5" />
                <span className="text-sm">Drop screenshot</span>
              </div>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 shrink-0">
              <ImageIcon className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            <div className="flex-1 relative">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask anything or paste error..." className="w-full min-h-[44px] max-h-[100px] resize-none rounded-full bg-gray-50 border border-gray-200 px-4 py-3 pr-11 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all" rows={1} />
              <button onClick={handleSend} disabled={!input.trim()} className="absolute right-1 top-1 w-8 h-8 rounded-full bg-gray-900 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center hover:bg-gray-800 active:scale-95 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
