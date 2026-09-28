import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import { chatApi } from '../api/client.js';

const SUGGESTED = ['What do my latest results mean?', 'Which values should I discuss with my doctor?', 'Summarize my latest report.'];
const time = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function Chat() {
  const [params] = useSearchParams();
  const reportId = params.get('report');
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef();
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs, busy]);

  const send = async (m) => {
    const message = (m ?? text).trim();
    if (!message || busy) return;
    setText(''); setBusy(true);
    setMsgs((x) => [...x, { role: 'user', text: message, at: new Date() }]);
    try {
      const reply = await chatApi.send(message, reportId);
      setMsgs((x) => [...x, { role: 'assistant', text: reply || 'No response was returned.', at: new Date() }]);
    } catch (e) {
      setMsgs((x) => [...x, { role: 'error', text: e.message, at: new Date(), retry: message }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <div className="mb-4"><h2 className="text-xl font-bold">HealthOS AI Assistant</h2>
        <p className="text-sm text-slate-600">Ask questions about your health reports and history.</p></div>
      <div className="card flex-1 space-y-4 overflow-y-auto" aria-live="polite">
        {msgs.length === 0 && (
          <div className="grid h-full place-content-center gap-2 text-center">
            <p className="text-sm text-slate-500">Try one of these:</p>
            {SUGGESTED.map((s) => <button key={s} onClick={() => send(s)} className="btn-ghost">{s}</button>)}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-teal-700 text-white' : m.role === 'error' ? 'border border-red-200 bg-red-50 text-red-800' : 'bg-slate-100'}`}>
              <p className="whitespace-pre-line">{m.text}</p>
              <p className={`mt-1 text-xs ${m.role === 'user' ? 'text-teal-100' : 'text-slate-500'}`}>{time(m.at)}
                {m.retry && <button className="ml-2 font-semibold underline" onClick={() => send(m.retry)}>Retry</button>}</p>
            </div>
          </div>
        ))}
        {busy && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Thinking…</div>}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2">
        <input className="input" placeholder="Ask something about your health..." aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-primary" disabled={busy || !text.trim()} aria-label="Send"><Send className="h-4 w-4" /></button>
      </form>
      <p className="mt-2 text-xs text-slate-500">HealthOS AI provides informational assistance and is not a substitute for professional medical advice.</p>
    </div>
  );
}
