import { Link } from 'react-router-dom';
import { FileUp, Lock, MessageSquare, Search, TrendingUp } from 'lucide-react';
import { Logo } from '../components/Layout.jsx';

const STEPS = [
  [FileUp, 'Upload your medical report', 'Add a PDF or photo of a lab report. HealthOS reads it for you.'],
  [Search, 'Understand important values', 'See each value with its reference range and whether it is normal, high, low or urgent.'],
  [TrendingUp, 'Track your health', 'Follow your health score and insights as you add more reports.'],
  [MessageSquare, 'Ask your AI health assistant', 'Ask questions about your own results in plain language.'],
];

export default function Landing() {
  return (
    <div className="bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo />
        <div className="flex gap-2"><Link to="/login" className="btn-ghost">Sign in</Link><Link to="/signup" className="btn-primary">Get started</Link></div>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Understand Your Health. Smarter.</h1>
          <p className="mt-5 max-w-lg text-lg text-slate-600">HealthOS brings your medical reports, health insights, and AI-powered health assistant into one secure place.</p>
          <div className="mt-8 flex gap-3"><Link to="/signup" className="btn-primary">Get Started</Link><Link to="/login" className="btn-ghost">Sign In</Link></div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-lg" aria-hidden>
          <div className="rounded-2xl bg-white p-5">
            <div className="flex items-center gap-5">
              <svg width="88" height="88" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" /><circle cx="50" cy="50" r="42" fill="none" stroke="#0f766e" strokeWidth="10" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="70" transform="rotate(-90 50 50)" /></svg>
              <div><p className="text-sm text-slate-500">Health score</p><p className="text-lg font-bold">Sample preview</p></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {['Glucose', 'Cholesterol', 'Blood pressure', 'Heart rate'].map((m) => (
                <div key={m} className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">{m}</p><div className="mt-2 h-3 w-16 rounded bg-slate-200" /></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <h2 className="text-2xl font-bold">How HealthOS works</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([Icon, t, d]) => (
              <div key={t} className="card"><Icon className="h-6 w-6 text-teal-700" aria-hidden /><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <div className="flex gap-4"><Lock className="mt-1 h-6 w-6 shrink-0 text-teal-700" aria-hidden />
          <div><h2 className="text-2xl font-bold">Private by design</h2>
            <p className="mt-2 max-w-2xl text-slate-600">Your account is protected with login and token-based sessions, and your reports are tied to your profile. HealthOS provides informational assistance and is not a substitute for professional medical advice.</p></div></div>
      </section>
      <section className="bg-teal-800 py-14 text-center text-white">
        <h2 className="text-2xl font-bold !text-white">Ready to understand your reports?</h2>
        <Link to="/signup" className="btn mt-6 bg-white text-teal-900 hover:bg-teal-50">Create your account</Link>
      </section>
      <footer className="py-6 text-center text-sm text-slate-500">© {new Date().getFullYear()} HealthOS</footer>
    </div>
  );
}
