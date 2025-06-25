const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * Get JWT Access Secret for testing
 */
exports.getAccessSecret = () => {
  return config.jwtAccessSecret;
};

/**
 * Get JWT Refresh Secret for testing
 */
exports.getRefreshSecret = () => {
  return config.jwtRefreshSecret;
};

/**
 * Get JWT Access Token Expiry for testing
 */
exports.getAccessExpiry = () => {
  return config.jwtAccessExpiry;
};

/**
 * Get JWT Refresh Token Expiry for testing
 */
exports.getRefreshExpiry = () => {
  return config.jwtRefreshExpiry;
};

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {String} expiresIn - Token expiration time
 * @param {Boolean} isRefreshToken - Whether this is a refresh token
 * @returns {String} JWT token
 */
exports.generateToken = (payload, expiresIn, isRefreshToken = false) => {
  // Check if the secret is available
  const secret = isRefreshToken ? config.jwtRefreshSecret : config.jwtAccessSecret;
  
  if (!secret) {
    console.error(`JWT secret is missing: ${isRefreshToken ? 'REFRESH_TOKEN_SECRET' : 'ACCESS_TOKEN_SECRET'} not defined in environment`);
    throw new Error('JWT secret is not configured');
  }
  
  try {
    console.log(`Generating ${isRefreshToken ? 'refresh' : 'access'} token with expiry: ${expiresIn}`);
    console.log(`Secret exists and has length: ${secret.length}`);
    
    const token = jwt.sign(payload, secret, { expiresIn });
    console.log(`Token generated successfully`);
    
    return token;
  } catch (error) {
    console.error(`Error generating token: ${error.message}`);
    throw error;
  }
};

/**
 * Generate access token
 * @param {Object} user - User object
 * @returns {Object} Token object with token and expiry date
 */
exports.generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  };
  
  const token = this.generateToken(payload, config.jwtAccessExpiry, false);
  
  // Calculate expiry date
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);
  
  return {
    token,
    expiresAt
  };
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @param {String} ipAddress - IP address of the user
 * @param {String} userAgent - User agent string
 * @returns {Object} Token object with token and expiry date
 */
exports.generateRefreshToken = async (user, ipAddress = '', userAgent = '') => {
  const payload = {
    id: user._id,
    type: 'refresh'
  };
  
  const token = this.generateToken(payload, config.jwtRefreshExpiry, true);
  
  // Calculate expiry date
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);
  
  // Parse user agent to get device info
  let deviceInfo = {};
  try {
    deviceInfo = {
      userAgent,
      browser: userAgent.match(/(?:MSIE|Firefox|Chrome|Safari|Opera)[\/\s](\d+)/i)?.[1] || 'Unknown',
      os: userAgent.match(/Windows|Mac|Linux|Android|iOS/i)?.[0] || 'Unknown'
    };
  } catch (error) {
    console.error('Error parsing user agent:', error);
  }
  
  // Store refresh token in the database with additional info
  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        token,
        expiresAt,
        ipAddress,
        deviceInfo,
        createdAt: new Date()
      }
    }
  });
  
  return {
    token,
    expiresAt
  };
};

/**
 * Verify token
 * @param {String} token - JWT token
 * @param {Boolean} isRefreshToken - Whether this is a refresh token
 * @returns {Object} Decoded token payload
 */
exports.verifyToken = (token, isRefreshToken = false) => {
  try {
    const secret = isRefreshToken ? config.jwtRefreshSecret : config.jwtAccessSecret;
    
    if (!secret) {
      console.error(`JWT secret is missing for token verification: ${isRefreshToken ? 'REFRESH_TOKEN_SECRET' : 'ACCESS_TOKEN_SECRET'}`);
      return null;
    }
    
    console.log(`Verifying ${isRefreshToken ? 'refresh' : 'access'} token`);
    console.log(`Token starts with: ${token.substring(0, 15)}...`);
    console.log(`Secret exists and has length: ${secret.length}`);
    
    const decoded = jwt.verify(token, secret);
    console.log(`Token verified successfully: ${JSON.stringify(decoded)}`);
    
    return decoded;
  } catch (error) {
    console.error(`Token verification error: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      console.log('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid token format or signature');
    }
    return null;
  }
};

/**
 * Revoke refresh token
 * @param {String} token - Refresh token to revoke
 * @returns {Boolean} Success status
 */
exports.revokeRefreshToken = async (token) => {
  try {
    // Use verifyToken with isRefreshToken=true to verify with the refresh token secret
    const decoded = this.verifyToken(token, true);
    if (!decoded || !decoded.id) return false;
    
    // Remove refresh token from user document
    await User.findByIdAndUpdate(decoded.id, {
      $pull: {
        refreshTokens: {
          token
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return false;
  }
};
