const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { flexAuth, adminOnly } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', flexAuth, adminOnly, async (req, res) => {
  try {
    const [totalHotels, totalBookings, totalUsers, revenueData] = await Promise.all([
      Hotel.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      User.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    // Monthly bookings for chart
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const statusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('hotel', 'name location')
      .sort({ createdAt: -1 })
      .limit(5);

    const topHotels = await Hotel.find({ isActive: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(5)
      .select('name location rating reviewCount pricePerNight category');

    res.json({ totalHotels, totalBookings, totalUsers, totalRevenue, monthlyBookings, statusBreakdown, recentBookings, topHotels });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all bookings (admin)
router.get('/bookings', flexAuth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email')
        .populate('hotel', 'name location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(query)
    ]);

    res.json({ bookings, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (admin)
router.get('/users', flexAuth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find().select('-password').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments()
    ]);
    res.json({ users, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Promote user to admin
router.put('/users/:id/role', flexAuth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed demo data
router.post('/seed', flexAuth, adminOnly, async (req, res) => {
  try {
    const hotelCount = await Hotel.countDocuments();
    if (hotelCount > 0) return res.json({ message: 'Data already seeded', count: hotelCount });

    const hotels = await Hotel.insertMany(getDemoHotels(req.user._id));
    res.json({ message: `Seeded ${hotels.length} hotels`, hotels });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function getDemoHotels(adminId) {
  return [
    {
      name: 'The Grand Meridian', description: 'A timeless classic in the heart of the city, offering unparalleled luxury and world-class service. Each room is a masterpiece of design and comfort.', location: { address: '1 Grand Avenue', city: 'New York', state: 'NY', country: 'USA', coordinates: { lat: 40.7128, lng: -74.0060 } }, category: 'Luxury', stars: 5, thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200'], amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge', 'Valet', 'Business Center'], rooms: [{ type: 'Deluxe King', price: 450, capacity: 2, amenities: ['King Bed', 'City View', 'Mini Bar', 'Bathtub'] }, { type: 'Presidential Suite', price: 1200, capacity: 4, amenities: ['2 Bedrooms', 'Living Room', 'Dining Area', 'Butler Service'] }], pricePerNight: 450, rating: 4.8, reviewCount: 342, isFeatured: true, addedBy: adminId
    },
    {
      name: 'Azul Beach Resort', description: 'Nestled along pristine white sands, Azul offers the perfect tropical escape with overwater bungalows and breathtaking ocean views.', location: { address: 'Beachfront Road', city: 'Cancun', state: '', country: 'Mexico', coordinates: { lat: 21.1619, lng: -86.8515 } }, category: 'Resort', stars: 5, thumbnail: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200'], amenities: ['Private Beach', 'Infinity Pool', 'Water Sports', 'Spa', 'All-Inclusive', 'Kids Club'], rooms: [{ type: 'Ocean View Room', price: 320, capacity: 2, amenities: ['Ocean View', 'Balcony', 'King Bed'] }, { type: 'Overwater Bungalow', price: 850, capacity: 2, amenities: ['Direct Ocean Access', 'Glass Floor', 'Private Plunge Pool'] }], pricePerNight: 320, rating: 4.9, reviewCount: 518, isFeatured: true, addedBy: adminId
    },
    {
      name: 'Urban Nest Boutique', description: 'A chic, design-forward boutique hotel where art meets hospitality. Each room tells a unique story through curated local art and bespoke furniture.', location: { address: '42 Arts District Blvd', city: 'Los Angeles', state: 'CA', country: 'USA', coordinates: { lat: 34.0522, lng: -118.2437 } }, category: 'Boutique', stars: 4, thumbnail: 'https://images.unsplash.com/photo-1521783988139-89397d761dce?w=800', images: ['https://images.unsplash.com/photo-1521783988139-89397d761dce?w=1200'], amenities: ['Rooftop Bar', 'Art Gallery', 'Bike Rental', 'Pet Friendly', 'Cafe'], rooms: [{ type: 'Artist Suite', price: 220, capacity: 2, amenities: ['Local Art', 'Loft Style', 'City View'] }, { type: 'Penthouse', price: 480, capacity: 3, amenities: ['Rooftop Access', 'Jacuzzi', 'Panoramic Views'] }], pricePerNight: 220, rating: 4.6, reviewCount: 189, isFeatured: true, addedBy: adminId
    },
    {
      name: 'Alpine Retreat Lodge', description: 'Breathe in the crisp mountain air at our cozy lodge. Perfect for ski lovers in winter and hikers in summer, with fireside comfort year-round.', location: { address: 'Mountain Pass Road', city: 'Aspen', state: 'CO', country: 'USA', coordinates: { lat: 39.1911, lng: -106.8175 } }, category: 'Resort', stars: 4, thumbnail: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200'], amenities: ['Ski-In/Ski-Out', 'Hot Tub', 'Fireplace', 'Ski Storage', 'Restaurant', 'Sauna'], rooms: [{ type: 'Cozy Cabin Room', price: 280, capacity: 2, amenities: ['Fireplace', 'Mountain View', 'Heated Floors'] }, { type: 'Family Chalet', price: 520, capacity: 6, amenities: ['2 Bedrooms', 'Kitchen', 'Terrace', 'Fireplace'] }], pricePerNight: 280, rating: 4.7, reviewCount: 267, isFeatured: false, addedBy: adminId
    },
    {
      name: 'Heritage Palace Hotel', description: 'Step into a world of royal heritage in this magnificently restored 19th-century palace. Opulent architecture meets modern luxury for an unforgettable experience.', location: { address: 'Palace Road', city: 'Jaipur', state: 'Rajasthan', country: 'India', coordinates: { lat: 26.9124, lng: 75.7873 } }, category: 'Luxury', stars: 5, thumbnail: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800', images: ['https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200'], amenities: ['Heritage Tours', 'Elephant Polo', 'Ayurvedic Spa', 'Rooftop Restaurant', 'Cultural Shows', 'Yoga'], rooms: [{ type: 'Royal Suite', price: 380, capacity: 2, amenities: ['Antique Furniture', 'Courtyard View', 'Clawfoot Tub'] }, { type: 'Maharaja Suite', price: 900, capacity: 4, amenities: ['Private Courtyard', 'Butler', 'Jacuzzi', 'Personal Chef'] }], pricePerNight: 380, rating: 4.9, reviewCount: 412, isFeatured: true, addedBy: adminId
    },
    {
      name: 'Zen Garden Hotel', description: 'Find tranquility in our Japanese-inspired sanctuary. Minimalist design, Zen gardens, and traditional onsen baths create the ultimate retreat for the discerning traveler.', location: { address: '15 Sakura Street', city: 'Kyoto', state: '', country: 'Japan', coordinates: { lat: 35.0116, lng: 135.7681 } }, category: 'Boutique', stars: 5, thumbnail: 'https://images.unsplash.com/photo-1545652985-5edd365b13d4?w=800', images: ['https://images.unsplash.com/photo-1545652985-5edd365b13d4?w=1200'], amenities: ['Onsen Bath', 'Tea Ceremony', 'Zen Garden', 'Meditation Room', 'Traditional Breakfast'], rooms: [{ type: 'Tatami Room', price: 290, capacity: 2, amenities: ['Futon Beds', 'Garden View', 'Private Onsen'] }, { type: 'Garden Suite', price: 580, capacity: 2, amenities: ['Private Garden', 'Outdoor Soaking Tub', 'Tea Room'] }], pricePerNight: 290, rating: 4.8, reviewCount: 334, isFeatured: true, addedBy: adminId
    },
    {
      name: 'Marina Bay Suites', description: 'Spectacular waterfront living with floor-to-ceiling views of the iconic harbor. Experience the perfect blend of business and leisure in a prime location.', location: { address: '10 Marina Blvd', city: 'Singapore', state: '', country: 'Singapore', coordinates: { lat: 1.2800, lng: 103.8585 } }, category: 'Luxury', stars: 5, thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200'], amenities: ['Infinity Pool', 'Sky Bar', 'Casino Access', 'Spa', 'Multiple Restaurants', 'Business Center'], rooms: [{ type: 'Harbor View Room', price: 420, capacity: 2, amenities: ['Harbor View', 'King Bed', 'Walk-in Shower'] }, { type: 'Sky Suite', price: 980, capacity: 4, amenities: ['Panoramic Views', 'Living Room', 'Dining Area', 'Butler Service'] }], pricePerNight: 420, rating: 4.7, reviewCount: 567, isFeatured: false, addedBy: adminId
    },
    {
      name: 'Coastal Breeze Inn', description: 'An affordable gem by the sea. Wake up to ocean breezes and stunning sunrises at this charming coastal inn, perfect for family vacations.', location: { address: '88 Seaside Drive', city: 'Miami', state: 'FL', country: 'USA', coordinates: { lat: 25.7617, lng: -80.1918 } }, category: 'Standard', stars: 3, thumbnail: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200'], amenities: ['Beach Access', 'Pool', 'Free Parking', 'Free Breakfast', 'BBQ Area'], rooms: [{ type: 'Standard Room', price: 120, capacity: 2, amenities: ['Queen Bed', 'Sea View', 'Balcony'] }, { type: 'Family Room', price: 195, capacity: 4, amenities: ['2 Double Beds', 'Kitchenette', 'Pool View'] }], pricePerNight: 120, rating: 4.3, reviewCount: 891, isFeatured: false, addedBy: adminId
    }
  ];
}

module.exports = router;
