// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

// Signup
router.post('/signup', signup);

// Login
router.post('/login', login);

// Get all insurance agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await User.find({ role: 'InsuranceAgent' }).select('_id name email');
    res.json(agents);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ message: 'Error fetching agents' });
  }
});

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('insuranceAgent', 'name email insuranceCompany');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update basic profile fields
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update profile and reassign insurance agent if necessary
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const updates = { name: req.body.name, phone: req.body.phone };
    const user = await User.findById(req.user.id);

    if (req.body.insuranceCompany && req.body.insuranceCompany !== user.insuranceCompany) {
      user.insuranceCompany = req.body.insuranceCompany;

      const agents = await User.find({
        role: 'InsuranceAgent',
        insuranceCompany: req.body.insuranceCompany
      });

      user.insuranceAgent = agents.length > 0
        ? agents[Math.floor(Math.random() * agents.length)]._id
        : null;
    }

    user.name = updates.name || user.name;
    user.phone = updates.phone || user.phone;

    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

module.exports = router;
