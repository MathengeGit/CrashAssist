const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  }
});

module.exports = mongoose.model('Claim', claimSchema);