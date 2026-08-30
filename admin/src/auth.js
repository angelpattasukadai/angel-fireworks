// Helpers for storing / reading the admin session (token + identity + role/permissions).
const TOKEN_KEY = 'angel_admin_token';
const USER_KEY = 'angel_admin_user';
const ROLE_KEY = 'angel_admin_role';
const PERMS_KEY = 'angel_admin_perms';

// Save the full login payload: { token, username, role, permissions }
export const saveAuth = ({ token, username, role, permissions }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, username || '');
    localStorage.setItem(ROLE_KEY, role || 'admin');
    localStorage.setItem(PERMS_KEY, JSON.stringify(permissions || []));
};

// Refresh just role/permissions (e.g. from /auth/me) without touching the token
export const updateAuth = ({ role, permissions }) => {
    if (role !== undefined) localStorage.setItem(ROLE_KEY, role);
    if (permissions !== undefined) localStorage.setItem(PERMS_KEY, JSON.stringify(permissions || []));
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUsername = () => localStorage.getItem(USER_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY) || 'admin';
export const getPermissions = () => {
    try { return JSON.parse(localStorage.getItem(PERMS_KEY)) || []; } catch { return []; }
};

export const isSuperAdmin = () => getRole() === 'superadmin';
export const hasPermission = (key) => isSuperAdmin() || getPermissions().includes(key);

export const clearAuth = () => {
    [TOKEN_KEY, USER_KEY, ROLE_KEY, PERMS_KEY].forEach((k) => localStorage.removeItem(k));
};

export const isLoggedIn = () => !!getToken();
