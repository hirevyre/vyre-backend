const express = require('express');
const { body, param, query } = require('express-validator');
const jobController = require('../controllers/jobController');
const { auth, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/errorMiddleware');

const router = express.Router();

// Protect all job routes with auth middleware
router.use(auth);

// Create job route
router.post(
  '/',
  [
    body('jobTitle')
      .notEmpty()
      .withMessage('Job title is required'),
    body('jobDescription')
      .notEmpty()
      .withMessage('Job description is required'),
    validateRequest
  ],
  jobController.createJob
);

// Get all jobs route
router.get('/', jobController.getJobs);

// Get job by ID route
router.get(
  '/:jobId',
  [
    param('jobId').isMongoId().withMessage('Invalid job ID'),
    validateRequest
  ],
  jobController.getJobById
);

// Update job route
router.put(
  '/:jobId',
  [
    param('jobId').isMongoId().withMessage('Invalid job ID'),
    validateRequest
  ],
  jobController.updateJob
);

// Update job status route
router.patch(
  '/:jobId/status',
  [
    param('jobId').isMongoId().withMessage('Invalid job ID'),
    body('status')
      .isIn(['Active', 'Draft', 'Closed', 'Archived'])
      .withMessage('Invalid status'),
    validateRequest
  ],
  jobController.updateJobStatus
);

// Delete job route
router.delete(
  '/:jobId',
  [
    param('jobId').isMongoId().withMessage('Invalid job ID'),
    validateRequest
  ],
  authorize(['admin', 'recruiter']), // Only admin and recruiter can delete jobs
  jobController.deleteJob
);

// Get job applicants route
router.get(
  '/:jobId/applicants',
  [
    param('jobId').isMongoId().withMessage('Invalid job ID'),
    validateRequest
  ],
  jobController.getJobApplicants
);

module.exports = router;
