const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Claim = require('../models/Claim');

// Report new claim
router.post('/report', authMiddleware, async (req, res) => {
  try {
    const claim = new Claim({
      driverId: req.user.id,
      location: req.body.location,
      date: req.body.date,
      description: req.body.description,
      photos: req.body.photos,
      otherParty: req.body.otherParty,
      status: 'pending',
    });

    await claim.save();
    res.status(201).json({ message: 'Claim submitted successfully', claim });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get driver's claims
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const claims = await Claim.find({ driverId: req.user.id }).sort({ date: -1 });
    res.json({ claims });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;