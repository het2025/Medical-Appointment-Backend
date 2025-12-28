const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const authMiddleware = require('../middleware/authMiddleware');

// Get all services with filters (Search/Discovery)
router.get('/', async (req, res) => {
    const { category, location, search } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (location) query.location = location;
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    try {
        const services = await Service.find(query);
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single service
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Service (Admin only - for now using same middleware or no middleware if public for demo)
// Assuming we want this protected.
router.post('/', authMiddleware, async (req, res) => {
    const { name, category, description, price, duration, location, taxRate } = req.body;
    try {
        const newService = new Service({
            name, category, description, price, duration, location, taxRate
        });
        await newService.save();
        res.status(201).json(newService);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Service
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedService);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Service
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Service deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
