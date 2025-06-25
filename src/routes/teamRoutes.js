const express = require('express');
const { body, param } = require('express-validator');
const teamController = require('../controllers/teamController');
const { auth, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/errorMiddleware');

const router = express.Router();

// Protect all team routes with auth middleware
router.use(auth);

// List team members route
router.get('/', teamController.getTeamMembers);

// Get team member details route
router.get(
  '/:memberId',
  [
    param('memberId').isMongoId().withMessage('Invalid member ID'),
    validateRequest
  ],
  teamController.getTeamMemberById
);

// Invite team member route
router.post(
  '/invite',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('role')
      .isIn(['admin', 'recruiter', 'interviewer', 'hiring_manager'])
      .withMessage('Invalid role'),
    validateRequest
  ],
  authorize(['admin']), // Only admin can invite new members
  teamController.inviteTeamMember
);

// Update team member route
router.put(
  '/:memberId',
  [
    param('memberId').isMongoId().withMessage('Invalid member ID'),
    validateRequest
  ],
  authorize(['admin']), // Only admin can update team members
  teamController.updateTeamMember
);

// Delete team member route
router.delete(
  '/:memberId',
  [
    param('memberId').isMongoId().withMessage('Invalid member ID'),
    validateRequest
  ],
  authorize(['admin']), // Only admin can delete team members
  teamController.deleteTeamMember
);

module.exports = router;
