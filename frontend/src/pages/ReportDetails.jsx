import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react';
import { reportsApi } from '../api/client.js';
import useFetch from '../components/useFetch.js';
import { Empty, ErrorMessage, ProcessBadge, Skeleton, StatusBadge, fmtDate } from '../components/ui.jsx';

export default function ReportDetails() {
  const { id } = useParams();
  const { data: r, loading, error, retry } = useFetch(() => reportsApi.get(id), [id]);
  const [fileErr, setFileErr] = useState('');

  return (
    <div className="space-y-6">
      <Link to="/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700"><ArrowLeft className="h-4 w-4" />All reports</Link>
      {loading && <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-64" /></div>}
      {error && <ErrorMessage message={error} onRetry={retry} />}
      {r && (
        <>
          <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-xl font-bold">{r.name}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">{fmtDate(r.date)} <ProcessBadge status={r.status} /></p></div>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => reportsApi.openFile(r.id).catch((e) => setFileErr(e.message))}><ExternalLink className="h-4 w-4" />View original</button>
              <Link to={`/chat?report=${r.id}`} className="btn-primary"><MessageSquare className="h-4 w-4" />Ask AI</Link>
            </div>
          </div>
          {fileErr && <p role="alert" className="text-sm text-red-700">{fileErr}</p>}

          <section>
            <h3 className="mb-3 text-lg font-semibold">Health values</h3>
            {r.values.length === 0 ? <Empty title="No values extracted" text="The backend did not return any values for this report." /> : (
              <div className="card overflow-x-auto !p-0">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500"><tr>
                    {['Metric', 'Value', 'Reference range', 'Status'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100">{r.values.map((v, i) => (
                    <tr key={i}><td className="px-4 py-3 font-medium">{v.name}</td>
                      <td className="px-4 py-3">{v.value} {v.unit}</td>
                      <td className="px-4 py-3 text-slate-500">{v.range || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td></tr>))}</tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card">
            <h3 className="text-lg font-semibold">AI Explanation</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{r.summary || 'No explanation was returned for this report.'}</p>
            <p className="mt-4 text-xs text-slate-500">HealthOS AI provides informational assistance and is not a substitute for professional medical advice.</p>
          </section>
        </>
      )}
    </div>
  );
}
