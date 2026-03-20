// frontend/src/pages/Dashboard.jsx
// Protected user details page — only accessible when logged in.
// Wonga-inspired layout: blue hero banner, white detail cards, clean grid.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch fresh user details from the protected API endpoint on mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // GET /api/auth/me — JWT token is auto-attached by our Axios interceptor
        const response = await api.get('/auth/me');
        setUserDetails(response.data);
      } catch (err) {
        setError('Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.loadingCard}>Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.errorCard}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* Blue hero banner */}
        <div className={styles.heroBanner}>
          <div className={styles.avatar}>
            {userDetails?.firstName?.[0]?.toUpperCase()}
          </div>
          <div className={styles.welcomeText}>
            <h1 className={styles.welcomeTitle}>
              Welcome back, {userDetails?.firstName}!
            </h1>
            <p className={styles.welcomeSubtitle}>
              Here's your account information
            </p>
          </div>
        </div>

        {/* User details card */}
        <div className={styles.detailsCard}>
          <span className={styles.sectionLabel}>Your Details</span>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>First Name</div>
              <div className={styles.detailValue}>{userDetails?.firstName}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Last Name</div>
              <div className={styles.detailValue}>{userDetails?.lastName}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Email Address</div>
              <div className={styles.detailValue}>{userDetails?.email}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Account ID</div>
              <div className={styles.detailValue}>#{userDetails?.id}</div>
            </div>
          </div>

          <button onClick={handleLogout} className={styles.logoutButton}>
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;