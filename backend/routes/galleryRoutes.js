const express = require('express');
const router = express.Router();
const GalleryImage = require('../models/GalleryImage');
const auth = require('../middleware/auth');
const permit = require('../middleware/permit');

// Public — customer Gallery page reads this (sorted by order, then oldest first)
router.get('/', async (req, res) => {
    try {
        const images = await GalleryImage.find({}).sort({ order: 1, createdAt: 1 });
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create (gallery permission)
router.post('/', auth, permit('gallery'), async (req, res) => {
    try {
        const { title, image, order, active } = req.body;
        if (!image || !String(image).trim()) {
            return res.status(400).json({ error: 'An image is required.' });
        }
        const img = await GalleryImage.create({
            title: (title || '').trim(),
            image: String(image).trim(),
            order: Number(order) || 0,
            active: active !== false,
        });
        res.status(201).json(img);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update (gallery permission)
router.put('/:id', auth, permit('gallery'), async (req, res) => {
    try {
        const update = {};
        if (req.body.title !== undefined) update.title = String(req.body.title).trim();
        if (req.body.image !== undefined) update.image = String(req.body.image).trim();
        if (req.body.order !== undefined) update.order = Number(req.body.order) || 0;
        if (req.body.active !== undefined) update.active = !!req.body.active;
        const img = await GalleryImage.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!img) return res.status(404).json({ error: 'Image not found.' });
        res.json(img);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete (gallery permission)
router.delete('/:id', auth, permit('gallery'), async (req, res) => {
    try {
        await GalleryImage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Image deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
