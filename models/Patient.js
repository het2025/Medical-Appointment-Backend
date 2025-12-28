const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String },
    age: { type: Number },
    weight: { type: String },
    address: { type: String },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
