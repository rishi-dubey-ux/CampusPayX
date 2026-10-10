const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMe, searchByRollNumber } = require('../controllers/userController');

router.get('/me', protect, getMe);
router.get('/search/:rollNumber', protect, searchByRollNumber);

module.exports = router;
