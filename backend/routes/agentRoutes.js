const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware'); // ✅ Import this

// GET /api/agents — protected route
router.get('/', authMiddleware, async (req, res) => {
  console.log('✅ /agent route hit by', req.user?._id); // Now req.user will be defined

  try {
    const agents = await User.find({ role: 'InsuranceAgent' }).select('_id name email');
    res.json(agents);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ message: 'Error fetching agents' });
  }
});

module.exports = router;
