const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.registerUser = async (req, res) => {
  const { rollNumber, phoneNumber, hostelName, name, password, role } = req.body;

  try {
    let userExists;
    if (role === 'manager') {
      if (!phoneNumber || !hostelName) {
        return res.status(400).json({ message: 'Phone number and hostel name are required for managers' });
      }
      userExists = await User.findOne({ phoneNumber });
    } else {
      if (!rollNumber) {
        return res.status(400).json({ message: 'Roll number is required for students' });
      }
      userExists = await User.findOne({ rollNumber });
    }

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userPayload = {
      name,
      password: hashedPassword,
      role: role || 'student',
      balance: 0
    };

    if (role === 'manager') {
      userPayload.phoneNumber = phoneNumber;
      userPayload.hostelName = hostelName;
      // Prevent MongoDB duplicate key error on null rollNumber by assigning a unique dummy value
      userPayload.rollNumber = `MANAGER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    } else {
      userPayload.rollNumber = rollNumber;
      // Prevent duplicate key error on null phoneNumber for students
      userPayload.phoneNumber = `STUDENT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    const user = await User.create(userPayload);

    if (user) {
      res.status(201).json({
        _id: user.id,
        rollNumber: user.rollNumber,
        name: user.name,
        role: user.role,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { rollNumber, phoneNumber, hostelName, password, isManager } = req.body;

  try {
    let user;
    if (isManager) {
      if (!phoneNumber || !hostelName) {
        return res.status(400).json({ message: 'Phone number and hostel name are required for managers' });
      }
      user = await User.findOne({ phoneNumber, hostelName });
    } else {
      if (!rollNumber) {
        return res.status(400).json({ message: 'Roll number is required for students' });
      }
      user = await User.findOne({ rollNumber });
    }

    if (user) {
      if (!user.password) {
        return res.status(401).json({ message: 'Invalid credentials - Password missing' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.json({
          _id: user.id,
          rollNumber: user.rollNumber,
          name: user.name,
          role: user.role,
          balance: user.balance,
          token: generateToken(user._id),
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
