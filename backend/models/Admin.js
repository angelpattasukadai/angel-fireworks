const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { PERMISSION_KEYS } = require('../config/permissions');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    permissions: { type: [String], enum: PERMISSION_KEYS, default: [] },
    active: { type: Boolean, default: true },
}, { timestamps: true });

// Hash the password automatically before saving (only when it changed)
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare a plain-text password against the stored hash
adminSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
