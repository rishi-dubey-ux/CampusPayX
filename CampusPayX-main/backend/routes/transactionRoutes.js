const express = require('express');
const router = express.Router();
const { protect, adminOrManager } = require('../middleware/authMiddleware');
const { 
  payMess, 
  transferMoney, 
  getHistory, 
  getAllHistoryManager, 
  topUp,
  getActiveQueues,
  serveOrder,
  rejectOrder,
  getPendingOrderForUser,
  getAnalytics,
  trackStudent
} = require('../controllers/transactionController');

router.post('/pay', protect, payMess);
router.post('/transfer', protect, transferMoney);
router.post('/topup', protect, topUp);
router.get('/history', protect, getHistory);
router.get('/manager/history', protect, adminOrManager, getAllHistoryManager);

// New Queue System Routes
router.get('/manager/queues', protect, adminOrManager, getActiveQueues);
router.get('/manager/analytics', protect, adminOrManager, getAnalytics);
router.post('/manager/track-student', protect, adminOrManager, trackStudent);
router.post('/manager/serve/:id', protect, adminOrManager, serveOrder);
router.post('/manager/reject/:id', protect, adminOrManager, rejectOrder);
router.get('/pending', protect, getPendingOrderForUser);

module.exports = router;
