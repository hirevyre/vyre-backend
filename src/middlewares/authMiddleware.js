const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * Authentication middleware to protect routes
 */
exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware: No token or invalid token format provided');
      return res.status(401).json({ 
        status: 'error', 
        message: 'Access denied. No token provided.' 
      });    
    }
    
    const token = authHeader.split(' ')[1];

    // Verify token
    if (!config.jwtAccessSecret) {
      console.error('JWT Access Secret is not configured');
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
      });
    }
    
    console.log('Auth middleware: Verifying token with secret');
    const decoded = jwt.verify(token, config.jwtAccessSecret);
    console.log('Auth middleware: Token verified successfully, decoded:', decoded);
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log(`Auth middleware: User not found for ID: ${decoded.id}`);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid token. User not found.' 
      });
    }

    console.log(`Auth middleware: User found: ${user.email}`);

    // Add user to request
    req.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId // Adding companyId which was missing
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.error(`Auth middleware: JWT error: ${error.message}`);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid token.' 
      });
    } else if (error.name === 'TokenExpiredError') {
      console.error('Auth middleware: Token expired');
      return res.status(401).json({ 
        status: 'error', 
        message: 'Token expired.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error.' 
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of allowed roles
 */
exports.authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Unauthorized. Authentication required.' 
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Forbidden. You do not have permission to access this resource.' 
      });
    }

    next();
  };
};
