const Claim = require('../models/Claim');
const User = require('../models/User');
const Notification = require('../models/Notification'); // 👈 import

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

// ✅ New controller function to update claim status and notify driver
exports.updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    claim.status = status;
    await claim.save();

    await Notification.create({
      userId: claim.driverId,
      message: `Your claim has been updated to "${status}"`,
    });

    res.json({ message: 'Claim status updated', claim });
  } catch (err) {
    console.error('Failed to update claim:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
