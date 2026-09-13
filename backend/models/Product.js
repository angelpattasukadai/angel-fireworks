const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountedPrice: { type: Number },
    category: { type: String, required: true },
    sku: { type: String, trim: true, default: '' },
    hsn: { type: String, trim: true, default: '' },
    priceIncludesTax: { type: Boolean, default: false },
    unit: { type: String, trim: true, default: 'pcs' },
    gstRate: { type: Number, min: 0, max: 100, default: 0 },
    stockQuantity: { type: Number, min: 0, default: 0 },
    trackStock: { type: Boolean, default: false },
    image: { type: String, default: 'https://images.unsplash.com/photo-1533230676451-408990cf2bdf?q=80&w=600&auto=format&fit=crop' },
    inStock: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
