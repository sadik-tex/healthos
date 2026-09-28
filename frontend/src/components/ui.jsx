import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Loader2, Siren } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Spinner = ({ label = 'Loading' }) => (
  <div role="status" className="flex items-center gap-2 text-sm text-slate-500">
    <Loader2 className="h-5 w-5 animate-spin text-teal-700" aria-hidden /> {label}…
  </div>
);

export const Skeleton = ({ className = 'h-32' }) => <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;

export function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" className="card border-red-200 bg-red-50">
      <p className="font-semibold text-red-800">Something went wrong</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-ghost mt-3">Try again</button>}
    </div>
  );
}

export function Empty({ title, text, to, cta }) {
  return (
    <div className="card py-12 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {to && <Link to={to} className="btn-primary mt-5">{cta}</Link>}
    </div>
  );
}

const STATUS = {
  NORMAL: ['bg-emerald-50 text-emerald-800 border-emerald-200', CheckCircle2, 'Normal'],
  HIGH: ['bg-amber-50 text-amber-800 border-amber-200', ArrowUp, 'High'],
  LOW: ['bg-sky-50 text-sky-800 border-sky-200', ArrowDown, 'Low'],
  URGENT: ['bg-red-50 text-red-800 border-red-200', Siren, 'Urgent'],
};
export function StatusBadge({ status }) {
  const s = STATUS[String(status || '').toUpperCase()];
  if (!s) return null;
  const [cls, Icon, text] = s;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden /> {text}
    </span>
  );
}

export function ProcessBadge({ status }) {
  const done = ['complete', 'completed', 'done', 'analyzed', 'success'].includes(status);
  const failed = ['failed', 'error'].includes(status);
  const cls = done ? 'bg-emerald-50 text-emerald-800' : failed ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-700';
  const Icon = failed ? AlertTriangle : done ? CheckCircle2 : Loader2;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      <Icon className={`h-3.5 w-3.5 ${!done && !failed ? 'animate-spin' : ''}`} aria-hidden /> {status}
    </span>
  );
}

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
