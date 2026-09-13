const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, default: '' },
    unit: { type: String, default: 'pcs' },
    quantity: { type: Number, required: true, min: 0.01 },
    rate: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, default: 0, min: 0 },
    taxableAmount: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    total: { type: Number, required: true },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, trim: true, default: 'Walk-in Customer' },
    customerPhone: { type: String, trim: true, default: '' },
    customerAddress: { type: String, trim: true, default: '' },
    items: { type: [invoiceItemSchema], validate: [(v) => v.length > 0, 'Add at least one item.'] },
    subtotal: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true },
    paidAmount: { type: Number, required: true, min: 0 },
    dueAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Card', 'Credit', 'Mixed'], default: 'Cash' },
    status: { type: String, enum: ['Paid', 'Partial', 'Due'], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
