const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { flexAuth } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clerk sync — called after Clerk login to sync user to MongoDB
router.post('/clerk-sync', async (req, res) => {
  try {
    const { clerkId, email, name, avatar } = req.body;
    if (!clerkId || !email) return res.status(400).json({ message: 'clerkId and email required' });

    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.clerkId = clerkId;
        user.avatar = avatar || user.avatar;
        await user.save();
      } else {
        user = await User.create({ clerkId, email, name: name || email.split('@')[0], avatar: avatar || '' });
      }
    }

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', flexAuth, async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, avatar: req.user.avatar, phone: req.user.phone });
});

// Update profile
router.put('/profile', flexAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
