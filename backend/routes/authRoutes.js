const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const User = require('../models/User');

// ✅ Signup route
router.post('/signup', signup);

// ✅ Login route (if needed later)
router.post('/login', login);

// ✅ Get all Insurance Agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await User.find({ role: 'InsuranceAgent' }).select('_id name email');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching agents' });
  }
});

module.exports = router;
