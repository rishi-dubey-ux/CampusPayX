require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const hash = "123";
        const user = await User.create({
            name: "Test",
            password: hash,
            role: "student",
            balance: 0,
            rollNumber: "TEST_123"
        });
        console.log("Success:", user);
    } catch(err) {
        console.error("Error creating student:", err.message);
    }
    
    try {
        const hash = "123";
        const user2 = await User.create({
            name: "Test2",
            password: hash,
            role: "manager",
            balance: 0,
            rollNumber: "MANAGER_123",
            phoneNumber: "1234567890",
            hostelName: "Hostel"
        });
        console.log("Success2:", user2);
    } catch(err) {
        console.error("Error creating manager:", err.message);
    }
    
    try {
        const hash = "123";
        const user3 = await User.create({
            name: "Test3",
            password: hash,
            role: "manager",
            balance: 0,
            rollNumber: "MANAGER_124",
            phoneNumber: "0987654321",
            hostelName: "Hostel2"
        });
        console.log("Success3:", user3);
    } catch(err) {
        console.error("Error creating manager 2:", err.message);
    }
    
    process.exit(0);
});
