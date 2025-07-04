console.log("✅ claims.js loaded");

const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Claim = require('../models/Claim');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', (req, res) => {
  res.send('Claims route is live');
});

// Upload photos
router.post('/uploadPhotos', authMiddleware, upload.array('photos', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const uploadedPhotoUrls = req.files.map((file) => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer.toString('base64'),
      tempUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    }));

    res.status(200).json({ message: 'Photos uploaded', uploadedPhotoUrls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Report new claim
router.post('/report', authMiddleware, async (req, res) => {
  try {
    const { location, date, description, photos, otherParty } = req.body;

    if (!location || !date || !description || !photos || photos.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);

    const claim = new Claim({
      driverId: user._id,
      driverName: user.name,
      insuranceName: user.insuranceName,
      assignedAgent: user.insuranceAgent || null,
      location,
      date,
      description,
      photos,
      otherParty,
      status: 'pending',
    });

    await claim.save();
    res.status(201).json({ message: 'Claim submitted successfully', claim });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

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
    console.error('Report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get claims for current driver
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const claims = await Claim.find({ driverId: req.user.id }).sort({ date: -1 });
    res.json({ claims });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single claim by ID (with access control)
router.get('/view/:id', authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('driverId', 'name email insuranceCompany')
      .populate('assignedAgent', 'name email');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    const isDriver = req.user.role === 'Driver';
    const isAgent = req.user.role === 'InsuranceAgent';

    const canAccess =
      (isDriver && claim.driverId._id.toString() === req.user.id) ||
      (isAgent && claim.assignedAgent && claim.assignedAgent._id.toString() === req.user.id);

    if (!canAccess) {
      return res.status(403).json({ message: 'Unauthorized access to this claim' });
    }

    res.json(claim);
  } catch (err) {
    console.error('Claim fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update claim status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;
    claim.statusHistory.push({ status, timestamp: new Date() });

    await claim.save();
    res.json({ message: 'Status updated', claim });
  } catch (err) {
    console.error('Status update error:', err);
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
      agentReport: { $exists: true, $ne: '' },
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
router.put('/:id/reassign', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { newAgentId } = req.body;

    const newAgent = await User.findById(newAgentId);
    if (!newAgent || newAgent.role !== 'InsuranceAgent') {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.assignedAgent = newAgentId;
    await claim.save();

    res.json({ message: 'Agent reassigned successfully', claim });
  } catch (err) {
    console.error('Reassignment error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
