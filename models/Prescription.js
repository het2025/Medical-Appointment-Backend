const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }, // made optional for manual add
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, default: Date.now },

    // Vitals / Body Details
    age: { type: Number },
    weight: { type: String },
    bp: { type: String }, // Blood Pressure
    otherDetails: { type: String },

    // Medical
    diagnosis: { type: String }, // Optional but good to have
    prescription: { type: String, required: true }, // The main prescription text/list

    actionsTaken: { type: String } // "other require details section" ?
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
