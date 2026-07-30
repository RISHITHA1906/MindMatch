import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // This flag BLOCKS PrivateRoute from redirecting during registration
  const isRegisteringRef = useRef(false);

  useEffect(() => {
    // If we are on the /register page, do NOT auto-login from stored token
    if (window.location.pathname === '/register') {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('mm_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API}/auth/me`)
        .then(r => setUser(r.data))
        .catch(() => {
          localStorage.removeItem('mm_token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password) => {
    const { data } = await axios.post(`${API}/auth/login`, {
      email: identifier, phone: identifier, password
    });
    localStorage.setItem('mm_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  const logout = () => {
    try { axios.post(`${API}/auth/logout`); } catch {}
    localStorage.removeItem('mm_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Called ONLY after all 4 steps are complete and API returns success
  const completeRegistration = (userData, token) => {
    localStorage.setItem('mm_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const updateUser = (updated) => {
    setUser(prev => prev ? { ...prev, ...updated } : updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, completeRegistration, API }}>
      {children}
    </AuthContext.Provider>
  );
}
