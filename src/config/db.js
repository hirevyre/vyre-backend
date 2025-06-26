const mongoose = require('mongoose');
const config = require('./config');

// Advanced MongoDB connection options with SSL configuration
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4  // Force IPv4
};

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(config.mongoURI, dbOptions);
    
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    
    // Set up connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      // Only attempt to reconnect if not already reconnecting
      if (!mongoose.connection.readyState) {
        setTimeout(connectDB, 5000); // Reconnect after 5 seconds
      }
    });
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    
    // Handle specific SSL errors
    if (error.message && error.message.includes('SSL')) {
      console.error('SSL Error Details:', {
        message: error.message,
        code: error.code,
        library: error.library,
        reason: error.reason
      });
      console.log('\nPlease check:');
      console.log('1. Your MongoDB URI is correct including username and password');
      console.log('2. Your IP address is whitelisted in MongoDB Atlas');
      console.log('3. Your Node.js version supports TLS 1.2+');
      console.log('4. Try upgrading Node.js or using the MongoDB Atlas Node.js 4.0+ driver');
    }
    
    // Exit on critical database error in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Exiting due to MongoDB connection failure in production');
      process.exit(1);
    } else {
      console.log('Will retry connection in 5 seconds...');
      setTimeout(connectDB, 5000); // Reconnect after 5 seconds in development
    }
  }
};

module.exports = connectDB;
