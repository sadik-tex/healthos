import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { reportsApi } from '../api/client.js';
import useFetch from '../components/useFetch.js';
import ReportUpload from '../components/ReportUpload.jsx';
import { Empty, ErrorMessage, ProcessBadge, Skeleton, StatusBadge, fmtDate } from '../components/ui.jsx';

export default function Reports() {
  const { data, loading, error, retry } = useFetch(reportsApi.list);
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('new');

  const rows = useMemo(() => {
    let r = (data || []).filter((x) => x.name.toLowerCase().includes(q.toLowerCase()) && (status === 'all' || x.status === status));
    r = [...r].sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : (new Date(b.date) - new Date(a.date)) * (sort === 'new' ? 1 : -1)));
    return r;
  }, [data, q, status, sort]);
  const statuses = [...new Set((data || []).map((r) => r.status))];

  return (
    <div className="space-y-6">
      <ReportUpload onDone={(r) => { retry(); if (r?.id) setTimeout(() => nav(`/reports/${r.id}`), 900); }} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden />
          <input className="input pl-9" placeholder="Search reports" aria-label="Search reports" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input sm:w-40" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select className="input sm:w-40" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">Newest first</option><option value="old">Oldest first</option><option value="name">Name</option></select>
      </div>
      {loading && <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>}
      {error && <ErrorMessage message={error} onRetry={retry} />}
      {data && data.length === 0 && <Empty title="No medical reports yet." text="Upload a report above and HealthOS will analyze it." to="/reports" cta="Upload your first report" />}
      {data && data.length > 0 && rows.length === 0 && <Empty title="No reports found" text="Try a different search or filter." />}
      <div className="space-y-3">
        {rows.map((r) => {
          const flags = r.values.filter((v) => ['HIGH', 'LOW', 'URGENT'].includes(v.status));
          return (
            <div key={r.id} className="card flex flex-col gap-3 !p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="truncate font-semibold">{r.name}</p>
                <p className="text-sm text-slate-500">{fmtDate(r.date)}{r.type && ` · ${r.type}`}</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <ProcessBadge status={r.status} />
                {flags.length > 0 && <span className="text-sm text-slate-600">{flags.length} flagged</span>}
                {flags.some((f) => f.status === 'URGENT') && <StatusBadge status="URGENT" />}
                <Link to={`/reports/${r.id}`} className="btn-ghost !py-1.5">View</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
