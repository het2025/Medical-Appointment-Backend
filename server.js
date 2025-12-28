const express = require('express');
// Server Restart Trigger
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const startMissedAppointmentJob = require('./jobs/missedAppointmentJob');

console.log('Starting server...');

try {
  dotenv.config();
  console.log('Dotenv loaded');
} catch (e) {
  console.error('Dotenv error:', e);
}

const app = express();
const httpServer = createServer(app);

// CORS configuration for both development and production
const allowedOrigins = [
  "http://localhost:5173",
  "https://medical-appointment-frontend-mu.vercel.app",
  process.env.FRONTEND_URL // Allow configurable frontend URL
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patient-auth', require('./routes/patientAuthRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/booking', require('./routes/bookingCheckRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));

// Start Cron Job
startMissedAppointmentJob(io);

// Basic Route
app.get('/', (req, res) => {
  res.send('Dental App API is running');
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
