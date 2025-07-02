const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverName: String, // Added for convenience in querying
  insuranceName: String,
  location: String,
  date: Date,
  description: String,
  photos: [String],
  otherParty: {
    name: String,
    phone: String,
    vehicle: String,
    insurance: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  agentReport: {
  type: String,
  default: ''
  },
  agentReportDate: {
  type: Date
  }
});

module.exports = mongoose.model('Claim', claimSchema);
