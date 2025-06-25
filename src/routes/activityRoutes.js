const express = require('express');
const { auth } = require('../middlewares/authMiddleware');
const responseUtils = require('../utils/responseUtils');

const router = express.Router();

// Protect all activity routes
router.use(auth);

// Get all activities
router.get('/', async (req, res) => {
  try {
    // This is a placeholder implementation
    // In a real app, you would fetch activities from the database
    const activities = [
      {
        id: '1',
        userId: req.user.id,
        action: 'created',
        entityType: 'job',
        entityId: '60d21b4667d0d8992e610c85',
        description: 'Created new job: Software Engineer',
        timestamp: new Date()
      },
      {
        id: '2',
        userId: req.user.id,
        action: 'updated',
        entityType: 'candidate',
        entityId: '60d21b4667d0d8992e610c86',
        description: 'Updated candidate status: John Doe',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];
    
    return responseUtils.success(res, 'Activities retrieved successfully', { activities });
  } catch (error) {
    console.error('Get activities error:', error);
    return responseUtils.error(res, 'Failed to get activities', 500);
  }
});

// Get activity by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // This is a placeholder implementation
    // In a real app, you would fetch the activity from the database
    const activity = {
      id,
      userId: req.user.id,
      action: 'created',
      entityType: 'job',
      entityId: '60d21b4667d0d8992e610c85',
      description: 'Created new job: Software Engineer',
      timestamp: new Date()
    };
    
    return responseUtils.success(res, 'Activity retrieved successfully', { activity });
  } catch (error) {
    console.error('Get activity error:', error);
    return responseUtils.error(res, 'Failed to get activity', 500);
  }
});

module.exports = router;
