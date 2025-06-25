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
app.use(cors());

// Add request body logging for debugging
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[DEBUG] Response for ${req.method} ${req.url}:`, data);
    originalSend.call(this, data);
  };
  
  console.log(`[DEBUG] ${req.method} ${req.url} Request Body:`, req.body);
  console.log(`[DEBUG] ${req.method} ${req.url} Content-Type:`, req.headers['content-type']);
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
