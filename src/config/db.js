const mongoose = require('mongoose');
const config = require('./config');

// MongoDB connection options with enhanced settings
const options = {
  ssl: true,
  tls: true,
  retryWrites: true,
  w: 'majority',
  serverSelectionTimeoutMS: 10000, // Timeout for server selection
  socketTimeoutMS: 45000, // Timeout for operations
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 10 // Maximum number of connections in the pool
};

// Connect to MongoDB with better error handling and logging
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log(`URI: ${config.mongoURI.substring(0, 20)}...`);
    
    await mongoose.connect(config.mongoURI, options);
    
    console.log('MongoDB connected successfully');
    
    // Log database information
    const db = mongoose.connection.db;
    const stats = await db.stats();
    console.log(`Connected to database: ${stats.db}, with ${stats.collections} collections`);
    
    // Setup connection monitoring
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      // Auto-reconnect after a short delay
      setTimeout(async () => {
        try {
          await mongoose.connect(config.mongoURI, options);
          console.log('MongoDB reconnected successfully');
        } catch (reconnectErr) {
          console.error('MongoDB reconnection failed:', reconnectErr);
        }
      }, 5000); // Wait 5 seconds before attempting to reconnect
    });
    
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    
    if (err.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server. Check network or credentials.');
    } else if (err.name === 'MongoNetworkError') {
      console.error('MongoDB network error. Check your connectivity.');
      
      // Set up auto-retry for network errors
      console.log('Will attempt to reconnect in 10 seconds...');
      setTimeout(connectDB, 10000);
      return;
    }
    
    // Only exit for critical errors
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('Continuing startup despite MongoDB connection failure...');
    }
  }
};

module.exports = connectDB;
