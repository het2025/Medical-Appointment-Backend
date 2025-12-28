const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/authMiddleware');
const patientAuth = require('../middleware/patientAuthMiddleware');
const { v4: uuidv4 } = require('uuid');

// Get all appointments (with filters)
router.get('/', async (req, res) => {
    const { date, status } = req.query;
    let query = {};
    if (date) {
        // Match entire day
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
    }
    if (status) query.status = status;

    try {
        const appointments = await Appointment.find(query).populate('patient');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Check Availability (Simple List of Booked Slots)
router.get('/availability', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date required' });

    try {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            date: { $gte: start, $lte: end },
            status: { $nin: ['Cancelled', 'Missed'] }
        }, 'slotStart slotEnd serviceId');

        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Appointment (Public) with Pricing & Mock Payment
router.post('/', async (req, res) => {
    console.log('Booking Request Body:', req.body); // Debug Log
    const { date, slotStart, slotEnd, service, guestDetails, patientId, serviceId } = req.body;

    try {
        // Fetch Service details for pricing
        const Service = require('../models/Service');
        let serviceDetails;
        if (serviceId) {
            serviceDetails = await Service.findById(serviceId);
        } else if (service) {
            serviceDetails = await Service.findOne({ name: service });
        }

        let price = 0, tax = 0, totalAmount = 0;
        if (serviceDetails) {
            price = serviceDetails.price;
            tax = (price * serviceDetails.taxRate) / 100;
            totalAmount = price + tax;
        }

        // Check availability
        const conflict = await Appointment.findOne({
            serviceId: serviceId, // Check specific service availability
            $or: [
                { slotStart: { $lt: slotEnd, $gte: slotStart } },
                { slotEnd: { $gt: slotStart, $lte: slotEnd } }
            ],
            status: { $nin: ['Cancelled', 'Missed'] }
        });

        if (conflict) return res.status(409).json({ message: 'Slot taken' });

        const bookingId = uuidv4().slice(0, 8).toUpperCase();
        const transactionId = 'TXN_MOCK_' + Math.floor(Math.random() * 1000000); // Mock Payment

        const newAppointment = new Appointment({
            date,
            slotStart,
            slotEnd,
            service: serviceDetails ? serviceDetails.name : service,
            serviceId: serviceDetails ? serviceDetails._id : null,
            guestDetails,
            patient: patientId || null,
            bookingId,
            price,
            tax,
            totalAmount,
            paymentStatus: 'Paid', // Auto-pay specific for this request
            transactionId
        });

        await newAppointment.save();

        const io = req.app.get('io');
        io.emit('new_appointment', newAppointment);

        res.status(201).json(newAppointment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel Appointment (User/Admin)
router.put('/:id/cancel', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.status = 'Cancelled';
        appointment.paymentStatus = 'Refunded'; // Mock Refund
        await appointment.save();

        const io = req.app.get('io');
        io.emit('appointment_updated', appointment);

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Status (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
    const { status } = req.body;
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        const io = req.app.get('io');
        io.emit('appointment_updated', appointment);

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Dashboard Stats
router.get('/dashboard/stats', async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const pending = await Appointment.countDocuments({ status: 'Pending' });
        const todayAppts = await Appointment.countDocuments({
            slotStart: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'Cancelled' }
        });
        const total = await Appointment.countDocuments();

        // New Stats
        const cancelled = await Appointment.countDocuments({ status: 'Cancelled' });
        const todayCompleted = await Appointment.countDocuments({
            slotStart: { $gte: startOfDay, $lte: endOfDay },
            status: 'Visited'
        });

        const patients = await Patient.countDocuments();

        res.json({
            pending,
            today: todayAppts,
            total,
            patients,
            cancelled,
            todayCompleted
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Recent Appointments (Admin Dashboard)
router.get('/dashboard/recent', async (req, res) => {
    try {
        // Fetch last 5 appointments, sorted by most recent slot
        const recent = await Appointment.find()
            .sort({ slotStart: -1 })
            .limit(5);
        res.json(recent);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching recent' });
    }
});

// Get My Appointments (Patient)
router.get('/my-history', patientAuth, async (req, res) => {
    try {
        // Find appointments where 'patient' field matches the ID (if we used that)
        // OR strict logic: check guestDetails.email matches patient.email? 
        // Current logic: Appointment model has `patient: ObjectId` if booked via portal?
        // Let's check Appointment Model. If not present, we rely on logic. 
        // Ah, in "create appointment", we didn't explicitly save `patient: req.patientId`. 
        // We should update POST / to save patient ID if logged in.
        // But for now, let's assume we will search by something or update POST / first.

        // Wait, the user wants "as per the user login show their booking".
        // I need to ensure when a Patient books, their ID is saved.
        // Let's check POST / endpoint.

        const appointments = await Appointment.find({ patient: req.patientId }).sort({ slotStart: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Check Booking (Guest)
router.post('/booking/check', async (req, res) => {
    const { bookingId, email } = req.body;
    try {
        const appointment = await Appointment.findOne({
            bookingId: bookingId.toUpperCase(),
            'guestDetails.email': email
        });

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
