const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware for JWT auth
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware for Clerk auth (verifies Clerk session token)
const clerkProtect = async (req, res, next) => {
  const sessionToken = req.headers.authorization?.split(' ')[1];
  if (!sessionToken) return res.status(401).json({ message: 'No session token' });

  try {
    // Decode Clerk JWT (in production use Clerk SDK for full verification)
    const decoded = jwt.decode(sessionToken);
    if (!decoded || !decoded.sub) throw new Error('Invalid token');

    let user = await User.findOne({ clerkId: decoded.sub });
    if (!user) {
      // Auto-create user from Clerk data
      user = await User.create({
        clerkId: decoded.sub,
        email: decoded.email || `${decoded.sub}@clerk.user`,
        name: decoded.name || decoded.email?.split('@')[0] || 'User',
        avatar: decoded.image_url || ''
      });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Clerk auth failed', error: err.message });
  }
};

// Middleware: Accepts both JWT and Clerk tokens
const flexAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    // Try JWT first
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await User.findById(decoded.id).select('-password');
    if (req.user) return next();
  } catch {
    // Fall through to Clerk
  }

  try {
    const decoded = jwt.decode(token);
    if (!decoded?.sub) throw new Error('Invalid');
    let user = await User.findOne({ clerkId: decoded.sub });
    if (!user) {
      user = await User.create({
        clerkId: decoded.sub,
        email: decoded.email || `${decoded.sub}@clerk.user`,
        name: decoded.name || 'User',
        avatar: decoded.image_url || ''
      });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, clerkProtect, flexAuth, adminOnly };
