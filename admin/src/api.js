import axios from 'axios';
import { getToken, clearAuth } from './auth';
import { API_BASE } from './config';

// Central axios instance.
// Dev: API_BASE = '' → baseURL '/api' → Vite proxy to backend:5001.
// Prod: API_BASE = https://your-api-host → calls go straight to the deployed backend.
// 15s timeout so a dead/slow backend fails cleanly instead of hanging (upload calls override this).
const api = axios.create({ baseURL: `${API_BASE}/api`, timeout: 15000 });

// Attach the JWT to every request automatically.
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If the token is rejected (expired / invalid), log out and bounce to login.
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response && err.response.status === 401) {
            clearAuth();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(err);
    }
);

export default api;
