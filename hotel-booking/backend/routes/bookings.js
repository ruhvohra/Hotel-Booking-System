const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const { flexAuth, adminOnly } = require('../middleware/auth');

// Create booking
router.post('/', flexAuth, async (req, res) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, guests, specialRequests, guestInfo } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return res.status(400).json({ message: 'Invalid date range' });

    // Check for conflicts
    const conflict = await Booking.findOne({
      hotel: hotelId,
      'room.roomId': roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }]
    });

    if (conflict) return res.status(409).json({ message: 'Room not available for selected dates' });

    const room = hotel.rooms.id(roomId) || hotel.rooms[0];
    const totalPrice = (room?.price || hotel.pricePerNight) * nights;

    const booking = await Booking.create({
      user: req.user._id,
      hotel: hotelId,
      room: { roomId: room?._id, type: room?.type || 'Standard', pricePerNight: room?.price || hotel.pricePerNight },
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guests: guests || { adults: 1, children: 0 },
      totalPrice,
      specialRequests,
      guestInfo: guestInfo || { name: req.user.name, email: req.user.email }
    });

    // Add booking to user
    await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });

    await booking.populate('hotel', 'name location thumbnail');
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user bookings
router.get('/my-bookings', flexAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hotel', 'name location thumbnail images category stars')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single booking
router.get('/:id', flexAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel', 'name location thumbnail images amenities checkInTime checkOutTime policies')
      .populate('user', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel booking
router.put('/:id/cancel', flexAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update booking status (admin)
router.put('/:id/status', flexAuth, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status, paymentStatus }, { new: true })
      .populate('hotel', 'name location')
      .populate('user', 'name email');
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
