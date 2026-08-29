import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('acousticpulse_token'));
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    async function initUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api.auth.getMe();
        setUser(user);
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }
    initUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    localStorage.setItem('acousticpulse_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await api.auth.register(userData);
    localStorage.setItem('acousticpulse_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const quickLogin = async (role) => {
    const map = {
      ADMIN: { email: 'admin@acousticpulse.gov', password: 'Admin@12345' },
      AUTHORITY: { email: 'officer.chennai@acousticpulse.gov', password: 'Officer@12345' },
      CITIZEN: { email: 'citizen@acousticpulse.gov', password: 'Citizen@12345' }
    };
    const creds = map[role] || map.ADMIN;
    return await login(creds.email, creds.password);
  };

  const logout = () => {
    localStorage.removeItem('acousticpulse_token');
    setToken(null);
    setUser(null);
  };

  const role = user?.role || 'GUEST';
  const isAdmin = role === 'ADMIN';
  const isAuthority = role === 'AUTHORITY' || role === 'ADMIN';
  const isCitizen = role === 'CITIZEN' || !user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role,
        isAdmin,
        isAuthority,
        isCitizen,
        isAuthenticated: !!user,
        login,
        register,
        quickLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
