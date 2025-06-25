const express = require('express');
const { body, param } = require('express-validator');
const interviewController = require('../controllers/interviewController');
const { auth } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/errorMiddleware');

const router = express.Router();

// Protect all interview routes with auth middleware
router.use(auth);

// Schedule interview route
router.post(
  '/',
  [
    body('candidateId')
      .isMongoId()
      .withMessage('Valid candidate ID is required'),
    body('jobId')
      .isMongoId()
      .withMessage('Valid job ID is required'),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isDate()
      .withMessage('Valid date is required'),
    body('time')
      .notEmpty()
      .withMessage('Time is required'),
    validateRequest
  ],
  interviewController.scheduleInterview
);

// Get all interviews route
router.get('/', interviewController.getInterviews);

// Get interview by ID route
router.get(
  '/:interviewId',
  [
    param('interviewId').isMongoId().withMessage('Invalid interview ID'),
    validateRequest
  ],
  interviewController.getInterviewById
);

// Update interview route
router.put(
  '/:interviewId',
  [
    param('interviewId').isMongoId().withMessage('Invalid interview ID'),
    validateRequest
  ],
  interviewController.updateInterview
);

// Update interview status route
router.patch(
  '/:interviewId/status',
  [
    param('interviewId').isMongoId().withMessage('Invalid interview ID'),
    body('status')
      .isIn(['Scheduled', 'Completed', 'Cancelled', 'No-show'])
      .withMessage('Invalid status'),
    validateRequest
  ],
  interviewController.updateInterviewStatus
);

// Delete interview route
router.delete(
  '/:interviewId',
  [
    param('interviewId').isMongoId().withMessage('Invalid interview ID'),
    validateRequest
  ],
  interviewController.deleteInterview
);

// Submit interview feedback route
router.post(
  '/:interviewId/feedback',
  [
    param('interviewId').isMongoId().withMessage('Invalid interview ID'),
    body('overallScore')
      .isInt({ min: 0, max: 100 })
      .withMessage('Overall score must be between 0 and 100'),
    body('recommendation')
      .isIn(['Hire', 'Shortlist', 'Consider', 'Reject'])
      .withMessage('Invalid recommendation'),
    validateRequest
  ],
  interviewController.submitInterviewFeedback
);

// Add notes to interview route
router.post(
  '/:interviewId/notes',
  [
    param('interviewId').isMongoId().withMessage('Invalid interview ID'),
    body('notes')
      .notEmpty()
      .withMessage('Notes content is required'),
    validateRequest
  ],
  interviewController.addInterviewNotes
);

module.exports = router;
