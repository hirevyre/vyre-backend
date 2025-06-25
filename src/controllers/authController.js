const User = require('../models/User');
const Company = require('../models/Company');
const jwtUtils = require('../utils/jwtUtils');
const responseUtils = require('../utils/responseUtils');
const crypto = require('crypto');

/**
 * Register a new user
 * @route POST /auth/register
 */
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyName } = req.body;
    
    console.log(`Registration attempt for: ${email}, ${firstName} ${lastName}, Company: ${companyName}`);
    
    // Input validation
    if (!email || !password || !firstName || !lastName || !companyName) {
      console.log('Registration failed: Missing required fields');
      return responseUtils.error(res, 'All fields are required', 400);
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Registration failed: User already exists with email ${email}`);
      return responseUtils.error(res, 'User already exists with this email', 400);
    }
    
    console.log('Creating new company...');
    
    // Create company
    const company = new Company({
      name: companyName,
      createdAt: new Date()
    });
    
    await company.save();
    console.log(`Company created with ID: ${company._id}`);
    
    // Create user with secure password hashing
    const user = new User({
      email,
      password, // Will be hashed by pre-save middleware
      firstName,
      lastName,
      companyId: company._id,
      role: 'admin', // First user is always admin
      createdAt: new Date()
    });
    
    await user.save();
    console.log(`User created with ID: ${user._id}`);
    
    // Generate tokens for immediate login
    const accessTokenObj = jwtUtils.generateAccessToken(user);
    const refreshTokenObj = await jwtUtils.generateRefreshToken(user);
    
    return responseUtils.success(res, 'Registration successful', {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: company._id,
      role: user.role,
      accessToken: accessTokenObj.token,
      refreshToken: refreshTokenObj.token,
      accessTokenExpiresAt: accessTokenObj.expiresAt
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return responseUtils.error(res, 'Validation failed: ' + Object.values(error.errors).map(e => e.message).join(', '), 400);
    }
    
    return responseUtils.error(res, 'Registration failed', 500);
  }
};

/**
 * User login
 * @route POST /auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Login attempt for email: ${email}`);
    
    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`Login failed: User not found with email ${email}`);
      return responseUtils.error(res, 'Invalid email or password', 401);
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Login failed: Invalid password for user ${email}`);
      return responseUtils.error(res, 'Invalid email or password', 401);
    }
      console.log(`Password match success for user: ${email}`);
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate tokens
    const accessTokenObj = jwtUtils.generateAccessToken(user);
    const refreshTokenObj = await jwtUtils.generateRefreshToken(user, req.ip, req.headers['user-agent']);
    
    console.log(`Tokens generated successfully for user: ${email}`);
    console.log(`Access token: ${accessTokenObj.token.substring(0, 20)}...`);
    
    // Log activity
    try {
      const Activity = require('../models/Activity');
      await Activity.logActivity({
        user: user._id,
        action: 'other',
        entityType: 'user',
        entityId: user._id,
        description: 'User logged in',
        details: { ip: req.ip },
        companyId: user.companyId
      });
    } catch (activityError) {
      console.error('Failed to log login activity:', activityError);
    }
    
    return responseUtils.success(res, 'Login successful', {
      accessToken: accessTokenObj.token,
      refreshToken: refreshTokenObj.token,
      accessTokenExpiresAt: accessTokenObj.expiresAt,
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    return responseUtils.error(res, 'Login failed', 500);
  }
};

/**
 * Refresh token
 * @route POST /auth/refresh-token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    console.log('Refresh token request received');
    
    if (!refreshToken) {
      console.log('Refresh token missing in request body');
      return responseUtils.error(res, 'Refresh token is required', 400);
    }
    
    // Verify refresh token
    const decoded = jwtUtils.verifyToken(refreshToken, true);
    if (!decoded) {
      console.log('Refresh token verification failed');
      return responseUtils.error(res, 'Invalid or expired refresh token', 401);
    }
    
    console.log(`Refresh token decoded successfully for user ID: ${decoded.id}`);
    
    // Check if token exists in database
    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': refreshToken
    });
    
    if (!user) {
      console.log(`User not found for refresh token with ID: ${decoded.id}`);
      return responseUtils.error(res, 'Invalid or expired refresh token', 401);
    }
    
    console.log(`User found: ${user.email}`);
    
    // Generate new access token
    const accessTokenObj = jwtUtils.generateAccessToken(user);
    
    console.log('New access token generated successfully');
    
    return responseUtils.success(res, 'Token refreshed successfully', {
      accessToken: accessTokenObj.token,
      accessTokenExpiresAt: accessTokenObj.expiresAt,
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return responseUtils.error(res, 'Token refresh failed', 500);
  }
};

/**
 * Revoke refresh token
 * @route POST /auth/revoke-token
 */
exports.revokeToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return responseUtils.error(res, 'Refresh token is required', 400);
    }
    
    const success = await jwtUtils.revokeRefreshToken(refreshToken);
    
    if (!success) {
      return responseUtils.error(res, 'Invalid refresh token', 400);
    }
    
    return responseUtils.success(res, 'Token revoked successfully');
  } catch (error) {
    console.error('Revoke token error:', error);
    return responseUtils.error(res, 'Token revocation failed', 500);
  }
};

/**
 * Forgot password
 * @route POST /auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, we still return success even if user doesn't exist
      return responseUtils.success(res, 'Password reset link sent to your email');
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Save reset token to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();
    
    // In a real application, send an email with the reset link
    // const resetUrl = `https://vyre.io/reset-password?token=${resetToken}`;
    // TODO: Send email with reset link
    
    return responseUtils.success(res, 'Password reset link sent to your email');
  } catch (error) {
    console.error('Forgot password error:', error);
    return responseUtils.error(res, 'Failed to send password reset email', 500);
  }
};

/**
 * Reset password
 * @route POST /auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Hash the token from the request
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return responseUtils.error(res, 'Invalid or expired token', 400);
    }
    
    // Update password and clear reset token fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    return responseUtils.success(res, 'Password reset successful');
  } catch (error) {
    console.error('Reset password error:', error);
    return responseUtils.error(res, 'Password reset failed', 500);
  }
};
