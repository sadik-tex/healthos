import { useRef, useState } from 'react';
import { CheckCircle2, FileUp, XCircle } from 'lucide-react';
import { reportsApi } from '../api/client.js';

const size = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

export default function ReportUpload({ onDone }) {
  const input = useRef();
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | uploading | analyzing | done | failed
  const [pct, setPct] = useState(0);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);

  const start = async (f) => {
    if (!f) return;
    setFile(f); setError(''); setPct(0); setPhase('uploading');
    try {
      const report = await reportsApi.upload(f, (p) => { setPct(p); if (p >= 100) setPhase('analyzing'); });
      setPhase('done');
      onDone?.(report);
    } catch (e) { setError(e.message); setPhase('failed'); }
  };
  const busy = phase === 'uploading' || phase === 'analyzing';
  const msg = { uploading: 'Uploading…', analyzing: 'Analyzing…', done: 'Analysis complete', failed: 'Upload failed' }[phase];

  return (
    <div className="card">
      <h2 className="text-lg font-bold">Upload Medical Report</h2>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!busy) start(e.dataTransfer.files[0]); }}
        className={`mt-4 rounded-2xl border-2 border-dashed p-8 text-center transition ${drag ? 'border-teal-600 bg-teal-50' : 'border-slate-300'}`}
      >
        <FileUp className="mx-auto h-9 w-9 text-teal-700" aria-hidden />
        <p className="mt-2 text-sm text-slate-600">Drag and drop a PDF or image of your report</p>
        <input ref={input} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => start(e.target.files[0])} />
        <button className="btn-primary mt-4" disabled={busy} onClick={() => input.current.click()}>Choose file</button>
      </div>
      {file && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0"><p className="truncate font-semibold">{file.name}</p>
              <p className="text-slate-500">{file.type || 'Unknown type'} · {size(file.size)}</p></div>
            <span className={`flex shrink-0 items-center gap-1 font-semibold ${phase === 'failed' ? 'text-red-700' : phase === 'done' ? 'text-emerald-700' : 'text-slate-600'}`}>
              {phase === 'done' && <CheckCircle2 className="h-4 w-4" />}{phase === 'failed' && <XCircle className="h-4 w-4" />}{msg}
            </span>
          </div>
          {busy && <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full bg-teal-600 transition-all ${phase === 'analyzing' ? 'animate-pulse' : ''}`} style={{ width: `${phase === 'analyzing' ? 100 : pct}%` }} /></div>}
          {error && <p className="mt-2 text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
