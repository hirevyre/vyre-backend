const express = require('express');
const { auth } = require('../middlewares/authMiddleware');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Protect all analytics routes with auth middleware
router.use(auth);

// Dashboard stats
router.get('/dashboard-stats', analyticsController.getDashboardStats);

// Activity summary
router.get('/activity-summary', analyticsController.getActivitySummary);

// Source effectiveness
router.get('/source-effectiveness', analyticsController.getSourceEffectiveness);

// Export the router
module.exports = router;
