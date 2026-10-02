const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const permit = require('../middleware/permit');
const { notifyWhatsApp } = require('../utils/notify');

// Get all orders (needs 'orders' permission)
router.get('/', auth, permit('orders'), async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new order (public — submitted by customers at checkout)
router.post('/', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);

        // Best-effort WhatsApp alert to the shop (never blocks or fails the order).
        const o = savedOrder;
        const phones = [o.customerPhone, o.customerAltPhone].filter(Boolean).join(' / ');
        notifyWhatsApp(
            `🎆 New Order — Angel Fireworks\n` +
            `Name: ${o.customerName}\n` +
            `Phone: ${phones}\n` +
            `Place: ${[o.customerState, o.customerPincode].filter(Boolean).join(' - ')}\n` +
            `Items: ${(o.items || []).length}\n` +
            `Total: Rs.${o.totalAmount}\n` +
            `View: admin.angelpattasukadai.in`
        );
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update order status (needs 'orders' permission)
router.put('/:id/status', auth, permit('orders'), async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
