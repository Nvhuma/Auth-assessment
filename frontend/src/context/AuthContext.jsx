// frontend/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';


// This is the "container" for our auth state
const AuthContext = createContext(null);

// This wraps our entire app and makes auth state available everywhere
export function AuthProvider({ children }) {
  // State: the current user object (null if not logged in)
  const [user, setUser] = useState(null);
  
  // State: whether we're still checking if the user is logged in (initial load)
  const [loading, setLoading] = useState(true);

  // useEffect with empty dependency [] runs ONCE when the component mounts.
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      // Parse the stored JSON string back into an object
      setUser(JSON.parse(storedUser));
    }
    
    // Done checking — we know if user is logged in or not
    setLoading(false);
  }, []);

  // Login function: store token + user in state AND localStorage
  // localStorage persists across page refreshes (unlike component state)
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout function: clear everything
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // The value we expose to all consumers of this context
  const value = {
    user,      // The current user object (or null)
    loading,   // Are we still loading?
    login,     // Function to log in
    logout,    // Function to log out
    isAuthenticated: !!user, // Boolean: is the user logged in? !! converts to boolean
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Components just call: const { user, login, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // If someone uses useAuth() outside of AuthProvider, give a clear error
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}