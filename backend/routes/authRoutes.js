const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

// Signup
router.post('/signup', signup);

// Login
router.post('/signup', signup); // ✅ without parentheses


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

// Add this to authRoutes.js
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

// PUT /api/auth/update-profile
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const updates = { name: req.body.name, phone: req.body.phone };

    const user = await User.findById(req.user.id);

    // Detect change in insuranceName and assign a new agent
    if (req.body.insuranceName && req.body.insuranceName !== user.insuranceName) {
      user.insuranceName = req.body.insuranceName;

      const agents = await User.find({
        role: 'InsuranceAgent',
        insuranceName: req.body.insuranceName
      });

      if (agents.length > 0) {
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        user.insuranceAgent = randomAgent._id;
      } else {
        user.insuranceAgent = null;
      }
    }

    user.name = updates.name || user.name;
    user.phone = updates.phone || user.phone;

    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});



module.exports = router;