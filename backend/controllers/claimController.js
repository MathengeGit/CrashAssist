const Claim = require('../models/Claim');
const User = require('../models/User');

exports.getAgentClaims = async (req, res) => {
  try {
    const agent = await User.findById(req.user._id);
    if (!agent || agent.role !== 'InsuranceAgent') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const drivers = await User.find({ insuranceCompany: agent.insuranceCompany, role: 'Driver' }).select('_id');
    const driverIds = drivers.map(d => d._id);

    const claims = await Claim.find({ driver: { $in: driverIds } })
      .populate('driver', 'name email')
      .sort({ submittedAt: -1 });

    res.json({ claims });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
