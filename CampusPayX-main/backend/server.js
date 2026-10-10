require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const { setupQueueSocket } = require('./services/queueService');
require('./services/cronService'); // Initialize cron jobs
const { autoRejectOldOrders } = require('./controllers/transactionController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Attach io to req so controllers can use it if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Setup sockets
setupQueueSocket(io);

// Background job for auto-rejecting old orders
setInterval(() => {
  autoRejectOldOrders(io);
}, 30000); // Check every 30 seconds

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
