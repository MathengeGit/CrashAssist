const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Claim = require('../models/Claim');
const User = require('../models/User');

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const agent = await User.findById(req.user.id);

    if (!agent || agent.role !== 'InsuranceAgent') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const matchInsurance = { insuranceCompany: agent.insuranceCompany };

    const totalClaims = await Claim.countDocuments(matchInsurance);

    const statusCounts = await Claim.aggregate([
      { $match: matchInsurance },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const claimsByDate = await Claim.aggregate([
      { $match: matchInsurance },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' },
            day: { $dayOfMonth: '$submittedAt' },
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 7 } // last 7 days
    ]);

    res.json({
      totalClaims,
      statusCounts,
      claimsByDate,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
