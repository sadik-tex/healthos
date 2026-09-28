import { Link } from 'react-router-dom';
import { FileText, FileUp, MessageSquare, User } from 'lucide-react';
import { dashboardApi } from '../api/client.js';
import useFetch from '../components/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Empty, ErrorMessage, ProcessBadge, Skeleton, StatusBadge, fmtDate } from '../components/ui.jsx';

const KEY_METRICS = [['Blood glucose', ['glucose', 'sugar']], ['Cholesterol', ['cholesterol']], ['Blood pressure', ['pressure', 'bp']], ['Heart rate', ['heart', 'pulse']], ['Weight', ['weight']]];
const find = (metrics, words) => metrics.find((m) => words.some((w) => String(m.name).toLowerCase().includes(w)));

function Ring({ score }) {
  const pct = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="9" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#0f766e" strokeWidth="9" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264 - (264 * pct) / 100} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-3xl font-extrabold">{score ?? '—'}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, retry } = useFetch(dashboardApi.get);
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const name = user?.name || user?.full_name || '';

  return (
    <div className="space-y-8">
      <div><h2 className="text-2xl font-bold">{greet}{name && `, ${name}`}</h2><p className="text-slate-600">Here's your latest health overview.</p></div>
      {loading && <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-44 md:col-span-3" /><Skeleton /><Skeleton /><Skeleton /></div>}
      {error && <ErrorMessage message={error} onRetry={retry} />}
      {data && (
        <>
          <section className="card flex flex-col items-center gap-6 sm:flex-row">
            <Ring score={data.score} />
            <div><p className="text-sm text-slate-500">Overall health score</p>
              <p className="text-xl font-bold">{data.label || (data.score == null ? 'No score yet' : 'Your score')}</p>
              <p className="mt-1 max-w-xl text-sm text-slate-600">{data.explanation || (data.score == null ? 'Upload a report to get your first health score.' : '')}</p></div>
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold">Important metrics</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {KEY_METRICS.map(([label, words]) => {
                const m = find(data.metrics, words);
                return (
                  <div key={label} className="card">
                    <div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p>{m && <StatusBadge status={m.status} />}</div>
                    {m ? <p className="mt-2 text-2xl font-bold">{m.value} <span className="text-sm font-medium text-slate-500">{m.unit}</span></p>
                      : <div className="mt-2"><p className="text-sm text-slate-500">No data available</p><Link to="/reports" className="text-sm font-semibold text-teal-700">Upload a report</Link></div>}
                  </div>
                );
              })}
              {data.metrics.filter((m) => !KEY_METRICS.some(([, w]) => find([m], w))).map((m) => (
                <div key={m.name} className="card"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{m.name}</p><StatusBadge status={m.status} /></div>
                  <p className="mt-2 text-2xl font-bold">{m.value} <span className="text-sm font-medium text-slate-500">{m.unit}</span></p></div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold">Health insights</h3>
            {data.insights.length === 0 ? <p className="text-sm text-slate-500">No insights yet. They appear after you upload a report.</p> : (
              <ul className="space-y-2">{data.insights.map((i, n) => (
                <li key={n} className="card flex items-start justify-between gap-3 !p-4"><p className="text-sm">{i.text}</p><StatusBadge status={i.status} /></li>
              ))}</ul>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold">Recent reports</h3><Link to="/reports" className="text-sm font-semibold text-teal-700">View all</Link></div>
            {data.recent.length === 0 ? <Empty title="No reports yet" text="Upload a medical report to see it here." to="/reports" cta="Upload your first report" /> : (
              <div className="card divide-y divide-slate-100 !p-0">{data.recent.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0"><p className="truncate font-medium">{r.name}</p><p className="text-sm text-slate-500">{fmtDate(r.date)}</p></div>
                  <div className="flex items-center gap-3"><ProcessBadge status={r.status} /><Link to={`/reports/${r.id}`} className="btn-ghost !py-1.5">View</Link></div>
                </div>))}</div>
            )}
          </section>
        </>
      )}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['/reports', FileUp, 'Upload report'], ['/chat', MessageSquare, 'Ask AI'], ['/reports', FileText, 'View reports'], ['/profile', User, 'Update profile']].map(([to, Icon, t]) => (
          <Link key={t} to={to} className="card flex items-center gap-3 !p-4 text-sm font-semibold hover:border-teal-600"><Icon className="h-5 w-5 text-teal-700" aria-hidden />{t}</Link>
        ))}
      </section>
    </div>
  );
}
