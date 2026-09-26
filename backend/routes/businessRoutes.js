const router = require('express').Router();
const Business = require('../models/Business');
const auth = require('../middleware/auth');
const permit = require('../middleware/permit');
const superOnly = require('../middleware/superOnly');
router.get('/', auth, permit('billing'), async (req, res) => {
  try { res.json(await Business.findById('shop') || {}); } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/', auth, superOnly, async (req, res) => {
  try {
    const { name, address, stateName, stateCode, phone } = req.body;
    const gstin = String(req.body.gstin || '').trim().toUpperCase();
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin) || gstin.slice(0, 2) !== stateCode) throw new Error('Enter a GSTIN matching your state code.');
    const gstRate = Number(req.body.gstRate);
    if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) throw new Error('Overall GST rate must be between 0 and 100.');
    const hsn = String(req.body.hsn || '').trim();
    if (!/^\d{4}(\d{2})?(\d{2})?$/.test(hsn)) throw new Error('Overall HSN must be 4, 6 or 8 digits.');
    res.json(await Business.findByIdAndUpdate('shop', {
      name, address, stateName, stateCode, phone, gstin, demo: req.body.demo !== false,
      gstRate, hsn, priceIncludesTax: req.body.priceIncludesTax !== false,
    }, { upsert: true, new: true, runValidators: true }));
  } catch (e) { res.status(400).json({ error: e.message }); }
});
module.exports = router;
