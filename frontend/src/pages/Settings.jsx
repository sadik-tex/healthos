import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Settings() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="card max-w-2xl space-y-5">
      <div><h2 className="text-lg font-bold">Account</h2><p className="mt-1 text-sm text-slate-600">Signed in as {user?.email || 'your account'}.</p></div>
      <p className="text-sm text-slate-600">HealthOS AI provides informational assistance and is not a substitute for professional medical advice.</p>
      <button className="btn-ghost" onClick={() => { logout(); nav('/login'); }}><LogOut className="h-4 w-4" />Log out</button>
    </div>
  );
}
