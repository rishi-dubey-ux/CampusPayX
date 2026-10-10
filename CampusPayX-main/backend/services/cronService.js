const cron = require('node-cron');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Schedule tasks to be run on the server.
// Runs at 00:00 on day-of-month 1.
cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly credit chron job...');
  try {
    const students = await User.find({ role: 'student' });
    
    // Add 2000 to each student's balance
    const operations = students.map(student => {
      student.balance += 2000;
      return student.save();
    });

    await Promise.all(operations);

    // Provide a transaction record for each credit optionally (could be too many rows, but useful for logs)
    const logs = students.map(student => ({
      receiver: student._id,
      amount: 2000,
      type: 'credit',
      status: 'success'
    }));

    await Transaction.insertMany(logs);
    console.log('Monthly credit applied to all students.');
  } catch (error) {
    console.error('Error applying monthly credits:', error);
  }
});

console.log('Cron service initialized.');
