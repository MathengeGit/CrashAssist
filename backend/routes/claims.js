console.log("✅ claims.js loaded");
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Claim = require('../models/Claim');
const claimController = require('../controllers/claimController');

// Get claims for agent's insurance company
router.get('/agent', authMiddleware, async (req, res) => {
  console.log('✅ /agent route hit by', req.user?.email);
  try {
    const agent = await User.findById(req.user.id);

    if (agent.role !== 'InsuranceAgent') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const claims = await Claim.find({ insuranceName: agent.insuranceName }).sort({ date: -1 });
    res.json({ claims });
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

// Report new claim
router.post('/report', authMiddleware, async (req, res) => {
  try {
    // Get the driver’s full info
    const user = await User.findById(req.user.id);

    const claim = new Claim({
      driverId: user._id,
      driverName: user.name, 
      insuranceName: user.insuranceName,
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

// Get only claims that have been processed (i.e. have agent reports)
router.get('/agent/reports', authMiddleware, async (req, res) => {
  try {
    const agent = await User.findById(req.user.id);
    if (agent.role !== 'InsuranceAgent') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const claims = await Claim.find({
      insuranceName: agent.insuranceName,
      agentReport: { $exists: true, $ne: '' }  // Only claims with agent reports
    }).sort({ agentReportDate: -1 });

    res.json({ claims });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a claim (agent updates report/status)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Claim.findByIdAndUpdate(
  req.params.id,
  {
    agentReport: req.body.report,
    agentReportDate: new Date(),
    status: req.body.status,
  },
  { new: true }
);

    if (!updated) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json({ message: 'Claim updated', claim: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Fetch a specific claim by ID
router.get('/:id', authMiddleware, async (req, res) => {
  console.log('Matched dynamic ID route with param:', req.params.id);
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    res.json({ claim });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;