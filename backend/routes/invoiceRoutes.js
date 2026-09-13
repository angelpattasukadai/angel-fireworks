const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const permit = require('../middleware/permit');

router.use(auth, permit('billing'));

const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find({}).sort({ createdAt: -1 }).limit(100);
        res.json(invoices);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/summary/today', async (req, res) => {
    try {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        const [result, count, due] = await Promise.all([
            Invoice.aggregate([{ $match: { createdAt: { $gte: start } } }, { $group: { _id: null, total: { $sum: '$grandTotal' }, paid: { $sum: '$paidAmount' } } }]),
            Invoice.countDocuments({ createdAt: { $gte: start } }),
            Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$dueAmount' } } }]),
        ]);
        res.json({ sales: result[0]?.total || 0, collected: result[0]?.paid || 0, invoiceCount: count, totalDue: due[0]?.total || 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
    try {
        const { items, customerName, customerPhone, customerAddress, discountAmount = 0, paidAmount, paymentMethod = 'Cash' } = req.body;
        if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Add at least one item.' });
        const quantities = new Map();
        for (const item of items) {
            const quantity = Number(item.quantity);
            if (!item.productId || !Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ error: 'Every item needs a valid quantity.' });
            quantities.set(item.productId, (quantities.get(item.productId) || 0) + quantity);
        }
        const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
        if (products.length !== quantities.size) return res.status(400).json({ error: 'One or more selected products no longer exist.' });

        const productMap = new Map(products.map((p) => [String(p._id), p]));
        for (const [id, quantity] of quantities) {
            const product = productMap.get(String(id));
            if (!product.inStock) return res.status(400).json({ error: `${product.name} is marked out of stock.` });
            if (product.trackStock && product.stockQuantity < quantity) return res.status(400).json({ error: `Only ${product.stockQuantity} ${product.unit} of ${product.name} available.` });
        }

        const savedItems = items.map((item) => {
            const product = productMap.get(String(item.productId));
            const quantity = Number(item.quantity);
            const rate = Number(product.discountedPrice || product.price);
            const taxableAmount = money(quantity * rate);
            const gstRate = Number(product.gstRate || 0);
            const gstAmount = money(taxableAmount * gstRate / 100);
            return { product: product._id, name: product.name, sku: product.sku, unit: product.unit, quantity, rate, gstRate, taxableAmount, gstAmount, total: money(taxableAmount + gstAmount) };
        });
        const subtotal = money(savedItems.reduce((sum, item) => sum + item.taxableAmount, 0));
        const gstAmount = money(savedItems.reduce((sum, item) => sum + item.gstAmount, 0));
        const safeDiscount = money(Math.max(0, Number(discountAmount) || 0));
        const grandTotal = money(Math.max(0, subtotal + gstAmount - safeDiscount));
        const safePaid = money(Math.min(grandTotal, Math.max(0, Number(paidAmount ?? grandTotal) || 0)));
        const dueAmount = money(grandTotal - safePaid);
        const status = dueAmount === 0 ? 'Paid' : safePaid > 0 ? 'Partial' : 'Due';
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const sequence = await Invoice.countDocuments({ invoiceNumber: new RegExp(`^AF-${today}-`) });
        const invoice = await Invoice.create({
            invoiceNumber: `AF-${today}-${String(sequence + 1).padStart(3, '0')}`,
            customerName: customerName?.trim() || 'Walk-in Customer', customerPhone: customerPhone?.trim() || '', customerAddress: customerAddress?.trim() || '',
            items: savedItems, subtotal, gstAmount, discountAmount: safeDiscount, grandTotal, paidAmount: safePaid, dueAmount, paymentMethod, status, createdBy: req.admin.id,
        });
        await Promise.all(products.filter((p) => p.trackStock).map((p) => Product.updateOne({ _id: p._id }, { $inc: { stockQuantity: -quantities.get(String(p._id)) } })));
        res.status(201).json(invoice);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
