const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Driver', 'InsuranceAgent', 'Admin'], required: true },

  insuranceAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  insuranceCompany: {
    type: String,
    default: null,
  },

  numCars: {
  type: Number,
  default: null,
  validate: {
    validator: function (value) {
      return value === null || value >= 0;
    },
    message: 'Number of cars must be non-negative',
  },
},


  numberPlates: {
    type: [String],
    default: [],
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
