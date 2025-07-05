const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    role,
    insuranceAgentId,
    insuranceCompany,
    numCars,
    numberPlates,
  } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password || !phone || !role || !insuranceCompany) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user object
    const newUser = {
      name,
      phone,
      email,
      password: hashedPassword,
      role,
      insuranceCompany,
    };

    if (role === 'Driver') {
      newUser.insuranceAgent = insuranceAgentId || null;
      newUser.numCars = Number(numCars) || 0;
      newUser.numberPlates = Array.isArray(numberPlates) ? numberPlates : [];
    }

    // Save to DB
    const user = await User.create(newUser);

    // Respond
    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      insuranceAgent: user.insuranceAgent,
      insuranceCompany: user.insuranceCompany,
      numCars: user.numCars,
      numberPlates: user.numberPlates,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Ensure user exists and compare hashed password
    const isMatch = user && (await bcrypt.compare(password, user.password));

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        insuranceAgent: user.insuranceAgent,
        insuranceCompany: user.insuranceCompany,
        numCars: user.numCars,
        numberPlates: user.numberPlates,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
