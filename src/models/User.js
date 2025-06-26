const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  role: {
    type: String,
    enum: ['admin', 'recruiter', 'interviewer', 'hiring_manager'],
    default: 'admin'
  },
  position: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    deviceInfo: Object,
    ipAddress: String
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password with improved error handling
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    console.log(`Hashing password for user: ${this.email}`);
    
    // Generate salt with higher cost factor for better security
    const salt = await bcrypt.genSalt(12);
    
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    
    next();
  } catch (error) {
    console.error(`Error hashing password: ${error.message}`);
    next(error);
  }
});

// Method to compare password with detailed logging
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!candidatePassword) {
      console.log('Empty password provided for comparison');
      return false;
    }
    
    console.log(`Comparing password for user: ${this.email}`);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`Password match result: ${isMatch}`);
    
    return isMatch;
  } catch (error) {
    console.error(`Error comparing password: ${error.message}`);
    return false;
  }
};

// Method to get user's full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', UserSchema);
