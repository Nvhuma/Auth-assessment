// frontend/src/components/Navbar.jsx
// Clean white navigation bar — Wonga style.
// White background, blue logo, nav links, blue CTA button on the right.

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#0099cc" />
              <path
                d="M6 10 L12 29 L20 17 L28 29 L34 10"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className={styles.logoText}>auth<strong>app</strong></span>
        </Link>

        {/* Nav links */}
        <div className={styles.links}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={styles.link}>Dashboard</Link>
              <button onClick={handleLogout} className={styles.ctaBtn}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>Sign In</Link>
              <Link to="/register" className={styles.ctaBtn}>
                Get Started
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;