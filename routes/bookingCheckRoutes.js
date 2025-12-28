const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Check booking status (public)
router.post('/check', async (req, res) => {
    const { bookingId, email } = req.body;

    try {
        const appointment = await Appointment.findOne({
            bookingId: bookingId.toUpperCase(),
            $or: [
                { 'guestDetails.email': email },
                { 'patient.email': email }
            ]
        }).populate('patient');

        if (!appointment) {
            return res.status(404).json({ message: 'Booking not found. Please check your Booking ID and email.' });
        }

        // Return appointment details
        res.json({
            bookingId: appointment.bookingId,
            status: appointment.status,
            date: appointment.date,
            slotStart: appointment.slotStart,
            slotEnd: appointment.slotEnd,
            service: appointment.service,
            name: appointment.guestDetails?.name || appointment.patient?.name,
            notes: appointment.notes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
