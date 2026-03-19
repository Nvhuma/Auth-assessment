// frontend/src/components/ProtectedRoute.jsx

// A "Higher Order Component" (HOC) pattern for protecting routes.
// Any route wrapped in <ProtectedRoute> requires authentication.
//FRONTEND security — it improves UX but doesn't replace
// backend security. The backend MUST also validate the JWT token.


import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();


  // don't render anything — avoid a flash of the login page for authenticated users
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        Loading...
      </div>
    );
  }

  // If not authenticated, redirect to /login

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // <Outlet /> renders the child route — the actual protected page
  return <Outlet />;
}

export default ProtectedRoute;