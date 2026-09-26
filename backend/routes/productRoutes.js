const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const permit = require('../middleware/permit');

// Get all products (public — used by the customer catalog)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new product (needs 'products' permission)
router.post('/', auth, permit('products'), async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Bulk import products from a CSV/Excel upload (needs 'products' permission).
// Upsert model: a row that carries an `id` (from "Download Current Catalog") UPDATES that
// product; a row with no id is ADDED as new. All-or-nothing: if any row is invalid, nothing
// is written and every row error is returned so the user can fix the sheet and re-upload.
router.post('/bulk', auth, permit('products'), async (req, res) => {
    try {
        const rows = req.body?.products;
        if (!Array.isArray(rows) || !rows.length) return res.status(400).json({ error: 'No rows found in the file.' });
        if (rows.length > 500) return res.status(400).json({ error: 'Please upload at most 500 products at a time.' });

        const toBool = (v, fallback) => {
            if (v === undefined || v === null || String(v).trim() === '') return fallback;
            return ['true', '1', 'yes', 'y', 'in stock', 'instock', 'available'].includes(String(v).trim().toLowerCase());
        };
        const toNum = (v) => (v === undefined || v === null || String(v).trim() === '' ? undefined : Number(v));

        const errors = [];
        const ops = rows.map((raw, i) => {
            const line = i + 2; // +2: header row + 1-based
            const id = String(raw.id ?? '').trim();
            const name = String(raw.name ?? '').trim();
            const category = String(raw.category ?? '').trim();
            const price = toNum(raw.price);
            const discountedPrice = toNum(raw.discountedPrice);
            const gstRate = toNum(raw.gstRate);
            const stockQuantity = toNum(raw.stockQuantity);
            const hsn = String(raw.hsn ?? '').trim();
            const image = String(raw.image ?? '').trim();

            if (id && !mongoose.isValidObjectId(id)) errors.push(`Row ${line}: id is not a valid product id. Leave it blank to add a new product.`);
            if (!name) errors.push(`Row ${line}: name is required.`);
            if (!category) errors.push(`Row ${line}: category is required.`);
            if (price === undefined || !Number.isFinite(price) || price < 0) errors.push(`Row ${line}: price must be a number ≥ 0.`);
            if (discountedPrice !== undefined && (!Number.isFinite(discountedPrice) || discountedPrice < 0)) errors.push(`Row ${line}: discounted price must be a number ≥ 0.`);
            if (discountedPrice !== undefined && price !== undefined && discountedPrice >= price) errors.push(`Row ${line}: discounted price must be less than price.`);
            if (gstRate !== undefined && (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100)) errors.push(`Row ${line}: GST rate must be between 0 and 100.`);
            if (stockQuantity !== undefined && (!Number.isFinite(stockQuantity) || stockQuantity < 0)) errors.push(`Row ${line}: stock quantity must be a number ≥ 0.`);
            if (hsn && !/^\d{4}(\d{2})?(\d{2})?$/.test(hsn)) errors.push(`Row ${line}: HSN must be 4, 6 or 8 digits.`);

            const doc = {
                name, category, price,
                description: String(raw.description ?? '').trim(),
                sku: String(raw.sku ?? '').trim(),
                hsn,
                unit: String(raw.unit ?? '').trim() || 'pcs',
                gstRate: gstRate ?? 0,
                stockQuantity: stockQuantity ?? 0,
                trackStock: toBool(raw.trackStock, false),
                priceIncludesTax: toBool(raw.priceIncludesTax, false),
                inStock: toBool(raw.inStock, true),
            };

            if (id) {
                // UPDATE an existing product. Blank image keeps the current one; blank offer clears it.
                const $set = { ...doc };
                if (discountedPrice !== undefined) $set.discountedPrice = discountedPrice;
                if (image) $set.image = image;
                const $unset = {};
                if (discountedPrice === undefined) $unset.discountedPrice = '';
                if (!image) { /* leave existing image untouched */ }
                const update = Object.keys($unset).length ? { $set, $unset } : { $set };
                return { updateOne: { filter: { _id: id }, update, upsert: true } };
            }
            // ADD a new product.
            if (discountedPrice !== undefined) doc.discountedPrice = discountedPrice;
            if (image) doc.image = image; // else the model default image applies
            return { insertOne: { document: doc } };
        });

        if (errors.length) return res.status(400).json({ error: `${errors.length} problem(s) found. Nothing was imported.`, errors: errors.slice(0, 50) });

        const result = await Product.bulkWrite(ops, { ordered: false });
        const created = (result.insertedCount || 0) + (result.upsertedCount || 0);
        const updated = result.modifiedCount || 0;
        res.status(201).json({ created, updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update product (needs 'products' permission)
router.put('/:id', auth, permit('products'), async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete product (needs 'products' permission)
router.delete('/:id', auth, permit('products'), async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
