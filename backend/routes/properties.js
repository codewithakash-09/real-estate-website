const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// GET all properties (public)
router.get('/', async (req, res) => {
    try {
        const { location, type, minPrice, maxPrice, status } = req.query;
        let filter = {};
        
        if (location) filter.location = location;
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseInt(minPrice);
            if (maxPrice) filter.price.$lte = parseInt(maxPrice);
        }
        
        const properties = await Property.find(filter).sort({ createdAt: -1 });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single property
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create property (protected)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const propertyData = req.body;
        if (req.file) {
            propertyData.image = '/uploads/' + req.file.filename;
        }
        
        const property = new Property(propertyData);
        await property.save();
        res.status(201).json(property);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update property (protected)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const propertyData = req.body;
        if (req.file) {
            propertyData.image = '/uploads/' + req.file.filename;
        }
        
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            propertyData,
            { new: true }
        );
        res.json(property);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE property (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);
        res.json({ message: 'Property deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
