import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('hw_user');
  if (user) {
    const token = JSON.parse(user).token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // If backend returns 401 Unauthorized, clear stale token and redirect to login page
    if (err.response?.status === 401) {
      localStorage.removeItem('hw_user');
      localStorage.removeItem('hw_active_session_id');
      sessionStorage.clear();
      window.location.href = '/login';
      return new Promise(() => {}); // prevent further errors from propagating
    }
    const msg = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);

export default api;
