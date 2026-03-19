// frontend/src/pages/Dashboard.jsx

// This is the PROTECTED page — only authenticated users see this.
// ProtectedRoute handles the redirect if not authenticated.


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch fresh user details from the API when the page loads.
  // I could use the cached `user` from context, but fetching from the API
  // demonstrates the protected endpoint and ensures data is current.
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // GET /api/auth/me — the Authorization: Bearer <token> header
        // is automatically added by our Axios interceptor
        const response = await api.get('/auth/me');
        setUserDetails(response.data);
      } catch (err) {
        setError('Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []); // Empty array = run once on mount

  const handleLogout = () => {
    logout();          // Clear auth state and localStorage
    navigate('/login'); // Redirect to login page
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>Loading your profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            {/* Show first letter of first name as avatar */}
            {userDetails?.firstName?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className={styles.welcomeTitle}>
              Welcome, {userDetails?.firstName}!
            </h1>
            <p className={styles.welcomeSubtitle}>Here's your profile information</p>
          </div>
        </div>

        {/* User Details */}
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>First Name</span>
            <span className={styles.detailValue}>{userDetails?.firstName}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Last Name</span>
            <span className={styles.detailValue}>{userDetails?.lastName}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Email Address</span>
            <span className={styles.detailValue}>{userDetails?.email}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Account ID</span>
            <span className={styles.detailValue}>#{userDetails?.id}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className={styles.logoutButton}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;