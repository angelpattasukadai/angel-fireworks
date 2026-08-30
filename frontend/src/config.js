// Base URL of the backend API.
// - Local dev: leave VITE_API_URL unset → '' → calls stay relative ('/api/..') and Vite proxies them.
// - Production: set VITE_API_URL (e.g. https://angel-api.onrender.com) in the host's env.
export const API_BASE = import.meta.env.VITE_API_URL || '';

// Build a full API URL for a given path (e.g. apiUrl('/api/products')).
export const apiUrl = (path) => `${API_BASE}${path}`;

// Resolve an image src: absolute URLs (Cloudinary/https) pass through unchanged;
// legacy backend-relative paths ('/api/uploads/..') get the API base prefixed.
export const imgUrl = (src) => (src && src.startsWith('/api/') ? `${API_BASE}${src}` : src);
