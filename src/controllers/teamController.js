const User = require('../models/User');
const responseUtils = require('../utils/responseUtils');
const crypto = require('crypto');

/**
 * List team members
 * @route GET /team
 */
exports.getTeamMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, q } = req.query;
    
    // Build filters
    const filters = {
      companyId: req.user.companyId
    };
    
    if (q) {
      filters.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { position: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Count total members
    const total = await User.countDocuments(filters);
    
    // Get paginated members
    const members = await User.find(filters)
      .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires')
      .sort({ firstName: 1, lastName: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Format members data
    const membersData = members.map(member => ({
      id: member._id,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      role: member.role,
      position: member.position || 'Not specified',
      avatar: member.avatar || '/placeholder.svg'
    }));
    
    // Build pagination object
    const pagination = responseUtils.getPagination(total, page, limit);
    
    return responseUtils.success(res, undefined, {
      ...pagination,
      members: membersData
    });
  } catch (error) {
    console.error('Get team members error:', error);
    return responseUtils.error(res, 'Failed to get team members', 500);
  }
};

/**
 * Get team member details
 * @route GET /team/:memberId
 */
exports.getTeamMemberById = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const member = await User.findOne({
      _id: memberId,
      companyId: req.user.companyId
    }).select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires');
    
    if (!member) {
      return responseUtils.error(res, 'Team member not found', 404);
    }
    
    const memberData = {
      id: member._id,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      role: member.role,
      avatar: member.avatar || '/placeholder.svg',
      position: member.position || 'Not specified',
      department: member.department || 'Not specified'
    };
    
    return responseUtils.success(res, undefined, memberData);
  } catch (error) {
    console.error('Get team member by ID error:', error);
    return responseUtils.error(res, 'Failed to get team member', 500);
  }
};

/**
 * Invite team member
 * @route POST /team/invite
 */
exports.inviteTeamMember = async (req, res) => {
  try {
    const { email, role, message } = req.body;
    
    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseUtils.error(res, 'User already exists with this email', 400);
    }
    
    // Generate an invite token (would be sent via email in a real app)
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    // In a real app, would save the invitation to database and send email
    // For now, just simulate success
    
    return responseUtils.success(res, 'Invitation sent successfully', {
      inviteId: `invite_${Date.now()}`,
      email
    }, 201);
  } catch (error) {
    console.error('Invite team member error:', error);
    return responseUtils.error(res, 'Failed to send invitation', 500);
  }
};

/**
 * Update team member
 * @route PUT /team/:memberId
 */
exports.updateTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role, department, position } = req.body;
    
    // Find user
    const user = await User.findOne({
      _id: memberId,
      companyId: req.user.companyId
    });
    
    if (!user) {
      return responseUtils.error(res, 'Team member not found', 404);
    }
    
    // Check if current user has permission to update roles
    // Only admin can change roles
    if (role && req.user.role !== 'admin') {
      return responseUtils.error(res, 'Only admins can change roles', 403);
    }
    
    // Update user
    if (role) user.role = role;
    if (department) user.department = department;
    if (position) user.position = position;
    
    await user.save();
    
    return responseUtils.success(res, 'Team member updated successfully', {
      memberId
    });
  } catch (error) {
    console.error('Update team member error:', error);
    return responseUtils.error(res, 'Failed to update team member', 500);
  }
};

/**
 * Delete team member
 * @route DELETE /team/:memberId
 */
exports.deleteTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Don't allow deleting yourself
    if (memberId === req.user.id) {
      return responseUtils.error(res, 'You cannot delete your own account', 400);
    }
    
    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return responseUtils.error(res, 'Only admins can delete team members', 403);
    }
    
    const user = await User.findOne({
      _id: memberId,
      companyId: req.user.companyId
    });
    
    if (!user) {
      return responseUtils.error(res, 'Team member not found', 404);
    }
    
    await user.deleteOne();
    
    return responseUtils.success(res, 'Team member removed successfully');
  } catch (error) {
    console.error('Delete team member error:', error);
    return responseUtils.error(res, 'Failed to delete team member', 500);
  }
};
