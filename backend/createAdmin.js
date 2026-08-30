/**
 * Creates (or updates) the admin login account.
 *
 * Usage:
 *   npm run create-admin                 # uses ADMIN_USERNAME / ADMIN_PASSWORD from .env
 *   node createAdmin.js myuser mypass    # or pass username & password as arguments
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const username = process.argv[2] || process.env.ADMIN_USERNAME;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

if (!username || !password) {
    console.error('❌ Provide a username & password (via arguments or ADMIN_USERNAME / ADMIN_PASSWORD in .env).');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected.');

        let admin = await Admin.findOne({ username });
        if (admin) {
            admin.password = password; // pre-save hook re-hashes it
            admin.role = 'superadmin';
            admin.active = true;
            await admin.save();
            console.log(`✅ Super Admin "${username}" password updated.`);
        } else {
            await Admin.create({ username, password, role: 'superadmin', active: true });
            console.log(`✅ Super Admin "${username}" created.`);
        }

        await mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
