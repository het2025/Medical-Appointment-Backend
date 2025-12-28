const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    guestDetails: {
        name: String,
        email: String,
        phone: String
    },
    date: { type: Date, required: true },
    slotStart: { type: Date, required: true },
    slotEnd: { type: Date, required: true },
    service: { type: String, required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Visited', 'Cancelled', 'Missed'],
        default: 'Pending'
    },
    bookingId: { type: String, unique: true },
    notes: { type: String },
    price: { type: Number },
    tax: { type: Number },
    totalAmount: { type: Number },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded'],
        default: 'Pending'
    },
    transactionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
