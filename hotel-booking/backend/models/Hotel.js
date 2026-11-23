const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  type: { type: String, required: true }, // Standard, Deluxe, Suite, etc.
  price: { type: Number, required: true },
  capacity: { type: Number, default: 2 },
  amenities: [String],
  images: [String],
  available: { type: Boolean, default: true },
  totalRooms: { type: Number, default: 10 }
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    address: String,
    city: { type: String, required: true },
    state: String,
    country: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  category: { type: String, enum: ['Budget', 'Standard', 'Luxury', 'Resort', 'Boutique'], default: 'Standard' },
  stars: { type: Number, min: 1, max: 5, default: 3 },
  images: [String],
  thumbnail: String,
  amenities: [String],
  rooms: [roomSchema],
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  pricePerNight: { type: Number, required: true }, // starting price
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '11:00' },
  policies: {
    cancellation: { type: String, default: 'Free cancellation up to 24 hours before check-in' },
    pets: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false }
  },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Update rating when reviews are added
hotelSchema.methods.updateRating = function() {
  if (this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = (total / this.reviews.length).toFixed(1);
    this.reviewCount = this.reviews.length;
  }
};

module.exports = mongoose.model('Hotel', hotelSchema);
