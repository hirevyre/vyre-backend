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
app.use(express.json());
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
