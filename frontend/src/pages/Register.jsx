// frontend/src/pages/Register.jsx

// Pages are "smart" components — they own state and make API calls.
// They compose smaller UI components (like form fields, buttons).
// keep API calls in pages (or custom hooks), not deep in UI components.
// This keeps UI components "dumb" and reusable.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Auth.module.css';

function Register() {
  // Controlled form state — React controls the form inputs
  // This is "controlled components" pattern — React is the single source of truth
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');    // API error messages
  const [loading, setLoading] = useState(false); // Disable button while submitting
  
  const { login } = useAuth();
  const navigate = useNavigate(); // Programmatic navigation (redirect after login)

  // Single handler for ALL form inputs 
  // [e.target.name] = computed property key (dynamic property name)
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,              // Keep all existing fields
      [e.target.name]: e.target.value, // Update only the changed field
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default HTML form submission (page reload)
    
    setError('');       // Clear previous errors
    setLoading(true);   // Show loading state

    try {
      // POST to /api/auth/register
      // Axios instance has baseURL set, so we just need the path
      const response = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      // Destructure the response data
      const { token, user } = response.data;
      
      // Store auth state — this also saves to localStorage
      login(token, user);
      
      // Redirect to the user details page
      navigate('/dashboard');
      
    } catch (err) {
      // Axios throws on 4xx/5xx responses
      // err.response?.data?.message is the error from the API's JSON body
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      // "finally" runs whether the try succeeded or failed
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join us today</p>

        {/* Show error message if there is one */}
        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"           // Must match the formData key
                value={formData.firstName} // Controlled: React controls the value
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
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading} // Prevent double-submission
          >
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