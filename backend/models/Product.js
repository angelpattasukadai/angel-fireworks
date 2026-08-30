const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountedPrice: { type: Number },
    category: { type: String, required: true },
    image: { type: String, default: 'https://images.unsplash.com/photo-1533230676451-408990cf2bdf?q=80&w=600&auto=format&fit=crop' },
    inStock: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
