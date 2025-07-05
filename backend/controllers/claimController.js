const Claim = require('../models/Claim');
const User = require('../models/User');

exports.getAgentClaims = async (req, res) => {
  try {
    const agent = await User.findById(req.user._id);
    if (!agent || agent.role !== 'InsuranceAgent') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const claims = await Claim.find({ insuranceCompany: agent.insuranceCompany })
      .populate('driverId', 'name email')
      .sort({ submittedAt: -1 });

    res.json({ claims });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
