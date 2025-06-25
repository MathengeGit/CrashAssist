const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  }
});

module.exports = mongoose.model('Claim', claimSchema);