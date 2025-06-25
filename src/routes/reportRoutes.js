const express = require('express');
const { body, param } = require('express-validator');
const reportController = require('../controllers/reportController');
const { auth } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/errorMiddleware');

const router = express.Router();

// Protect all report routes with auth middleware
router.use(auth);

// Generate report route
router.post(
  '/',
  [
    body('interviewId')
      .isMongoId()
      .withMessage('Valid interview ID is required'),
    validateRequest
  ],
  reportController.generateReport
);

// Get all reports route
router.get('/', reportController.getReports);

// Get report by ID route
router.get(
  '/:reportId',
  [
    param('reportId').isMongoId().withMessage('Invalid report ID'),
    validateRequest
  ],
  reportController.getReportById
);

// Add notes to report route
router.post(
  '/:reportId/notes',
  [
    param('reportId').isMongoId().withMessage('Invalid report ID'),
    body('notes')
      .notEmpty()
      .withMessage('Notes content is required'),
    validateRequest
  ],
  reportController.addReportNotes
);

module.exports = router;
