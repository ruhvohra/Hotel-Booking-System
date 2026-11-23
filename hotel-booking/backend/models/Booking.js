const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  room: {
    roomId: mongoose.Schema.Types.ObjectId,
    type: { type: String },
    pricePerNight: Number
  },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  nights: { type: Number, required: true },
  guests: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 }
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentIntentId: String,
  specialRequests: String,
  guestInfo: {
    name: String,
    email: String,
    phone: String
  },
  confirmationNumber: { type: String, unique: true }
}, { timestamps: true });

// Generate confirmation number before save
bookingSchema.pre('save', function(next) {
  if (!this.confirmationNumber) {
    this.confirmationNumber = 'HB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
