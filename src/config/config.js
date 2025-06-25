require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI,
  jwtAccessSecret: process.env.ACCESS_TOKEN_SECRET,
  jwtRefreshSecret: process.env.REFRESH_TOKEN_SECRET,
  jwtAccessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '24h',
  jwtRefreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '30d',
  environment: process.env.NODE_ENV || 'development'
};
