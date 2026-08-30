const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Cloudinary is used in production (persistent CDN URLs). If its env vars aren't set
// (e.g. local dev), we fall back to writing the file to disk under /uploads.
const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

let cloudinary;
if (cloudinaryConfigured) {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

// Accepted image types → canonical extension (never trust the client filename)
const MIME_EXT = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
};

const fileFilter = (req, file, cb) => {
    if (MIME_EXT[file.mimetype]) cb(null, true);
    else cb(new Error('Only image files are allowed (jpg, png, webp, gif, avif).'));
};

// Buffer the file in memory; we then either stream it to Cloudinary or write to disk.
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Disk fallback dir (used only when Cloudinary isn't configured)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function uploadBufferToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'angel-fireworks', resource_type: 'image' },
            (err, result) => (err ? reject(err) : resolve(result.secure_url))
        );
        stream.end(buffer);
    });
}

// POST /api/upload (admin only) — multipart field name: "image"
router.post('/', auth, (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: 'No image file was provided.' });

        try {
            if (cloudinaryConfigured) {
                const url = await uploadBufferToCloudinary(req.file.buffer);
                return res.json({ url }); // absolute CDN URL — works across all origins
            }
            // Dev fallback: persist to local disk, return a proxied path
            const ext = MIME_EXT[req.file.mimetype] || '.img';
            const name = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            fs.writeFileSync(path.join(uploadDir, name), req.file.buffer);
            return res.json({ url: `/api/uploads/${name}` });
        } catch (e) {
            return res.status(500).json({ error: 'Image upload failed: ' + e.message });
        }
    });
});

module.exports = router;
