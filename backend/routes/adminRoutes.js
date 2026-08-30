const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');
const superOnly = require('../middleware/superOnly');
const { PERMISSION_KEYS } = require('../config/permissions');

// Every user-management route requires a logged-in Super Admin.
router.use(auth, superOnly);

const cleanPermissions = (perms) =>
    Array.isArray(perms) ? [...new Set(perms.filter((p) => PERMISSION_KEYS.includes(p)))] : [];

// List all admins (password excluded)
router.get('/', async (req, res) => {
    try {
        const admins = await Admin.find({}).select('-password').sort({ createdAt: -1 });
        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a sub-admin (role forced to 'admin' — Super Admins are made only via create-admin script)
router.post('/', async (req, res) => {
    try {
        const { username, password, name, permissions } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }
        const existing = await Admin.findOne({ username: username.trim() });
        if (existing) {
            return res.status(400).json({ error: 'That username is already taken.' });
        }
        const admin = await Admin.create({
            username: username.trim(),
            password,
            name: (name || '').trim(),
            role: 'admin',
            permissions: cleanPermissions(permissions),
            active: true,
        });
        const obj = admin.toObject();
        delete obj.password;
        res.status(201).json(obj);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a sub-admin (name, permissions, active, optional password reset)
router.put('/:id', async (req, res) => {
    try {
        const target = await Admin.findById(req.params.id);
        if (!target) return res.status(404).json({ error: 'User not found.' });
        if (target.role === 'superadmin') {
            return res.status(403).json({ error: 'Super Admin accounts cannot be edited here.' });
        }
        if (String(target._id) === String(req.adminDoc._id)) {
            return res.status(403).json({ error: 'You cannot edit your own account here.' });
        }

        const { name, permissions, active, password } = req.body;
        if (name !== undefined) target.name = String(name).trim();
        if (permissions !== undefined) target.permissions = cleanPermissions(permissions);
        if (active !== undefined) target.active = !!active;
        if (password) target.password = password; // pre-save hook re-hashes

        await target.save();
        const obj = target.toObject();
        delete obj.password;
        res.json(obj);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a sub-admin
router.delete('/:id', async (req, res) => {
    try {
        const target = await Admin.findById(req.params.id);
        if (!target) return res.status(404).json({ error: 'User not found.' });
        if (target.role === 'superadmin') {
            return res.status(403).json({ error: 'Super Admin accounts cannot be deleted here.' });
        }
        if (String(target._id) === String(req.adminDoc._id)) {
            return res.status(403).json({ error: 'You cannot delete your own account.' });
        }
        await target.deleteOne();
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
