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
}, { timestamps: true }));
