const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const Claim = require('../models/Claim');

// Multer setup for memory storage (can be replaced with Cloudinary or disk later)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', (req, res) => {
  res.send('Claims route is live');
});


// POST /api/claims/uploadPhotos - Accept up to 3 images
router.post('/uploadPhotos', authMiddleware, upload.array('photos', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // In a real setup, you'd upload to Cloudinary/S3 here and get URLs
    const uploadedPhotoUrls = req.files.map((file, index) => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer.toString('base64'), // Optional: you can also just store the buffer
      tempUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, // Used by frontend for previews
    }));

    res.status(200).json({ message: 'Photos uploaded', uploadedPhotoUrls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// POST /api/claims/report - Save the claim after uploading images
router.post('/report', authMiddleware, async (req, res) => {
  try {
    const { location, date, description, photos, otherParty } = req.body;

    if (!location || !date || !description || !photos || photos.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const claim = new Claim({
      driverId: req.user.id,
      location,             // { latitude, longitude }
      date,
      description,
      photos,               // Array of image URLs
      otherParty,           // Object with name, contact, licensePlate, etc.
      status: 'pending',
    });

    await claim.save();
    res.status(201).json({ message: 'Claim submitted successfully', claim });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// GET /api/claims/mine - Get all claims by the logged-in driver
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const claims = await Claim.find({ driverId: req.user.id }).sort({ date: -1 });
    res.json({ claims });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/claims/:id - Get single claim with populated agent
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('assignedAgent', 'name email');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check permission
    if (claim.driverId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to this claim' });
    }

    res.json(claim);
  } catch (err) {
    console.error('Claim fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/claims/:id/status - Update claim status & push to history
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

    // Update current status
    claim.status = status;

    // Push new history entry
    claim.statusHistory.push({
      status,
      timestamp: new Date(),
    });

    await claim.save();

    res.json({ message: 'Status updated', claim });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = router;
