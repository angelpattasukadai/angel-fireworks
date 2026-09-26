const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Estimate = require('../models/Estimate');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Business = require('../models/Business');
const Counter = require('../models/Counter');
const auth = require('../middleware/auth');
const permit = require('../middleware/permit');

router.use(auth, permit('billing'));

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

// List estimates, newest first (100 per page).
router.get('/', async (req, res) => {
    try {
        const page = Math.max(0, Math.floor(Number(req.query.page) || 0));
        const estimates = await Estimate.find({}).sort({ createdAt: -1, _id: -1 }).skip(page * 100).limit(100);
        res.json(estimates);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create an estimate. Same line maths as an invoice, but no payment and no stock movement.
router.post('/', async (req, res) => {
    try {
        const { items, customerName, customerPhone, customerAddress, discountAmount = 0 } = req.body;
        if (typeof req.body.requestId !== 'string' || !/^[\w-]{16,80}$/.test(req.body.requestId)) throw new Error('A valid request ID is required. Refresh the page.');
        const existing = await Estimate.findOne({ requestId: req.body.requestId });
        if (existing) return res.status(201).json(existing);
        const business = await Business.findById('shop').lean();
        if (!business?.gstin) throw new Error('Complete Shop GST Settings before creating estimates.');
        // Place of supply is optional — blank means a local sale, so fall back to the shop's own state.
        const placeOfSupply = String(req.body.placeOfSupply || '').trim() || business.stateCode || '';
        const placeOfSupplyName = String(req.body.placeOfSupplyName || '').trim() || business.stateName || '';
        if (!/^\d{2}$/.test(placeOfSupply) || !placeOfSupplyName) throw new Error('Set your shop state in Shop GST Settings, or enter the place of supply.');
        const customerGstin = String(req.body.customerGstin || '').trim().toUpperCase();
        if (customerGstin && !GSTIN_RE.test(customerGstin)) throw new Error('Invalid customer GSTIN.');
        if (!customerName?.trim() || !customerAddress?.trim()) throw new Error('Customer name and address are required for this estimate.');
        if (!Array.isArray(items) || !items.length || items.length > 200) throw new Error('Add between 1 and 200 items.');

        const quantities = new Map();
        for (const item of items) {
            const quantity = Number(item.quantity);
            if (!mongoose.isValidObjectId(item.productId) || !Number.isSafeInteger(quantity) || quantity <= 0) throw new Error('Every item needs a valid product and whole quantity.');
            quantities.set(item.productId, (quantities.get(item.productId) || 0) + quantity);
        }
        const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
        if (products.length !== quantities.size) throw new Error('One or more selected products no longer exist.');
        const productMap = new Map(products.map((p) => [String(p._id), p]));

        // Tax is shop-wide: one GST rate, one HSN and one tax-inclusive flag for every line.
        const gstRate = Number(business.gstRate || 0);
        if (!/^\d{4}(\d{2})?(\d{2})?$/.test(business.hsn || '')) throw new Error('Set a valid overall HSN in Shop GST Settings.');
        const rawItems = items.map((item) => {
            const product = productMap.get(String(item.productId));
            const quantity = Number(item.quantity);
            const rate = Number(product.discountedPrice || product.price);
            return { product: product._id, name: product.name, tamilName: product.description || '', mrp: Number(product.price), sku: product.sku, hsn: business.hsn, unit: product.unit, quantity, rate, gstRate, priceIncludesTax: !!business.priceIncludesTax };
        });
        const { calculate } = await import('../../shared/gst.mjs');
        const calculation = calculate(rawItems, Number(discountAmount), placeOfSupply !== business.stateCode);
        const { items: savedItems, subtotal, gstAmount, grandTotal, discountAmount: safeDiscount } = calculation;

        const date = new Date(Date.now() + 330 * 60000);
        const year = date.getUTCFullYear() - (date.getUTCMonth() < 3 ? 1 : 0);
        const prefix = business.demo ? 'DMEST' : 'EST';
        const counter = await Counter.findByIdAndUpdate(`${prefix}-${year}`, { $inc: { value: 1 } }, { upsert: true, new: true });
        if (counter.value > 9999999) throw new Error('Estimate sequence exhausted.');

        const estimate = await Estimate.create({
            business, customerGstin, placeOfSupply, placeOfSupplyName,
            taxableAmount: calculation.taxableAmount, cgstAmount: calculation.cgstAmount, sgstAmount: calculation.sgstAmount, igstAmount: calculation.igstAmount,
            requestId: req.body.requestId,
            estimateNumber: `${prefix}${year}-${String(counter.value).padStart(6, '0')}`,
            customerName: customerName.trim(), customerPhone: customerPhone?.trim() || '', customerAltPhone: String(req.body.customerAltPhone || '').trim(), customerAddress: customerAddress.trim(), customerPincode: String(req.body.customerPincode || '').trim(),
            items: savedItems, subtotal, gstAmount, discountAmount: safeDiscount, grandTotal, note: String(req.body.note || '').trim(), status: 'Open', createdBy: req.admin.id,
        });
        res.status(201).json(estimate);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Convert an open estimate into a real Invoice: re-checks live stock, deducts it, and issues an
// invoice number. The new bill starts fully due so payment is collected in Bills & Payments.
router.post('/:id/convert', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        let invoice;
        await session.withTransaction(async () => {
            const estimate = await Estimate.findById(req.params.id).session(session);
            if (!estimate) throw new Error('Estimate not found.');
            if (estimate.status === 'Converted') throw new Error(`Already converted to bill ${estimate.convertedInvoiceNumber}.`);
            if (estimate.status === 'Cancelled') throw new Error('This estimate was cancelled.');
            const business = await Business.findById('shop').session(session).lean();
            if (!business?.gstin) throw new Error('Complete Shop GST Settings first.');

            const est = estimate.toObject();
            const quantities = new Map();
            for (const it of est.items) quantities.set(String(it.product), (quantities.get(String(it.product)) || 0) + it.quantity);
            const products = await Product.find({ _id: { $in: [...quantities.keys()] } }).session(session);
            if (products.length !== quantities.size) throw new Error('One or more products in this estimate no longer exist.');
            const productMap = new Map(products.map((p) => [String(p._id), p]));
            for (const [id, quantity] of quantities) {
                const product = productMap.get(String(id));
                if (!product.inStock) throw new Error(`${product.name} is marked out of stock.`);
                if (product.trackStock && product.stockQuantity < quantity) throw new Error(`Only ${product.stockQuantity} ${product.unit} of ${product.name} available.`);
            }

            const date = new Date(Date.now() + 330 * 60000);
            const year = date.getUTCFullYear() - (date.getUTCMonth() < 3 ? 1 : 0);
            const prefix = business.demo ? 'DM' : 'AF';
            const counter = await Counter.findByIdAndUpdate(`${prefix}-${year}`, { $inc: { value: 1 } }, { upsert: true, new: true, session });
            if (counter.value > 9999999) throw new Error('Invoice sequence exhausted.');

            [invoice] = await Invoice.create([{
                business: est.business, customerGstin: est.customerGstin, placeOfSupply: est.placeOfSupply, placeOfSupplyName: est.placeOfSupplyName,
                taxableAmount: est.taxableAmount, cgstAmount: est.cgstAmount, sgstAmount: est.sgstAmount, igstAmount: est.igstAmount,
                requestId: `convert-${est._id}-${counter.value}`,
                invoiceNumber: `${prefix}${year}-${String(counter.value).padStart(7, '0')}`,
                payments: [],
                customerName: est.customerName, customerPhone: est.customerPhone, customerAltPhone: est.customerAltPhone || '', customerAddress: est.customerAddress, customerPincode: est.customerPincode || '',
                items: est.items, subtotal: est.subtotal, gstAmount: est.gstAmount, discountAmount: est.discountAmount, grandTotal: est.grandTotal,
                paidAmount: 0, dueAmount: est.grandTotal, paymentMethod: 'Cash', note: est.note || '', status: est.grandTotal === 0 ? 'Paid' : 'Due', createdBy: req.admin.id,
            }], { session });

            for (const p of products.filter((p) => p.trackStock && !business.demo)) {
                const quantity = quantities.get(String(p._id));
                const result = await Product.updateOne({ _id: p._id, stockQuantity: { $gte: quantity } }, { $inc: { stockQuantity: -quantity } }, { session });
                if (result.modifiedCount !== 1) throw new Error(`Stock changed for ${p.name}. Please try again.`);
            }

            estimate.status = 'Converted';
            estimate.convertedInvoiceNumber = invoice.invoiceNumber;
            await estimate.save({ session });
        });
        res.status(201).json(invoice);
    } catch (err) { res.status(400).json({ error: err.message }); }
    finally { await session.endSession(); }
});

// Cancel an open estimate (kept for the record; cannot be converted afterwards).
router.post('/:id/cancel', async (req, res) => {
    try {
        const estimate = await Estimate.findById(req.params.id);
        if (!estimate) return res.status(404).json({ error: 'Estimate not found.' });
        if (estimate.status === 'Converted') throw new Error('A converted estimate cannot be cancelled.');
        estimate.status = 'Cancelled';
        await estimate.save();
        res.json(estimate);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
