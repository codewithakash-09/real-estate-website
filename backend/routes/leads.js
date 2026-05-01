const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const authMiddleware = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// POST create lead (public)
router.post('/', async (req, res) => {
    try {
        const { name, phone, message } = req.body;
        
        const lead = new Lead({
            name,
            phone,
            message
        });
        
        await lead.save();
        
        // Send email notification (optional)
        if (process.env.EMAIL_USER) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: 'bittukhari@gmail.com',
                    subject: 'New Lead from Website',
                    html: `
                        <h3>New Lead Details:</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>Message:</strong> ${message}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    `
                });
            } catch (emailError) {
                console.log('Email notification failed:', emailError);
            }
        }
        
        res.status(201).json({ message: 'Lead submitted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET all leads (protected)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update lead status (protected)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status, notes } = req.body;
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            { status, notes },
            { new: true }
        );
        res.json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
