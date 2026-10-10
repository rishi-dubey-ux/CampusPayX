const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  hostelName: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'manager', 'admin'],
    default: 'student'
  },
  balance: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
