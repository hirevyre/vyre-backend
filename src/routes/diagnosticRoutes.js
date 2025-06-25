const express = require('express');
const mongoose = require('mongoose');
const { body } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const jwtUtils = require('../utils/jwtUtils');
const responseUtils = require('../utils/responseUtils');
const { validateRequest } = require('../middlewares/errorMiddleware');
const { auth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint to check system health with detailed debugging info
router.get('/health-check', async (req, res) => {
  try {
    const checks = {
      jwt: {
        accessSecret: !!jwtUtils.getAccessSecret(),
        refreshSecret: !!jwtUtils.getRefreshSecret(),
        accessExpiry: jwtUtils.getAccessExpiry(),
        refreshExpiry: jwtUtils.getRefreshExpiry()
      },
      database: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.name || 'Not connected'
      },
      models: {
        User: !!User,
        Company: !!Company
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT
      }
    };
    
    return responseUtils.success(res, 'System health check', { checks });
  } catch (error) {
    console.error('Health check error:', error);
    return responseUtils.error(res, 'Health check failed', 500);
  }
});

// Create test user (admin)
router.post('/create-test-user', async (req, res) => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@vyre.io' });
    
    if (existingUser) {
      return responseUtils.success(res, 'Test user already exists', {
        userId: existingUser._id,
        email: existingUser.email
      });
    }
    
    // Create test company
    const company = new Company({
      name: 'Test Company'
    });
    
    await company.save();
    
    // Create test user
    const user = new User({
      email: 'test@vyre.io',
      password: 'Password123!', // Will be hashed by pre-save middleware
      firstName: 'Test',
      lastName: 'User',
      companyId: company._id,
      role: 'admin'
    });
    
    await user.save();
    
    return responseUtils.success(res, 'Test user created', {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: 'Password123!',
      companyId: company._id
    }, 201);
  } catch (error) {
    console.error('Create test user error:', error);
    return responseUtils.error(res, 'Failed to create test user', 500);
  }
});

// Test auth flow
router.get('/test-auth-flow', async (req, res) => {
  try {
    // Step 1: Create test user if doesn't exist
    let testUser = await User.findOne({ email: 'test@vyre.io' });
    
    if (!testUser) {
      // Create test company
      const company = new Company({
        name: 'Test Company'
      });
      
      await company.save();
      
      // Create test user
      testUser = new User({
        email: 'test@vyre.io',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        companyId: company._id,
        role: 'admin'
      });
      
      await testUser.save();
    }
    
    // Step 2: Login and get tokens
    const user = await User.findOne({ email: 'test@vyre.io' }).select('+password');
    
    // Generate tokens
    const accessTokenObj = jwtUtils.generateAccessToken(user);
    const refreshTokenObj = await jwtUtils.generateRefreshToken(user);
    
    // Step 3: Verify tokens
    const accessVerified = jwtUtils.verifyToken(accessTokenObj.token, false);
    const refreshVerified = jwtUtils.verifyToken(refreshTokenObj.token, true);
    
    return responseUtils.success(res, 'Auth flow test completed', {
      user: {
        id: user._id,
        email: user.email
      },
      tokens: {
        accessToken: accessTokenObj.token,
        accessTokenExpiresAt: accessTokenObj.expiresAt,
        refreshToken: refreshTokenObj.token,
        refreshTokenExpiresAt: refreshTokenObj.expiresAt
      },
      verification: {
        accessVerified: !!accessVerified,
        refreshVerified: !!refreshVerified
      }
    });
  } catch (error) {
    console.error('Auth flow test error:', error);
    return responseUtils.error(res, `Auth flow test failed: ${error.message}`, 500);
  }
});

module.exports = router;
