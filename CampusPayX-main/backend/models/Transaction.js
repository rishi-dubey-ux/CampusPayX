const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // May be null if credit
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  amount: {
    type: Number,
    required: true
  },
  itemName: {
    type: String,
    required: false
  },
  itemCategory: {
    type: String,
    enum: ['Dairy Products', 'Non-Veg', 'Extras'],
    required: false
  },
  quantity: {
    type: Number,
    required: false,
    default: 1
  },
  tokenNumber: {
    type: Number,
    required: false
  },
  type: {
    type: String,
    enum: ['payment', 'transfer', 'credit'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'success'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
