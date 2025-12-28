const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

const startMissedAppointmentJob = (io) => {
    // Run every minute
    cron.schedule('*/1 * * * *', async () => {
        console.log('Running missed appointment check...');
        const now = new Date();

        try {
            const missedAppointments = await Appointment.find({
                slotEnd: { $lt: now },
                status: { $in: ['Pending', 'Approved'] }
            });

            for (const appt of missedAppointments) {
                appt.status = 'Missed';
                await appt.save();

                // Create notification
                const notification = new Notification({
                    type: 'missed_appointment',
                    payload: { appointmentId: appt._id, bookingId: appt.bookingId, date: appt.date }
                });
                await notification.save();

                // Emit event
                io.emit('notification', notification);
                io.emit('appointment_updated', appt);

                console.log(`Marked appointment ${appt.bookingId} as Missed`);
            }
        } catch (err) {
            console.error('Error in cron job:', err);
        }
    });
};

module.exports = startMissedAppointmentJob;
