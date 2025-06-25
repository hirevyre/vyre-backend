const express = require('express');
const settingsController = require('../controllers/settingsController');
const { auth, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all settings routes with auth middleware
router.use(auth);

// Company settings routes
router.get('/company', settingsController.getCompanySettings);
router.put('/company', authorize(['admin']), settingsController.updateCompanySettings);

// Interview preferences routes
router.get('/interview-preferences', settingsController.getInterviewPreferences);
router.put('/interview-preferences', settingsController.updateInterviewPreferences);

// Notification preferences routes
router.get('/notification-preferences', settingsController.getNotificationPreferences);
router.put('/notification-preferences', settingsController.updateNotificationPreferences);

module.exports = router;
