const mongoose = require('mongoose');

// An estimate (quotation) mirrors an invoice's line maths but carries no payment and never
// touches stock. It exists so a customer can be handed a price quote before the sale; when they
// confirm, it is converted into a real Invoice (which is where stock + payment are handled).
const estimateItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    tamilName: { type: String, default: '' },
    mrp: Number, // normal (pre-discount) rate, for showing the offer on the estimate
    sku: { type: String, default: '' },
    hsn: String,
    priceIncludesTax: Boolean,
    discountAmount: Number,
    cgstAmount: Number,
    sgstAmount: Number,
    igstAmount: Number,
    unit: { type: String, default: 'pcs' },
    quantity: { type: Number, required: true, min: 0.01 },
    rate: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, default: 0, min: 0 },
    taxableAmount: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    total: { type: Number, required: true },
}, { _id: false });

const estimateSchema = new mongoose.Schema({
    estimateNumber: { type: String, required: true, unique: true },
    requestId: { type: String, unique: true, sparse: true },
    customerName: { type: String, trim: true, default: 'Walk-in Customer' },
    customerPhone: { type: String, trim: true, default: '' },
    customerAltPhone: { type: String, trim: true, default: '' },
    customerAddress: { type: String, trim: true, default: '' },
    customerPincode: { type: String, trim: true, default: '' },
    customerGstin: String,
    placeOfSupply: String,
    placeOfSupplyName: String,
    business: { name: String, address: String, gstin: String, stateCode: String, stateName: String, phone: String, demo: Boolean },
    taxableAmount: Number,
    cgstAmount: Number,
    sgstAmount: Number,
    igstAmount: Number,
    items: { type: [estimateItemSchema], validate: [(v) => v.length > 0, 'Add at least one item.'] },
    subtotal: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true },
    note: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Open', 'Converted', 'Cancelled'], default: 'Open' },
    convertedInvoiceNumber: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('Estimate', estimateSchema);
