// ALL backend calls live here. If your backend differs, edit ENDPOINTS and the normalize* helpers only.
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ASSUMED paths (based on the backend README: routers auth, users, reports, chat, dashboard under /api).
// Verify against http://localhost:8000/docs and change here if needed.
export const ENDPOINTS = {
  signup: '/auth/signup',
  login: '/auth/login',
  me: '/users/me',
  dashboard: '/dashboard',
  reports: '/reports',
  upload: '/reports/upload',
  report: (id) => `/reports/${id}`,
  reportFile: (id) => `/reports/${id}/file`,
  chat: '/chat',
};
// Set to true if your login endpoint expects form data (OAuth2PasswordRequestForm: username + password).
const LOGIN_AS_FORM = false;

const KEY = 'healthos_token';
export const tokenStore = {
  get: () => localStorage.getItem(KEY),
  set: (t) => localStorage.setItem(KEY, t),
  clear: () => localStorage.removeItem(KEY),
};

const http = axios.create({ baseURL: BASE });
http.interceptors.request.use((c) => {
  const t = tokenStore.get();
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
http.interceptors.response.use(
  (r) => r,
  (e) => {
    const status = e.response?.status;
    if (status === 401 && tokenStore.get()) window.dispatchEvent(new Event('healthos:unauthorized'));
    const err = new Error(friendly(e));
    err.status = status;
    return Promise.reject(err);
  }
);

function friendly(e) {
  if (!e.response) return 'Cannot reach the server. Check that the backend is running and VITE_API_URL is correct.';
  const { status, data } = e.response;
  const d = data?.detail;
  if (status === 422) return Array.isArray(d) ? d.map((x) => x.msg).join('. ') : 'Some fields are invalid.';
  if (typeof d === 'string') return d;
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return 'We could not find what you were looking for.';
  if (status >= 500) return 'The server ran into a problem. Please try again.';
  return 'Something went wrong.';
}

// ---------- normalizers: tolerate small differences in backend field names ----------
const first = (o, ...keys) => { for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null) return o[k]; };
const toList = (d, ...keys) => (Array.isArray(d) ? d : first(d, ...keys, 'items', 'data', 'results') || []);

export function normalizeValue(v, key) {
  if (typeof v !== 'object' || v === null) return { name: key, value: v, unit: '', range: '', status: '' };
  return {
    name: first(v, 'name', 'metric', 'test', 'label') || key || 'Value',
    value: first(v, 'value', 'result'),
    unit: first(v, 'unit', 'units') || '',
    range: first(v, 'reference_range', 'range', 'normal_range') || '',
    status: String(first(v, 'status', 'flag') || '').toUpperCase(),
  };
}
const normalizeValues = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((v) => normalizeValue(v));
  return Object.entries(raw).map(([k, v]) => normalizeValue(v, k));
};
export function normalizeReport(r) {
  const id = first(r, 'id', 'report_id');
  return {
    id,
    name: first(r, 'filename', 'file_name', 'name', 'title') || `Report ${String(id).slice(0, 8)}`,
    date: first(r, 'created_at', 'uploaded_at', 'date'),
    status: String(first(r, 'status', 'analysis_status') || 'complete').toLowerCase(),
    type: first(r, 'report_type', 'type'),
    values: normalizeValues(first(r, 'values', 'extracted_values', 'metrics', 'results')),
    summary: first(r, 'summary', 'explanation', 'ai_explanation', 'analysis'),
  };
}
export function normalizeDashboard(d) {
  return {
    score: first(d, 'health_score', 'score', 'overall_score'),
    label: first(d, 'status', 'score_label', 'label'),
    explanation: first(d, 'score_explanation', 'explanation', 'summary'),
    insights: toList(first(d, 'insights') || [], 'insights').map((i) =>
      typeof i === 'string' ? { text: i, status: '' } : { text: first(i, 'text', 'message', 'insight', 'description') || '', status: String(first(i, 'status', 'severity', 'level') || '').toUpperCase() }
    ),
    metrics: normalizeValues(first(d, 'metrics', 'latest_values', 'values')),
    recent: toList(first(d, 'recent_reports', 'reports') || [], 'reports').map(normalizeReport),
  };
}

// ---------- API groups ----------
export const authApi = {
  async login(email, password) {
    const body = LOGIN_AS_FORM ? new URLSearchParams({ username: email, password }) : { email, password };
    const { data } = await http.post(ENDPOINTS.login, body);
    const token = first(data, 'access_token', 'token');
    if (!token) throw new Error('Login succeeded but the server returned no token.');
    return token;
  },
  signup: (payload) => http.post(ENDPOINTS.signup, payload).then((r) => r.data),
};
export const userApi = {
  me: () => http.get(ENDPOINTS.me).then((r) => r.data),
  update: (payload) => http.put(ENDPOINTS.me, payload).then((r) => r.data),
};
export const dashboardApi = { get: () => http.get(ENDPOINTS.dashboard).then((r) => normalizeDashboard(r.data)) };
export const reportsApi = {
  list: () => http.get(ENDPOINTS.reports).then((r) => toList(r.data, 'reports').map(normalizeReport)),
  get: (id) => http.get(ENDPOINTS.report(id)).then((r) => normalizeReport(r.data)),
  upload(file, onProgress) {
    const form = new FormData();
    form.append('file', file);
    return http.post(ENDPOINTS.upload, form, {
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    }).then((r) => normalizeReport(r.data));
  },
  async openFile(id) {
    const res = await http.get(ENDPOINTS.reportFile(id), { responseType: 'blob' });
    window.open(URL.createObjectURL(res.data), '_blank');
  },
};
export const chatApi = {
  async send(message, reportId) {
    const payload = { message };
    if (reportId) payload.report_id = reportId;
    const { data } = await http.post(ENDPOINTS.chat, payload);
    return typeof data === 'string' ? data : first(data, 'reply', 'response', 'answer', 'message') || '';
  },
};
