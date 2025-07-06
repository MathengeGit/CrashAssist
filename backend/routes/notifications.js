// backend/routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/mark-read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
