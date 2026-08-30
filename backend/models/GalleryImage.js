const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    title: { type: String, trim: true, default: '' },
    image: { type: String, required: true }, // URL or /api/uploads/<file>
    order: { type: Number, default: 0 },      // ascending display order on the site
    active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', gallerySchema);
