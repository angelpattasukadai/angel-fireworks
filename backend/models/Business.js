const mongoose = require('mongoose');
module.exports = mongoose.model('Business', new mongoose.Schema({
  _id: { type: String, default: 'shop' },
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  gstin: { type: String, required: true, uppercase: true, trim: true },
  stateCode: { type: String, required: true },
  stateName: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  demo: { type: Boolean, default: true },
  // Overall tax settings — one GST rate, one HSN and one tax-inclusive flag apply to every item
  // billed, instead of a per-product value.
  gstRate: { type: Number, min: 0, max: 100, default: 18 },
  hsn: { type: String, trim: true, default: '3604' },
  priceIncludesTax: { type: Boolean, default: true },
}, { timestamps: true }));
