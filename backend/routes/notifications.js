// backend/routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ notifications });
});

router.post('/mark-read', verifyToken, async (req, res) => {
  await Notification.updateMany({ userId: req.user.id }, { read: true });
  res.json({ success: true });
});

module.exports = router;
