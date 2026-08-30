// Grantable permissions for sub-admins. The Super Admin implicitly has all of these
// plus exclusive user-management rights (not a grantable permission).
const PERMISSIONS = [
    { key: 'products', label: 'Manage Products (Catalog)' },
    { key: 'orders', label: 'Manage Orders' },
    { key: 'gallery', label: 'Manage Gallery' },
];

const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

module.exports = { PERMISSIONS, PERMISSION_KEYS };
