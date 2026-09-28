import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, userApi, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(tokenStore.get());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    userApi.me().then(setUser).catch(() => logout()).finally(() => setLoading(false));
  }, [token, logout]);

  useEffect(() => {
    window.addEventListener('healthos:unauthorized', logout);
    return () => window.removeEventListener('healthos:unauthorized', logout);
  }, [logout]);

  const login = async (email, password) => {
    const t = await authApi.login(email, password);
    tokenStore.set(t);
    setLoading(true);
    setToken(t);
  };
  const signup = async (payload) => {
    await authApi.signup(payload);
    await login(payload.email, payload.password);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, signup, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
