const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.signup = async (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    role,
    vehicleNumber,
    insuranceCompany,
  } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'User already exists' });

    let insuranceAgent = null;

    if (role === 'Driver') {
      if (!insuranceCompany) {
        return res.status(400).json({ message: 'Insurance company is required' });
      }

      // Find a random agent in that company
      const agents = await User.find({
        role: 'InsuranceAgent',
        insuranceCompany,
      });

      if (!agents.length) {
        return res.status(400).json({
          message: `No available agents for ${insuranceCompany}`,
        });
      }

      // Pick the first one for simplicity (or randomize)
      insuranceAgent = agents[0]._id;
    }

    const user = await User.create({
      name,
      phone,
      email,
      password,
      role,
      vehicleNumber,
      insuranceCompany,
      insuranceAgent: insuranceAgent || null,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      vehicleNumber: user.vehicleNumber,
      insuranceCompany: user.insuranceCompany,
      insuranceAgent: user.insuranceAgent,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        vehicleNumber: user.vehicleNumber,
        insuranceAgent: user.insuranceAgent,
        insuranceCompany: user.insuranceCompany,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
