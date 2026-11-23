const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const { flexAuth, adminOnly } = require('../middleware/auth');

// Get all hotels with filters
router.get('/', async (req, res) => {
  try {
    const { city, country, category, minPrice, maxPrice, stars, checkIn, checkOut, guests, page = 1, limit = 12, featured, search } = req.query;

    const query = { isActive: true };
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (country) query['location.country'] = new RegExp(country, 'i');
    if (category) query.category = category;
    if (stars) query.stars = { $gte: parseInt(stars) };
    if (featured === 'true') query.isFeatured = true;
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = parseInt(minPrice);
      if (maxPrice) query.pricePerNight.$lte = parseInt(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'location.city': new RegExp(search, 'i') },
        { 'location.country': new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [hotels, total] = await Promise.all([
      Hotel.find(query).skip(skip).limit(parseInt(limit)).sort({ isFeatured: -1, rating: -1, createdAt: -1 }),
      Hotel.countDocuments(query)
    ]);

    res.json({ hotels, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single hotel
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('addedBy', 'name email');
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check availability
router.post('/:id/availability', async (req, res) => {
  try {
    const { checkIn, checkOut, roomType, guests } = req.body;
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return res.status(400).json({ message: 'Invalid dates' });

    // Count existing bookings for this hotel in date range
    const overlappingBookings = await Booking.countDocuments({
      hotel: hotel._id,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ]
    });

    // Find available rooms
    const availableRooms = hotel.rooms.filter(room => {
      const bookedCount = overlappingBookings;
      return room.available && (roomType ? room.type === roomType : true);
    });

    const isAvailable = availableRooms.length > 0;

    res.json({
      available: isAvailable,
      nights,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      rooms: availableRooms,
      priceEstimate: isAvailable ? availableRooms[0].price * nights : null,
      totalBookings: overlappingBookings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add review
router.post('/:id/reviews', flexAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const alreadyReviewed = hotel.reviews.find(r => r.user?.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });

    hotel.reviews.push({ user: req.user._id, userName: req.user.name, rating, comment });
    hotel.updateRating();
    await hotel.save();

    res.status(201).json({ message: 'Review added', rating: hotel.rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create hotel (admin)
router.post('/', flexAuth, adminOnly, async (req, res) => {
  try {
    const hotel = await Hotel.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update hotel (admin)
router.put('/:id', flexAuth, adminOnly, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete hotel (admin)
router.delete('/:id', flexAuth, adminOnly, async (req, res) => {
  try {
    await Hotel.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Hotel removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
