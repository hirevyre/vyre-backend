// Entry point for Vyre API
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./src/routes/authRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const candidateRoutes = require('./src/routes/candidateRoutes');
const interviewRoutes = require('./src/routes/interviewRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const activityRoutes = require('./src/routes/activityRoutes');
const userRoutes = require('./src/routes/userRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const debugRoutes = require('./src/routes/debugRoutes');
const diagnosticRoutes = require('./src/routes/diagnosticRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(helmet());

// Configure CORS for production and development
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`[CORS] Request from origin: ${origin}`);
    console.log(`[CORS] Environment: ${process.env.NODE_ENV}`);
    console.log(`[CORS] Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`[CORS] Admin Panel URL: ${process.env.ADMIN_PANEL_URL}`);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('[CORS] No origin provided, allowing request');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL,
      process.env.ADMIN_PANEL_URL
    ].filter(Boolean); // Remove any undefined values

    console.log(`[CORS] Allowed origins:`, allowedOrigins);

    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      console.log('[CORS] Development mode - allowing all origins');
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`[CORS] Origin ${origin} is allowed`);
      callback(null, true);
    } else {
      console.error(`[CORS] Origin ${origin} is NOT allowed. Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Add request body logging for debugging
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[DEBUG] Response for ${req.method} ${req.url}:`, data);
    originalSend.call(this, data);
  };
  
  console.log(`[DEBUG] ${req.method} ${req.url} Request Body:`, req.body);
  console.log(`[DEBUG] ${req.method} ${req.url} Content-Type:`, req.headers['content-type']);
  console.log(`[DEBUG] ${req.method} ${req.url} Origin:`, req.headers.origin);
  console.log(`[DEBUG] ${req.method} ${req.url} User-Agent:`, req.headers['user-agent']);
  next();
});

// JSON parsing with custom error handling
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    // Store raw body for potential use in webhooks or signature verification
    req.rawBody = buf.toString();
  },
  reviver: (key, value) => {
    // You can add custom JSON reviver logic here if needed
    return value;
  }
}));

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err.message);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload',
      details: 'The request contains invalid JSON. Please check your request format.',
      code: 'INVALID_JSON'
    });
  }
  next(err);
});

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect to MongoDB using our configured connection module
const connectDB = require('./src/config/db');
connectDB();

// Define API routes
const API_BASE = '/v1';

app.use(`${API_BASE}/auth`, authRoutes);
app.use(`${API_BASE}/jobs`, jobRoutes);
app.use(`${API_BASE}/candidates`, candidateRoutes);
app.use(`${API_BASE}/interviews`, interviewRoutes);
app.use(`${API_BASE}/reports`, reportRoutes);
app.use(`${API_BASE}/analytics`, analyticsRoutes);
app.use(`${API_BASE}/team`, teamRoutes);
app.use(`${API_BASE}/settings`, settingsRoutes);
app.use(`${API_BASE}/notifications`, notificationRoutes);
app.use(`${API_BASE}/activities`, activityRoutes);
app.use(`${API_BASE}/users`, userRoutes);
app.use(`${API_BASE}/health`, healthRoutes); // Add health check routes
app.use(`${API_BASE}/debug`, debugRoutes); // Add debug routes for troubleshooting
app.use(`${API_BASE}/diagnostics`, diagnosticRoutes); // Add diagnostic routes for system testing

// Debug route to check environment configuration (remove after fixing)
app.get('/debug/env', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL || 'Not set',
    adminPanelUrl: process.env.ADMIN_PANEL_URL || 'Not set',
    mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ? 'Set' : 'Not set',
    port: process.env.PORT || 'Not set',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Vyre API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
