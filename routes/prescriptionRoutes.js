const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');

// Create Prescription
router.post('/', async (req, res) => {
    try {
        const { appointmentId, patientId, age, weight, bp, otherDetails, prescription } = req.body;

        const newPrescription = new Prescription({
            appointmentId,
            patientId,
            age,
            weight,
            bp,
            otherDetails,
            prescription
        });

        await newPrescription.save();
        res.status(201).json(newPrescription);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Prescriptions by Patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const history = await Prescription.find({ patientId: req.params.patientId })
            .populate('appointmentId')
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All (for Admin Prescriptions Page?) - Optional, maybe useful
router.get('/', async (req, res) => {
    try {
        const prescriptions = await Prescription.find().populate('patientId').populate('appointmentId').sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
