import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Bell, FileText, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/reports', 'Reports', FileText],
  ['/chat', 'AI Assistant', MessageSquare],
  ['/profile', 'Profile', User],
  ['/settings', 'Settings', Settings],
];

export const Logo = () => (
  <span className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-700 text-white"><Activity className="h-5 w-5" aria-hidden /></span>
    HealthOS
  </span>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const title = NAV.find(([p]) => pathname.startsWith(p))?.[1] || 'HealthOS';
  const name = user?.name || user?.full_name || user?.email || 'You';
  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100'}`;
  const doLogout = () => { logout(); nav('/login'); };

  const sidebar = (
    <nav className="flex h-full flex-col p-4" aria-label="Main">
      <div className="mb-6 flex items-center justify-between px-2"><Logo />
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
      <div className="space-y-1">
        {NAV.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} className={link} onClick={() => setOpen(false)}><Icon className="h-5 w-5" aria-hidden />{label}</NavLink>
        ))}
      </div>
      <button onClick={doLogout} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
        <LogOut className="h-5 w-5" aria-hidden /> Logout
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell className="h-5 w-5" /></button>
          <NavLink to="/profile" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">{name[0]?.toUpperCase()}</span>
            <span className="hidden text-sm font-medium sm:block">{name}</span>
          </NavLink>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 sm:p-8"><Outlet /></main>
    </div>
  );
}
