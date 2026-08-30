const Admin = require('../models/Admin');

// Must run AFTER `auth`. Allows only an active Super Admin (used for user management).
module.exports = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin || !admin.active) {
            return res.status(401).json({ error: 'Account not found or deactivated. Please log in again.' });
        }
        if (admin.role !== 'superadmin') {
            return res.status(403).json({ error: 'Super Admin access required.' });
        }
        req.adminDoc = admin;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
