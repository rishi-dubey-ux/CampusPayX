const Transaction = require('../models/Transaction');
const User = require('../models/User');
exports.payMess = async (req, res) => {
  const { amount, venue, itemName, quantity } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    const user = await User.findById(req.user._id);

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.balance -= amount;
    await user.save();

    // Generate token number 1 to 1000
    const tokenNumber = Math.floor(Math.random() * 1000) + 1;

    const transaction = await Transaction.create({
      sender: user._id,
      amount,
      type: 'payment',
      status: 'pending',
      itemCategory: venue || 'Extras',
      itemName: itemName || 'Mess Payment',
      quantity: quantity || 1,
      tokenNumber
    });

    if (req.io) {
      req.io.emit('queueUpdate');
    }

    res.json({ message: 'Payment successful', transaction, newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.transferMoney = async (req, res) => {
  const { receiverRollNumber, amount } = req.body;

  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    const sender = await User.findById(req.user._id);
    const receiver = await User.findOne({ rollNumber: receiverRollNumber });

    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });
    if (sender._id.toString() === receiver._id.toString()) return res.status(400).json({ message: 'Cannot transfer to yourself' });

    if (sender.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    sender.balance -= amount;
    receiver.balance += Number(amount);

    await sender.save();
    await receiver.save();

    const transaction = await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      type: 'transfer',
      status: 'success'
    });

    res.json({ message: 'Transfer successful', transaction, newBalance: sender.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    // Both sender and receiver transactions
    const transactions = await Transaction.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'name rollNumber')
      .populate('receiver', 'name rollNumber')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllHistoryManager = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('sender', 'name rollNumber')
      .populate('receiver', 'name rollNumber')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.topUp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const topUpCount = await Transaction.countDocuments({
      receiver: user._id,
      type: 'credit',
      createdAt: { $gte: startOfMonth }
    });

    if (topUpCount >= 4) {
      return res.status(400).json({ message: 'Maximum 4 top-ups per month allowed' });
    }

    user.balance += 500;
    await user.save();

    const transaction = await Transaction.create({
      receiver: user._id,
      amount: 500,
      type: 'credit',
      status: 'success'
    });

    res.json({ message: 'Top-up successful', transaction, newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getActiveQueues = async (req, res) => {
  try {
    const activeOrders = await Transaction.find({ type: 'payment', status: 'pending' })
      .populate('sender', 'name rollNumber')
      .sort({ createdAt: 1 });
    
    res.json(activeOrders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.serveOrder = async (req, res) => {
  try {
    const order = await Transaction.findById(req.params.id).populate('sender');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.status = 'success';
    await order.save();

    if (req.io) {
      req.io.emit('queueUpdate');
      req.io.emit('studentCalled', { rollNumber: order.sender.rollNumber });
    }

    res.json({ message: 'Order served', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.rejectOrder = async (req, res) => {
  try {
    const order = await Transaction.findById(req.params.id).populate('sender');
    if (!order || order.status !== 'pending') {
      return res.status(404).json({ message: 'Pending order not found' });
    }
    
    order.status = 'failed';
    await order.save();

    // Refund
    const user = await User.findById(order.sender._id);
    if (user) {
      user.balance += order.amount;
      await user.save();
    }

    if (req.io) {
      req.io.emit('queueUpdate');
      req.io.emit('orderRejected', { rollNumber: order.sender.rollNumber });
    }

    res.json({ message: 'Order rejected and refunded', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPendingOrderForUser = async (req, res) => {
  try {
    const pendingOrder = await Transaction.findOne({ 
      sender: req.user._id, 
      type: 'payment', 
      status: 'pending' 
    }).sort({ createdAt: -1 });

    res.json(pendingOrder);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.autoRejectOldOrders = async (io) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const oldOrders = await Transaction.find({
      type: 'payment',
      status: 'pending',
      createdAt: { $lt: fiveMinutesAgo }
    }).populate('sender');

    if (oldOrders.length > 0) {
      for (let order of oldOrders) {
        order.status = 'failed';
        await order.save();

        const user = await User.findById(order.sender._id);
        if (user) {
          user.balance += order.amount;
          await user.save();
        }

        if (io) {
          io.emit('orderRejected', { rollNumber: order.sender.rollNumber });
        }
      }

      if (io) {
        io.emit('queueUpdate');
      }
      console.log(`Auto-rejected ${oldOrders.length} stale orders.`);
    }
  } catch (err) {
    console.error('Error auto-rejecting old orders:', err);
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeOrders = await Transaction.aggregate([
      { 
        $match: { 
          type: 'payment', 
          status: 'success',
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          coupons: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const dailyData = activeOrders.map(item => ({ date: item._id, coupons: item.coupons }));

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrders = await Transaction.aggregate([
       { $match: { type: 'payment', status: 'success', createdAt: { $gte: startOfToday } } },
       { $group: { _id: null, totalCoupons: { $sum: "$amount" } } }
    ]);
    const dailyCount = todayOrders.length > 0 ? todayOrders[0].totalCoupons : 0;

    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const monthlyOrders = await Transaction.aggregate([
       { $match: { type: 'payment', status: 'success', createdAt: { $gte: startOfThisMonth } } },
       { $group: { _id: null, totalCoupons: { $sum: "$amount" } } }
    ]);
    const monthlyCount = monthlyOrders.length > 0 ? monthlyOrders[0].totalCoupons : 0;

    res.json({
      dailyData,
      dailyCount,
      monthlyCount
    });

  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.trackStudent = async (req, res) => {
  const { name, rollNumber } = req.body;
  if (!name && !rollNumber) {
    return res.status(400).json({ message: 'Must provide either a name or roll number' });
  }

  try {
    let query = {};
    if (rollNumber) {
      // Prioritize rollNumber matching
      query.rollNumber = rollNumber;
    } else {
      query.name = new RegExp(name, 'i');
    }

    const student = await User.findOne(query).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const monthlySpentAgg = await Transaction.aggregate([
      { $match: { sender: student._id, type: 'payment', status: 'success' } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, 
          amountSpent: { $sum: "$amount" } 
        } 
      },
      { $sort: { "_id": -1 } }
    ]);

    const monthlyTopupsAgg = await Transaction.aggregate([
      { $match: { receiver: student._id, type: 'credit', status: 'success' } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, 
          topupAdded: { $sum: "$amount" } 
        } 
      },
      { $sort: { "_id": -1 } }
    ]);

    res.json({
      student,
      monthlySpent: monthlySpentAgg.map(item => ({ month: item._id, amount: item.amountSpent })),
      monthlyTopups: monthlyTopupsAgg.map(item => ({ month: item._id, amount: item.topupAdded }))
    });

  } catch (err) {
    console.error('Track Student Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
