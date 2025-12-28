const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

// Signup
router.post('/signup', async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) return res.status(400).json({ message: 'Patient already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newPatient = new Patient({
            name,
            email,
            password: hashedPassword,
            phone
        });

        await newPatient.save();

        const token = jwt.sign({ id: newPatient._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, patient: { id: newPatient._id, name: newPatient.name, email: newPatient.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const patient = await Patient.findOne({ email });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: patient._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, patient: { id: patient._id, name: patient.name, email: patient.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Current Patient
router.get('/me', async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const patient = await Patient.findById(decoded.id).select('-password');
        res.json(patient);
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
