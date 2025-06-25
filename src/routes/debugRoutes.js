const express = require('express');
const User = require('../models/User');
const responseUtils = require('../utils/responseUtils');
const jwtUtils = require('../utils/jwtUtils');
const bcrypt = require('bcrypt');

const router = express.Router();

// Debug route to check if users exist
router.get('/check-users', async (req, res) => {
  try {
    // Count users
    const count = await User.countDocuments();
    
    // Get first 5 users (without passwords)
    const users = await User.find()
      .select('-password')
      .limit(5)
      .lean();
    
    return responseUtils.success(res, 'Debug information', {
      totalUsers: count,
      sampleUsers: users
    });
  } catch (error) {
    console.error('Debug route error:', error);
    return responseUtils.error(res, 'Debug route failed', 500);
  }
});

// Debug route to test JWT token generation and verification
router.post('/test-jwt', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return responseUtils.error(res, 'User not found', 404);
    }
    
    // Check if password comparison works
    const passwordMatches = await user.comparePassword(password);
    
    // Generate test tokens
    const accessTokenObj = jwtUtils.generateAccessToken(user);
    const refreshTokenObj = await jwtUtils.generateRefreshToken(user);
    
    // Verify tokens
    const accessVerified = jwtUtils.verifyToken(accessTokenObj.token, false);
    const refreshVerified = jwtUtils.verifyToken(refreshTokenObj.token, true);
      return responseUtils.success(res, 'JWT test results', {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      passwordMatches,
      tokens: {
        accessToken: accessTokenObj.token,
        accessTokenExpiresAt: accessTokenObj.expiresAt,
        refreshToken: refreshTokenObj.token,
        refreshTokenExpiresAt: refreshTokenObj.expiresAt
      },
      verification: {
        accessVerified: !!accessVerified,
        refreshVerified: !!refreshVerified
      },
      config: {
        accessSecret: !!jwtUtils.getAccessSecret(),
        refreshSecret: !!jwtUtils.getRefreshSecret(),
        accessExpiry: jwtUtils.getAccessExpiry(),
        refreshExpiry: jwtUtils.getRefreshExpiry()
      }
    });
  } catch (error) {
    console.error('JWT test error:', error);
    return responseUtils.error(res, `JWT test failed: ${error.message}`, 500);
  }
});

module.exports = router;
