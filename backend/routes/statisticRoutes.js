const express = require('express');
const {
  getDashboardStats,
  getPaymentStatus,
  getMonthlyReport
} = require('../controllers/statisticController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/payment-status', getPaymentStatus);
router.get('/monthly-report', getMonthlyReport);

module.exports = router; 