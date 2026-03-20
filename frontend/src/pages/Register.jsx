// frontend/src/pages/Register.jsx
// Register page with real-time password strength indicator.
// Checks 4 rules as the user types — each rule met fills one strength bar.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Auth.module.css';

// Password rules — each has a label and a test function
// This array drives both the strength bar AND the validation on submit
const PASSWORD_RULES = [
  { label: 'At least 6 characters',        test: (p) => p.length >= 6 },
  { label: 'One uppercase letter',          test: (p) => /[A-Z]/.test(p) },
  { label: 'One number',                    test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$%)', test: (p) => /[!@#$%^&*]/.test(p) },
];

// Returns a label and color class based on how many rules pass
function getStrength(password) {
  const score = PASSWORD_RULES.filter(r => r.test(password)).length;
  if (score === 0) return { label: '',       color: 'empty'  };
  if (score === 1) return { label: 'Weak',   color: 'weak'   };
  if (score === 2) return { label: 'Fair',   color: 'fair'   };
  if (score === 3) return { label: 'Good',   color: 'good'   };
  return             { label: 'Strong', color: 'strong' };
}

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword]     = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordTouched(true);
    handleChange(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all rules pass before hitting the API
    const failedRules = PASSWORD_RULES.filter(r => !r.test(formData.password));
    if (failedRules.length > 0) {
      setError(`Password needs: ${failedRules.map(r => r.label).join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName:  formData.lastName,
        email:     formData.email,
        password:  formData.password,
      });

      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength   = getStrength(formData.password);
  const scoreCount = PASSWORD_RULES.filter(r => r.test(formData.password)).length;

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join us today</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>

            {/* Password input with show/hide toggle */}
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Strength bars — only show after user starts typing */}
            {passwordTouched && formData.password.length > 0 && (
              <div className={styles.strengthWrap}>
                <div className={styles.strengthBars}>
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`${styles.strengthBar} ${i < scoreCount ? styles[strength.color] : ''}`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <span className={`${styles.strengthLabel} ${styles[strength.color]}`}>
                    {strength.label}
                  </span>
                )}
              </div>
            )}

            {/* Rule checklist */}
            {passwordTouched && (
              <ul className={styles.rulesList}>
                {PASSWORD_RULES.map((rule, i) => (
                  <li
                    key={i}
                    className={`${styles.rule} ${rule.test(formData.password) ? styles.rulePassed : styles.ruleFailed}`}
                  >
                    {rule.test(formData.password) ? '✓' : '✗'} {rule.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;