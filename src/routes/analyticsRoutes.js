const express = require('express');
const { param } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');
const { auth, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/errorMiddleware');

const router = express.Router();

// Protect all analytics routes with auth middleware
router.use(auth);

// Get dashboard analytics route
router.get('/dashboard', analyticsController.getDashboardAnalytics);

// Get dashboard stats route
router.get('/dashboard-stats', analyticsController.getDashboardStats);

// Get recruitment analytics route
router.get('/recruitment', analyticsController.getRecruitmentAnalytics);

// Get job analytics route
router.get(
  '/jobs/:jobId',
  [
    param('jobId').isMongoId().withMessage('Invalid job ID'),
    validateRequest
  ],
  analyticsController.getJobAnalytics
);

module.exports = router;
