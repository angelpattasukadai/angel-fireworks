const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables BEFORE requiring routes — some routes (e.g. uploadRoutes)
// read process.env at module-load time, so this must come first.
dotenv.config();

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const estimateRoutes = require('./routes/estimateRoutes');
const dbReady = require('./middleware/dbReady');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// In production, restrict CORS to the deployed frontends (CLIENT_URL/ADMIN_URL).
// If neither is set (local dev), allow all origins.
const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));
app.use(express.json());

// Database Connection — keeps retrying so the server self-heals if the DB is briefly
// unreachable at boot (e.g. Atlas whitelist not ready yet). No manual restart needed.
mongoose.set('bufferTimeoutMS', 8000); // fail buffered queries faster if DB is down

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
        console.log('✅ MongoDB connected to Angel Fireworks');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        console.error('   → Retrying in 5s… (check Atlas Network Access 0.0.0.0/0 and MONGO_URI)');
        setTimeout(connectDB, 5000); // retry until it succeeds
    }
};
connectDB();

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected — will auto-reconnect.'));
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
app.use('/api/invoices', dbReady, invoiceRoutes);
app.use('/api/estimates', dbReady, estimateRoutes);
app.use('/api/business', dbReady, require('./routes/businessRoutes'));
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

// Keep the free Render instance warm so customers don't hit a ~50s cold start.
// Pings its own public health URL every 10 min (Render sleeps after 15 min idle —
// 10 min leaves a safe margin even if a ping is delayed or fails once).
// NOTE: a self-ping only prevents sleeping while the service is running; it cannot
// wake a service that has already slept. For rock-solid uptime, also add a free
// external monitor (UptimeRobot / cron-job.org) hitting /api/health every 5 min.
const SELF_URL = process.env.RENDER_EXTERNAL_URL;
if (SELF_URL) {
    setInterval(() => {
        fetch(`${SELF_URL}/api/health`).catch(() => {});
    }, 10 * 60 * 1000);
    console.log('Keep-alive self-ping enabled:', SELF_URL);
} else {
    console.warn('⚠️  RENDER_EXTERNAL_URL not set — keep-alive self-ping is OFF (expect cold starts).');
}
