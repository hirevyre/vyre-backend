const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  website: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']
  },
  location: {
    type: String,
    trim: true
  },
  settings: {
    notificationPreferences: {
      email: {
        newApplicant: {
          type: Boolean,
          default: true
        },
        interviewScheduled: {
          type: Boolean,
          default: true
        },
        interviewCompleted: {
          type: Boolean,
          default: true
        }
      }
    },
    interviewPreferences: {
      defaultDuration: {
        type: Number,
        default: 60 // minutes
      },
      defaultLocation: {
        type: String,
        default: 'Virtual'
      }
    }
  },
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

module.exports = mongoose.model('Company', CompanySchema);
