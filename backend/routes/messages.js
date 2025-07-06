// backend/routes/messages.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all drivers for agent’s insurance company
router.get('/drivers/list', authMiddleware, async (req, res) => {
  const agent = await User.findById(req.user.id);
  if (agent.role !== 'InsuranceAgent') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const drivers = await User.find({
    insuranceCompany: agent.insuranceCompany,
    role: 'Driver'
  }).select('name _id email');

  res.json({ drivers });
});

// Send message
router.post('/', authMiddleware, async (req, res) => {
  const { receiverId, text } = req.body;
  const message = new Message({
    senderId: req.user.id,
    receiverId,
    text
  });
  await message.save();
  res.status(201).json({ message });
});

// Get messages between agent and driver
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
