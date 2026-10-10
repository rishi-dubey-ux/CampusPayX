const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Load the User model
const User = require('./models/User');

const resetBalance = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');

    const result = await User.updateMany({}, { $set: { balance: 0 } });
    console.log(`Updated ${result.modifiedCount} users to balance 0.`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetBalance();
