import { useEffect, useState } from 'react';
import { userApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

// Fields from the backend README: name, age, sex, height, weight, conditions, medications.
const FIELDS = [
  ['name', 'Name', 'text'], ['age', 'Age', 'number'], ['sex', 'Sex', 'select'],
  ['height', 'Height', 'number'], ['weight', 'Weight', 'number'],
  ['conditions', 'Medical conditions', 'list'], ['medications', 'Medications', 'list'],
];
const show = (v) => (Array.isArray(v) ? v.join(', ') : v ?? '');

export default function Profile() {
  const { user, setUser } = useAuth();
  const [f, setF] = useState({});
  const [state, setState] = useState('idle'); // idle | saving | saved | error
  const [error, setError] = useState('');
  useEffect(() => { if (user) setF(Object.fromEntries(FIELDS.map(([k]) => [k, show(user[k])]))); }, [user]);

  const save = async (e) => {
    e.preventDefault(); setState('saving'); setError('');
    const body = {};
    FIELDS.forEach(([k, , type]) => {
      const v = f[k];
      if (type === 'number') body[k] = v === '' ? null : Number(v);
      else if (type === 'list') body[k] = Array.isArray(user?.[k]) ? v.split(',').map((s) => s.trim()).filter(Boolean) : v;
      else body[k] = v === '' ? null : v;
    });
    try { setUser(await userApi.update(body)); setState('saved'); } catch (err) { setError(err.message); setState('error'); }
  };

  return (
    <form onSubmit={save} className="card max-w-2xl space-y-4">
      <div><h2 className="text-lg font-bold">Your profile</h2>
        <p className="text-sm text-slate-600">This information helps HealthOS personalize your insights and chat answers.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(([k, label, type]) => (
          <div key={k} className={type === 'list' ? 'sm:col-span-2' : ''}>
            <label htmlFor={k} className="label">{label}{type === 'list' && ' (comma separated)'}</label>
            {type === 'select' ? (
              <select id={k} className="input" value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })}>
                <option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
            ) : <input id={k} type={type === 'number' ? 'number' : 'text'} step="any" className="input" value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button className="btn-primary" disabled={state === 'saving'}>{state === 'saving' ? 'Saving…' : 'Save changes'}</button>
        <p role="status" className={`text-sm ${state === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>
          {state === 'saved' && 'Saved successfully'}{state === 'error' && `Error saving profile: ${error}`}</p>
      </div>
    </form>
  );
}
