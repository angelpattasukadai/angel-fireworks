const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const permit = require('../middleware/permit');
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Counter = require('../models/Counter');

router.use(auth, permit('billing'));

const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

router.get('/', async (req, res) => {
    try {
        const page = Math.max(0, Math.floor(Number(req.query.page) || 0));
        const invoices = await Invoice.find({}).sort({ createdAt: -1, _id: -1 }).skip(page * 100).limit(100);
        res.json(invoices);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/summary/today', async (req, res) => {
    try {
        const day = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
        const start = new Date(`${day}T00:00:00+05:30`);
        const real = { 'business.demo': { $ne: true } };
        const [result, count, due] = await Promise.all([
            Invoice.aggregate([{ $match: { ...real, createdAt: { $gte: start } } }, { $group: { _id: null, total: { $sum: '$grandTotal' }, paid: { $sum: '$paidAmount' } } }]),
            Invoice.countDocuments({ ...real, createdAt: { $gte: start } }),
            Invoice.aggregate([{ $match: real }, { $group: { _id: null, total: { $sum: '$dueAmount' } } }]),
        ]);
        res.json({ sales: result[0]?.total || 0, collected: result[0]?.paid || 0, invoiceCount: count, totalDue: due[0]?.total || 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        let invoice;
        await session.withTransaction(async () => {
        const { items, customerName, customerPhone, customerAddress, discountAmount = 0, paidAmount, paymentMethod = 'Cash' } = req.body;
        if (typeof req.body.requestId !== 'string' || !/^[\w-]{16,80}$/.test(req.body.requestId)) throw new Error('A valid request ID is required. Refresh the billing page.');
        const existing = await Invoice.findOne({ requestId: req.body.requestId }).session(session);
        if (existing) { invoice = existing; return; }
        const business = await Business.findById('shop').session(session).lean();
        if (!business?.gstin) throw new Error('Complete Shop GST Settings before billing.');
        if (!/^\d{2}$/.test(req.body.placeOfSupply || '') || !req.body.placeOfSupplyName?.trim()) throw new Error('Select the place of supply state and code.');
        const customerGstin = String(req.body.customerGstin || '').trim().toUpperCase();
        if (customerGstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(customerGstin)) throw new Error('Invalid customer GSTIN.');
        if (!customerName?.trim() || !customerAddress?.trim()) throw new Error('Customer name and address are required for this invoice.');
        if (!Array.isArray(items) || !items.length || items.length > 200) throw new Error('Add between 1 and 200 items.');
        const quantities = new Map();
        for (const item of items) {
            const quantity = Number(item.quantity);
            if (!mongoose.isValidObjectId(item.productId) || !Number.isSafeInteger(quantity) || quantity <= 0) throw new Error('Every item needs a valid product and whole quantity.');
            quantities.set(item.productId, (quantities.get(item.productId) || 0) + quantity);
        }
        const products = await Product.find({ _id: { $in: [...quantities.keys()] } }).session(session);
        if (products.length !== quantities.size) throw new Error('One or more selected products no longer exist.');

        const productMap = new Map(products.map((p) => [String(p._id), p]));
        for (const [id, quantity] of quantities) {
            const product = productMap.get(String(id));
            if (!product.inStock) throw new Error(`${product.name} is marked out of stock.`);
            if (product.trackStock && product.stockQuantity < quantity) throw new Error(`Only ${product.stockQuantity} ${product.unit} of ${product.name} available.`);
        }

        const rawItems = items.map((item) => {
            const product = productMap.get(String(item.productId));
            const quantity = Number(item.quantity);
            const rate = Number(product.discountedPrice || product.price);
            const gstRate = Number(product.gstRate || 0);
            if (!/^\d{4}(\d{2})?(\d{2})?$/.test(product.hsn || '')) throw new Error(`Set a valid HSN for ${product.name} in Catalog.`);
            return { product: product._id, name: product.name, sku: product.sku, hsn: product.hsn, unit: product.unit, quantity, rate, gstRate, priceIncludesTax: !!product.priceIncludesTax };
        });
        const { calculate } = await import('../../shared/gst.mjs');
        const calculation = calculate(rawItems, Number(discountAmount), req.body.placeOfSupply !== business.stateCode);
        const { items: savedItems, subtotal, gstAmount, grandTotal, discountAmount: safeDiscount } = calculation;
        const safePaid = money(Math.min(grandTotal, Math.max(0, Number(paidAmount ?? grandTotal) || 0)));
        if (paidAmount !== undefined && (!Number.isFinite(Number(paidAmount)) || Number(paidAmount) < 0 || Number(paidAmount) > grandTotal)) throw new Error('Paid amount must be between zero and bill total.');
        const dueAmount = money(grandTotal - safePaid);
        const status = dueAmount === 0 ? 'Paid' : safePaid > 0 ? 'Partial' : 'Due';
        const date = new Date(Date.now() + 330 * 60000);
        const year = date.getUTCFullYear() - (date.getUTCMonth() < 3 ? 1 : 0);
        const prefix = business.demo ? 'DM' : 'AF';
        const counter = await Counter.findByIdAndUpdate(`${prefix}-${year}`, { $inc: { value: 1 } }, { upsert: true, new: true, session });
        if (counter.value > 9999999) throw new Error('Invoice sequence exhausted.');
        [invoice] = await Invoice.create([{
            business, customerGstin, placeOfSupply: req.body.placeOfSupply, placeOfSupplyName: req.body.placeOfSupplyName,
            taxableAmount: calculation.taxableAmount, cgstAmount: calculation.cgstAmount, sgstAmount: calculation.sgstAmount, igstAmount: calculation.igstAmount,
            requestId: req.body.requestId,
            invoiceNumber: `${prefix}${year}-${String(counter.value).padStart(7, '0')}`,
            payments: safePaid > 0 ? [{ requestId: req.body.requestId, amount: safePaid, method: paymentMethod }] : [],
            customerName: customerName?.trim() || 'Walk-in Customer', customerPhone: customerPhone?.trim() || '', customerAddress: customerAddress?.trim() || '',
            items: savedItems, subtotal, gstAmount, discountAmount: safeDiscount, grandTotal, paidAmount: safePaid, dueAmount, paymentMethod, status, createdBy: req.admin.id,
        }], { session });
        for (const p of products.filter((p) => p.trackStock && !business.demo)) {
            const quantity = quantities.get(String(p._id));
            const result = await Product.updateOne({ _id: p._id, stockQuantity: { $gte: quantity } }, { $inc: { stockQuantity: -quantity } }, { session });
            if (result.modifiedCount !== 1) throw new Error(`Stock changed for ${p.name}. Please try again.`);
        }
        });
        res.status(201).json(invoice);
    } catch (err) { res.status(400).json({ error: err.message }); }
    finally { await session.endSession(); }
});

router.post('/:id/payments', async (req, res) => {
    try {
        const { requestId, method } = req.body;
        const amount = money(req.body.amount);
        if (!Number.isFinite(amount) || amount <= 0 || typeof requestId !== 'string' || !/^[\w-]{16,80}$/.test(requestId) || !['Cash', 'UPI', 'Card', 'Mixed'].includes(method)) throw new Error('Enter a valid payment amount and method.');
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
        if (invoice.payments.some((p) => p.requestId === requestId)) return res.json(invoice);
        if (amount > invoice.dueAmount) throw new Error('Payment exceeds the remaining balance.');
        const paidAmount = money(invoice.paidAmount + amount);
        const dueAmount = money(invoice.grandTotal - paidAmount);
        const updated = await Invoice.findOneAndUpdate({ _id: invoice._id, paidAmount: invoice.paidAmount, 'payments.requestId': { $ne: requestId } }, {
            $set: { paidAmount, dueAmount, status: dueAmount === 0 ? 'Paid' : 'Partial' },
            $push: { payments: { requestId, amount, method, date: new Date() } },
        }, { new: true, runValidators: true });
        if (!updated) return res.status(409).json({ error: 'Another payment was recorded. Refresh and check the balance.' });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
