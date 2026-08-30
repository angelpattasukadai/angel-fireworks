const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');

// POST /api/auth/login — validate credentials, return a signed JWT + role/permissions for the UI
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        const admin = await Admin.findOne({ username: username.trim() });
        // Same generic message whether the user or the password is wrong (avoids leaking which one).
        if (!admin) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }
        if (!admin.active) {
            return res.status(403).json({ error: 'This account has been deactivated. Contact the Super Admin.' });
        }

        const match = await admin.comparePassword(password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Token stays identity-only; role/permissions are re-checked from the DB on each request.
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            token,
            username: admin.username,
            name: admin.name,
            role: admin.role,
            permissions: admin.permissions,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me — re-reads the DB so the frontend always has fresh role/permissions
// (and a deactivated/deleted account is rejected immediately).
router.get('/me', auth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password');
        if (!admin || !admin.active) {
            return res.status(401).json({ error: 'Account not found or deactivated. Please log in again.' });
        }
        res.json({
            username: admin.username,
            name: admin.name,
            role: admin.role,
            permissions: admin.permissions,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
