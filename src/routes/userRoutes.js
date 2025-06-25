const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/errorMiddleware');

const router = express.Router();

// Protect all user routes with auth middleware
router.use(auth);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Update current user profile
router.put(
  '/me',
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('position').optional().notEmpty().withMessage('Position cannot be empty'),
    body('department').optional().notEmpty().withMessage('Department cannot be empty'),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
    validateRequest
  ],
  userController.updateCurrentUser
);

// Change password
router.put(
  '/me/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long'),
    validateRequest
  ],
  userController.changePassword
);

// Get user stats
router.get('/me/stats', userController.getUserStats);

// Get all users (for admin and team management)
router.get(
  '/',
  userController.getAllUsers
);

// Get user by ID
router.get(
  '/:userId',
  [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    validateRequest
  ],
  userController.getUserById
);

module.exports = router;
