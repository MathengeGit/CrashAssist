// controllers/messageController.js
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user.id;

    const message = await Message.create({ senderId, receiverId, text });

    // Create notification
    const senderUser = await User.findById(senderId);
    const senderName = senderUser?.name || 'Someone';

    await Notification.create({
      userId: receiverId,
      message: `New message from ${senderName}`,
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.id;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    }).sort({ sentAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error('Failed to fetch messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};
