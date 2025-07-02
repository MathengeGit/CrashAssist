const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverName: String,
  insuranceName: String,
  location: {
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy: Number,
  altitude: Number,
  heading: Number,
  speed: Number,
  altitudeAccuracy: Number
},
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
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  statusHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
    }
  ],
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