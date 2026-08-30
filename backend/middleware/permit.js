const Admin = require('../models/Admin');

// permit('products', ...) — must run AFTER `auth`. Re-reads the admin from the DB so that
// permission changes / deactivation take effect immediately (JWT stays identity-only).
// Super Admin bypasses all checks.
module.exports = (...required) => async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin || !admin.active) {
            return res.status(401).json({ error: 'Account not found or deactivated. Please log in again.' });
        }
        req.adminDoc = admin;

        if (admin.role === 'superadmin') return next();

        const ok = required.every((p) => admin.permissions.includes(p));
        if (!ok) {
            return res.status(403).json({ error: 'You do not have permission to perform this action.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
