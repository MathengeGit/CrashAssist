const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  insuranceCompany: {
    type: String,
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: Number,
    altitude: Number,
    heading: Number,
    speed: Number,
    altitudeAccuracy: Number
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  photos: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, 'At least one photo is required']
  },
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
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
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
