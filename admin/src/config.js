// Base URL of the backend API (same idea as the customer app).
// Local dev: leave VITE_API_URL unset → '' → axios baseURL '/api' via Vite proxy.
// Production: set VITE_API_URL (e.g. https://angel-api.onrender.com).
export const API_BASE = import.meta.env.VITE_API_URL || '';

// Resolve an image src: absolute (Cloudinary/https) pass through; legacy '/api/uploads/..'
// gets the API base prefixed so it still loads cross-origin.
export const imgUrl = (src) => (src && src.startsWith('/api/') ? `${API_BASE}${src}` : src);
