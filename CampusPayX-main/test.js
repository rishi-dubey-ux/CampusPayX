const mongoose = require('mongoose');
require('dotenv').config({path: './backend/.env'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log(users.map(u => ({role: u.role, num: u.phoneNumber, name: u.name, roll: u.rollNumber})));
  process.exit(0);
});
