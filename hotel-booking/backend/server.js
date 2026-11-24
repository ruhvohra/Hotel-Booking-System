const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhook');

const app = express();

// Raw body for Clerk webhooks
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

app.use(cors({
  origin: process.env.CLIENT_URL || 'https://hotel-booking-system-a327.vercel.app/',
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_booking')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Hotel Booking API Running' }));

app.get('/', (req,res)=>{
  res.send({
    activeStatus: true,
    error: false,
  })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
