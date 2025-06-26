const express = require('express');
const mongoose = require('mongoose');
const responseUtils = require('../utils/responseUtils');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');

const router = express.Router();

/**
 * Check MongoDB connection health
 * @route GET /health/mongodb
 */
router.get('/mongodb', async (req, res) => {
  try {
    // Check MongoDB connection state
    const state = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const status = stateMap[state] || 'unknown';
    
    // Run a basic read query to test real connection
    let querySuccess = false;
    let error = null;
    
    try {
      // Attempt to query the database
      const userCount = await User.countDocuments().limit(1).exec();
      querySuccess = true;
    } catch (err) {
      error = {
        message: err.message,
        name: err.name,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      };
    }
    
    // Get connection info
    const connInfo = {
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    };
    
    // Get collection statistics if connected
    let collectionStats = {};
    if (state === 1) {
      const collections = [
        { name: 'users', model: User },
        { name: 'companies', model: Company },
        { name: 'jobs', model: Job },
        { name: 'candidates', model: Candidate },
        { name: 'interviews', model: Interview }
      ];
      
      await Promise.all(collections.map(async ({ name, model }) => {
        try {
          const count = await model.countDocuments();
          collectionStats[name] = { count };
        } catch (err) {
          collectionStats[name] = { error: err.message };
        }
      }));
    }
    
    // Get database status if connected
    let dbStats = null;
    if (state === 1) {
      try {
        dbStats = await mongoose.connection.db.stats();
      } catch (err) {
        console.error('Failed to get DB stats:', err);
      }
    }
    
    return responseUtils.success(res, 'MongoDB connection status', {
      status,
      state,
      querySuccess,
      error,
      connection: connInfo,
      collections: collectionStats,
      stats: dbStats
    });
  } catch (error) {
    console.error('MongoDB health check error:', error);
    return responseUtils.error(res, 'Failed to check MongoDB connection', 500);
  }
});

/**
 * Check MongoDB connection status
 */
router.get('/mongodb-status', async (req, res) => {
  try {
    const dbState = [
      { value: 0, label: "Disconnected", color: "red" },
      { value: 1, label: "Connected", color: "green" },
      { value: 2, label: "Connecting", color: "yellow" },
      { value: 3, label: "Disconnecting", color: "yellow" }
    ];
    
    const state = mongoose.connection.readyState;
    const stateInfo = dbState.find(s => s.value === state);
    
    const dbStats = {
      state: stateInfo.label,
      status: stateInfo.value === 1 ? "healthy" : "unhealthy",
      host: mongoose.connection.host || "Not connected",
      name: mongoose.connection.name || "Not connected",
      collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections).length : 0,
      models: Object.keys(mongoose.models).length,
      readyState: mongoose.connection.readyState,
      nodeVersion: process.version,
      sslEnabled: mongoose.connection.client?.options?.ssl || false,
      tlsInsecure: mongoose.connection.client?.options?.tlsAllowInvalidCertificates || false,
    };
    
    return res.status(200).json({
      status: "success",
      data: dbStats,
      timestamp: new Date(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error("Error checking MongoDB status:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to check MongoDB status",
      error: error.message
    });
  }
});

/**
 * Get system health
 * @route GET /health
 */
router.get('/', async (req, res) => {
  try {
    // Check API health
    const apiStatus = {
      status: 'up',
      uptime: process.uptime(),
      timestamp: Date.now(),
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage()
    };
    
    // Check MongoDB connection
    const dbStatus = {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
    
    return responseUtils.success(res, 'Health check passed', {
      api: apiStatus,
      database: dbStatus
    });
  } catch (error) {
    console.error('Health check error:', error);
    return responseUtils.error(res, 'Health check failed', 500);
  }
});

module.exports = router;
