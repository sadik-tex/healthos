import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo } from '../components/Layout.jsx';

function Shell({ title, children, footer }) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Link to="/"><Logo /></Link></div>
        <div className="card p-7"><h1 className="mb-5 text-2xl font-bold">{title}</h1>{children}</div>
        <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>
      </div>
    </div>
  );
}

function Password({ id, label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} className="input pr-11" value={value} onChange={onChange} required minLength={6} autoComplete={id === 'password' ? 'current-password' : 'new-password'} />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-slate-500" aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

const Submit = ({ busy, children }) => (
  <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{children}</button>
);
const Err = ({ msg }) => msg && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>;

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await login(f.email, f.password); nav('/dashboard'); } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <Shell title="Welcome back" footer={<>New to HealthOS? <Link to="/signup" className="font-semibold text-teal-700">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div><label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required autoComplete="email" /></div>
        <Password id="password" label="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Err msg={error} /><Submit busy={busy}>Log in</Submit>
      </form>
    </Shell>
  );
}

export function Signup() {
  const { signup, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (f.password !== f.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try { await signup({ full_name: f.name, email: f.email, password: f.password }); nav('/dashboard'); } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <Shell title="Create your account" footer={<>Already have an account? <Link to="/login" className="font-semibold text-teal-700">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div><label htmlFor="name" className="label">Name</label><input id="name" className="input" value={f.name} onChange={set('name')} required autoComplete="name" /></div>
        <div><label htmlFor="email" className="label">Email</label><input id="email" type="email" className="input" value={f.email} onChange={set('email')} required autoComplete="email" /></div>
        <Password id="new-password" label="Password" value={f.password} onChange={set('password')} />
        <Password id="confirm" label="Confirm password" value={f.confirm} onChange={set('confirm')} />
        <Err msg={error} /><Submit busy={busy}>Create account</Submit>
      </form>
    </Shell>
  );
}
