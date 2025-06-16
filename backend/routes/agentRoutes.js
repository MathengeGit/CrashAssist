const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/agents
router.get('/', async (req, res) => {
  try {
    const agents = await User.find({ role: 'InsuranceAgent' }).select('_id name email');
    res.json(agents);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ message: 'Error fetching agents' });
  }
});

module.exports = router;
