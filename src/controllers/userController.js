const User = require('../models/User');
const Activity = require('../models/Activity');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const responseUtils = require('../utils/responseUtils');

/**
 * Get current user profile
 * @route GET /users/me
 */
exports.getCurrentUser = async (req, res) => {
  try {
    console.log(`Getting user profile for ID: ${req.user.id}`);
    
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    
    if (!user) {
      console.log(`User not found with ID: ${req.user.id}`);
      return responseUtils.error(res, 'User not found', 404);
    }
    
    console.log(`User found: ${user.email}`);
    
    return responseUtils.success(res, 'User profile retrieved successfully', { user });
  } catch (error) {
    console.error('Get current user error:', error);
    return responseUtils.error(res, 'Failed to get user profile', 500);
  }
};

/**
 * Update current user profile
 * @route PUT /users/me
 */
exports.updateCurrentUser = async (req, res) => {
  try {
    const { firstName, lastName, position, department, avatar, phoneNumber, location, bio } = req.body;
    
    console.log(`Updating user profile for ID: ${req.user.id}`, req.body);
    
    const allowedFields = ['firstName', 'lastName', 'position', 'department', 
                           'avatar', 'phoneNumber', 'location', 'bio'];
    
    const updateFields = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
    
    if (!user) {
      console.log(`User not found for update with ID: ${req.user.id}`);
      return responseUtils.error(res, 'User not found', 404);
    }
    
    console.log(`User profile updated: ${user.email}`);
    
    // Log activity
    try {
      await Activity.logActivity({
        user: req.user.id,
        action: 'updated',
        entityType: 'user',
        entityId: req.user.id,
        description: 'Updated profile information',
        companyId: req.user.companyId
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }
    
    return responseUtils.success(res, 'Profile updated successfully', { user });
  } catch (error) {
    console.error('Update current user error:', error);
    return responseUtils.error(res, 'Failed to update profile', 500);
  }
};

/**
 * Change user password
 * @route PUT /users/me/password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return responseUtils.error(res, 'User not found', 404);
    }
      // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      console.log('Password change failed: Current password is incorrect');
      return responseUtils.error(res, 'Current password is incorrect', 400);
    }
    
    // Prevent reusing the same password
    if (currentPassword === newPassword) {
      return responseUtils.error(res, 'New password must be different from current password', 400);
    }
    
    // Update password
    console.log('Updating password for user:', user.email);
    user.password = newPassword;
    await user.save();
    
    // Revoke all refresh tokens for security
    await User.findByIdAndUpdate(req.user.id, { $set: { refreshTokens: [] } });
    
    return responseUtils.success(res, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return responseUtils.error(res, 'Failed to change password', 500);
  }
};

/**
 * Get user statistics
 * @route GET /users/me/stats
 */
exports.getUserStats = async (req, res) => {
  try {
    console.log(`Getting stats for user ID: ${req.user.id}`);
    
    // Get counts of various entities associated with user
    const [jobsCreated, candidatesReviewed, interviewsScheduled, activitiesCount] = await Promise.all([
      Job.countDocuments({ createdBy: req.user.id }),
      Candidate.countDocuments({ 
        $or: [
          { createdBy: req.user.id },
          { updatedBy: req.user.id }
        ] 
      }),
      Interview.countDocuments({ 
        $or: [
          { interviewer: req.user.id },
          { createdBy: req.user.id }
        ]
      }),
      Activity.countDocuments({ user: req.user.id })
    ]);
    
    // Get recent activities
    const recentActivities = await Activity.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    console.log(`Stats retrieved for user ID: ${req.user.id}`);
    
    return responseUtils.success(res, 'User statistics retrieved successfully', {
      jobsCreated,
      candidatesReviewed,
      interviewsScheduled,
      activitiesCount,
      recentActivities
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return responseUtils.error(res, 'Failed to get user statistics', 500);
  }
};

/**
 * Get all users (for admin)
 * @route GET /users
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Only return users from the same company
    const users = await User.find({ companyId: req.user.companyId })
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 });
    
    return responseUtils.success(res, 'Users retrieved successfully', { users });
  } catch (error) {
    console.error('Get all users error:', error);
    return responseUtils.error(res, 'Failed to get users', 500);
  }
};

/**
 * Get user by ID
 * @route GET /users/:userId
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only return user if from same company
    const user = await User.findOne({ 
      _id: userId,
      companyId: req.user.companyId 
    }).select('-password -refreshTokens');
    
    if (!user) {
      return responseUtils.error(res, 'User not found', 404);
    }
    
    return responseUtils.success(res, 'User retrieved successfully', { user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return responseUtils.error(res, 'Failed to get user', 500);
  }
};
