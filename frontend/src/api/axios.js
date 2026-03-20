// frontend/src/api/axios.js
//CUSTOM Axios instance instead of using the default axios object.
// This allows us to set default config (base URL) and add interceptors ONCE,
// and have it apply to every API call in the entire app.

import axios from 'axios';

// Create a pre-configured instance
const api = axios.create({
  // The base URL for all requests.
  baseURL: 'http://localhost:5098/api',

  // Tell the server we're sending JSON in the request body
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — runs before every request is sent.
// Automatically attaches the JWT token to every outgoing request.
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage — it was stored there after login
    const token = localStorage.getItem('token');

    if (token) {
      // HTTP Authorization header with Bearer scheme is the standard for JWTs
      // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Return the modified config — the request continues
  },
  (error) => Promise.reject(error) // If setup fails, reject the promise
);

// Response interceptor — runs after every response is received.
//handle 401 (Unauthorized) globally — redirect to login.
api.interceptors.response.use(
  (response) => response, // Success: just pass through
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — log the user out
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page without using React Router (no router context here)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;