// backend/routes/messages.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification'); // ✅ Moved to top

// GET /api/messages/drivers/list
router.get('/drivers/list', authMiddleware, async (req, res) => {
  const agent = await User.findById(req.user.id);
  if (agent.role !== 'InsuranceAgent') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const drivers = await User.find({
    insuranceCompany: agent.insuranceCompany,
    role: 'Driver',
  }).select('name _id email');

  res.json({ drivers });
});

// POST /api/messages/ — Send a message
router.post('/', authMiddleware, async (req, res) => {
  const { receiverId, text } = req.body;

  if (!receiverId || !text) {
    return res.status(400).json({ message: 'receiverId and text are required' });
  }

  const message = new Message({
    senderId: req.user.id,
    receiverId,
    text,
  });

  await message.save();

  // Send a message notification if not already sent
  const existingNotification = await Notification.findOne({
    userId: receiverId,
    type: 'new_message',
    read: false,
  });

  if (!existingNotification) {
   await Notification.create({
  userId: receiverId,
  message: `You have a new message from ${req.user.name || 'a user'}.`,
  type: 'new_message',
});


  }

  res.status(201).json({ message });
});

// GET /api/messages/:userId — Get messages between current user and another
router.get('/:userId', authMiddleware, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { senderId: req.user.id, receiverId: req.params.userId },
      { senderId: req.params.userId, receiverId: req.user.id },
    ],
  }).sort({ sentAt: 1 });

  res.json({ messages });
});

module.exports = router;
