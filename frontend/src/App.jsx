// frontend/src/App.jsx

// App.jsx is the root component — it sets up routing.
// React Router's BrowserRouter enables client-side routing:
// - No page reloads when navigating between pages
// - The URL changes but React renders the new component without a full refresh
// This is what makes React a "Single Page Application" (SPA)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    // BrowserRouter: uses the HTML5 History API for clean URLs (no #hash)
    <BrowserRouter>
      {/* AuthProvider wraps everything so ALL routes can access auth state */}
      <AuthProvider>
        <Routes>
          {/* Public routes — accessible without authentication */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes — wrapped in ProtectedRoute */}
          {/* If not authenticated, ProtectedRoute redirects to /login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          
          {/* Default redirect: "/" goes to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;