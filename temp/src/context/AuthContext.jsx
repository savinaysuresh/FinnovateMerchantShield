// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '../services/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'fraudApp_auth'; // stores { token, user }

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setAuth(parsed);
        if (parsed?.token) setAuthToken(parsed.token);
      }
    } catch (e) {
      console.warn('Failed to load auth from storage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = ({ token = null, user = null }) => {
    const payload = { token, user };
    setAuth(payload);
    if (token) setAuthToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user: auth.user, token: auth.token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
