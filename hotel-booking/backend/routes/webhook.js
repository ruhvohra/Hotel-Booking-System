const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Clerk webhook - syncs user events from Clerk to MongoDB
router.post('/clerk', async (req, res) => {
  try {
    // In production, verify the webhook signature using svix
    // const { Webhook } = require('svix');
    // const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    // const evt = wh.verify(req.body, { 'svix-id': ..., ... });

    const payload = JSON.parse(req.body.toString());
    const { type, data } = payload;

    switch (type) {
      case 'user.created': {
        const email = data.email_addresses?.[0]?.email_address;
        const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || email?.split('@')[0] || 'User';
        await User.findOneAndUpdate(
          { clerkId: data.id },
          { clerkId: data.id, email, name, avatar: data.image_url || '' },
          { upsert: true, new: true }
        );
        break;
      }
      case 'user.updated': {
        const email = data.email_addresses?.[0]?.email_address;
        const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || 'User';
        await User.findOneAndUpdate(
          { clerkId: data.id },
          { email, name, avatar: data.image_url || '' }
        );
        break;
      }
      case 'user.deleted': {
        await User.findOneAndDelete({ clerkId: data.id });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
