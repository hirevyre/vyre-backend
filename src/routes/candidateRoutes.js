const express = require('express');
const { body, param } = require('express-validator');
const candidateController = require('../controllers/candidateController');
const { auth } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/errorMiddleware');

const router = express.Router();

// Protect all candidate routes with auth middleware
router.use(auth);

// Create candidate route
router.post(
  '/',
  [
    body('firstName')
      .notEmpty()
      .withMessage('First name is required'),
    body('lastName')
      .notEmpty()
      .withMessage('Last name is required'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('jobId')
      .isMongoId()
      .withMessage('Valid job ID is required'),
    validateRequest
  ],
  candidateController.createCandidate
);

// Get all candidates route
router.get('/', candidateController.getCandidates);

// Get candidate by ID route
router.get(
  '/:candidateId',
  [
    param('candidateId').isMongoId().withMessage('Invalid candidate ID'),
    validateRequest
  ],
  candidateController.getCandidateById
);

// Update candidate route
router.put(
  '/:candidateId',
  [
    param('candidateId').isMongoId().withMessage('Invalid candidate ID'),
    validateRequest
  ],
  candidateController.updateCandidate
);

// Update candidate status route
router.patch(
  '/:candidateId/status',
  [
    param('candidateId').isMongoId().withMessage('Invalid candidate ID'),
    body('status')
      .isIn(['New', 'Screening', 'Interviewing', 'Shortlisted', 'Rejected', 'Hired'])
      .withMessage('Invalid status'),
    validateRequest
  ],
  candidateController.updateCandidateStatus
);

// Delete candidate route
router.delete(
  '/:candidateId',
  [
    param('candidateId').isMongoId().withMessage('Invalid candidate ID'),
    validateRequest
  ],
  candidateController.deleteCandidate
);

// Add notes to candidate route
router.post(
  '/:candidateId/notes',
  [
    param('candidateId').isMongoId().withMessage('Invalid candidate ID'),
    body('notes')
      .notEmpty()
      .withMessage('Notes content is required'),
    validateRequest
  ],
  candidateController.addCandidateNotes
);

// Get candidate notes route
router.get(
  '/:candidateId/notes',
  [
    param('candidateId').isMongoId().withMessage('Invalid candidate ID'),
    validateRequest
  ],
  candidateController.getCandidateNotes
);

module.exports = router;
