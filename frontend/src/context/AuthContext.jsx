// frontend/src/context/AuthContext.jsx
// Auth context — manages login state across the entire app.
// logout() now calls the backend to invalidate the token server-side
// before clearing localStorage.

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On every page load, restore session from localStorage
  useEffect(() => {
    const storedUser  = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Store token + user in state AND localStorage after login/register
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Call the backend logout endpoint THEN clear local state
  // This invalidates the token server-side so it can't be reused
  const logout = async () => {
    try {
      // Tell the backend to mark this token as invalid
      // The Axios interceptor automatically attaches the Bearer token
      await api.post('/auth/logout');
    } catch (err) {
      // Even if the API call fails, we still log out locally
      // The token will expire naturally after 8 hours
      console.error('Logout API call failed:', err);
    } finally {
      // Always clear local storage regardless of API result
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}