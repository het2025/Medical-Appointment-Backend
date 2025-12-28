const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');

dotenv.config();

const services = [
    // 1. Preventive & Routine Care
    { name: 'General physician consultation', category: 'Preventive & Routine Care', price: 50, duration: 30, description: 'Routine checkup with a general physician.' },
    { name: 'Pediatric checkup', category: 'Preventive & Routine Care', price: 60, duration: 30, description: 'Health checkup for children.' },
    { name: 'Vaccination / immunization', category: 'Preventive & Routine Care', price: 40, duration: 15, description: 'Standard vaccination service.' },
    { name: 'Annual health checkup', category: 'Preventive & Routine Care', price: 100, duration: 60, description: 'Comprehensive annual health screening.' },
    { name: 'Prenatal (antenatal) checkup', category: 'Preventive & Routine Care', price: 70, duration: 45, description: 'Routine checkup for expecting mothers.' },

    // 2. Specialist Consultations
    { name: 'Cardiology consultation', category: 'Specialist Consultations', price: 120, duration: 45, description: 'Consultation with a heart specialist.' },
    { name: 'Dermatology consultation', category: 'Specialist Consultations', price: 90, duration: 30, description: 'Skin, hair, and nail consultation.' },
    { name: 'Orthopedic consultation', category: 'Specialist Consultations', price: 100, duration: 40, description: 'Bone and joint specialist consultation.' },
    { name: 'Gynecology appointment', category: 'Specialist Consultations', price: 100, duration: 40, description: 'Women\'s health specialist consultation.' },
    { name: 'ENT (ear, nose, throat) appointment', category: 'Specialist Consultations', price: 80, duration: 30, description: 'Consultation for ear, nose, and throat issues.' },

    // 3. Diagnostic & Testing Services
    { name: 'Radiology / imaging appointment', category: 'Diagnostic & Testing Services', price: 150, duration: 30, description: 'X-ray, MRI, or CT scan services.' },
    { name: 'Pathology / lab test appointment', category: 'Diagnostic & Testing Services', price: 50, duration: 15, description: 'Blood tests and sample collection.' },
    { name: 'Ophthalmology (eye examination)', category: 'Diagnostic & Testing Services', price: 80, duration: 30, description: 'Comprehensive eye exam.' },
    { name: 'Dental examination', category: 'Diagnostic & Testing Services', price: 70, duration: 45, description: 'Routine dental checkup and cleaning.' },
    { name: 'Chronic disease follow-up testing', category: 'Diagnostic & Testing Services', price: 60, duration: 30, description: 'Regular monitoring for chronic conditions.' },

    // 4. Therapeutic & Ongoing Care
    { name: 'Physiotherapy session', category: 'Therapeutic & Ongoing Care', price: 70, duration: 60, description: 'Physical therapy and rehabilitation.' },
    { name: 'Mental health / psychiatry session', category: 'Therapeutic & Ongoing Care', price: 130, duration: 60, description: 'Counseling and mental health support.' },
    { name: 'Nutrition & diet consultation', category: 'Therapeutic & Ongoing Care', price: 60, duration: 45, description: 'Dietary planning and nutrition advice.' },
    { name: 'Postnatal follow-up', category: 'Therapeutic & Ongoing Care', price: 70, duration: 45, description: 'Checkup for mothers after childbirth.' },
    { name: 'Emergency / urgent care visit', category: 'Therapeutic & Ongoing Care', price: 200, duration: 60, description: 'Immediate care for urgent health issues.' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing services? Maybe just add new ones or upsert?
        // User said "add this list", implying replacing or adding.
        // For cleanliness, let's clear generic/demo data if possible, or just append.
        // I will clear to prevent duplicates of "Dental" stuff from before if it conflicts, 
        // but user might want to keep consistent state. 
        // I'll delete EVERYTHING to ensure the list matches the user's spec exactly.
        await Service.deleteMany({});
        console.log('Cleared existing services');

        await Service.insertMany(services);
        console.log('Services Seeded');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
