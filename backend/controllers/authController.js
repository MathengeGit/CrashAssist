const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.signup = async (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    role,
    insuranceAgentId,
    insuranceName,
    numCars,
    numberPlates,
  } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password || !phone || !role || !insuranceName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let newUser = {
      name,
      phone,
      email,
      password,
      role,
      insuranceName,
    };

    if (role === 'Driver') {
      newUser.insuranceAgent = insuranceAgentId || null;
      newUser.numCars = Number(numCars) || 0;
      newUser.numberPlates = Array.isArray(numberPlates) ? numberPlates : [];
    }

    const user = await User.create(newUser);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      insuranceAgent: user.insuranceAgent,
      insuranceName: user.insuranceName,
      numCars: user.numCars,
      numberPlates: user.numberPlates,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};
