// frontend/src/components/Loader.jsx
// Loading screen shown on first page load.


import { useState, useEffect } from 'react';
import styles from './Loader.module.css';

function Loader() {
  const [visible, setVisible] = useState(true);

  // Hide the loader from the DOM after the fade-out animation completes
  // so it doesn't block clicks on the page beneath it
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.logoWrap}>

        {/* Blue outline W — always visible */}
        <svg
          className={styles.wOutline}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rounded square background */}
          <rect width="80" height="80" rx="14" fill="#e6f7fc" />
          {/* W outline path */}
          <path
            d="M12 20 L24 58 L40 34 L56 58 L68 20"
            stroke="#0099cc"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        {/* Solid blue W — animates filling from bottom to top */}
        <svg
          className={styles.wFill}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="80" height="80" rx="14" fill="#0099cc" />
          <path
            d="M12 20 L24 58 L40 34 L56 58 L68 20"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

      </div>

      <p className={styles.tagline}>Loading your experience</p>

      {/* Progress bar along the bottom of the screen */}
      <div className={styles.progressBar} />
    </div>
  );
}

export default Loader;