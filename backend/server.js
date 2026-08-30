const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dbReady = require('./middleware/dbReady');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// In production, restrict CORS to the deployed frontends (CLIENT_URL/ADMIN_URL).
// If neither is set (local dev), allow all origins.
const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));
app.use(express.json());

// Database Connection
mongoose.set('bufferTimeoutMS', 8000); // fail buffered queries faster if DB is down
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
    .then(() => console.log('✅ MongoDB connected to Angel Fireworks'))
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        console.error('   → Whitelist your IP in Atlas (Network Access), or check MONGO_URI / internet.');
    });

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected.'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected.'));

// Serve uploaded product images (proxied via /api on both frontends).
// nosniff stops browsers from re-interpreting a file as active content (defense-in-depth vs upload abuse).
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// Routes (dbReady guard gives a clean 503 instead of a 10s buffering hang when Mongo is down)
app.use('/api/auth', dbReady, authRoutes);
app.use('/api/products', dbReady, productRoutes);
app.use('/api/orders', dbReady, orderRoutes);
app.use('/api/gallery', dbReady, galleryRoutes);
app.use('/api/admins', dbReady, adminRoutes);
app.use('/api/upload', uploadRoutes); // no DB needed for uploads

// Health Check
app.get('/api/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.json({
        status: 'ok',
        message: 'Angel Fireworks API is running smoothly.',
        db: dbConnected ? 'connected' : 'disconnected',
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
