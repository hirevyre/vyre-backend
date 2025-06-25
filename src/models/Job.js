const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  salaryRange: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date
  },
  skills: [{
    type: String,
    trim: true
  }],
  jobDescription: {
    type: String,
    required: [true, 'Job description is required']
  },
  screeningQuestions: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Closed', 'Archived'],
    default: 'Draft'
  },
  internalNotes: {
    type: String
  },
  customInterview: {
    type: Boolean,
    default: false
  },
  publishOptions: {
    shareableLink: {
      type: Boolean,
      default: true
    },
    jobBoards: {
      type: Boolean,
      default: false
    },
    emailInvites: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting candidate count
JobSchema.virtual('applicants', {
  ref: 'Candidate',
  localField: '_id',
  foreignField: 'jobId',
  count: true
});

// Virtual for getting interviews count
JobSchema.virtual('interviews', {
  ref: 'Interview',
  localField: '_id',
  foreignField: 'jobId',
  count: true
});

module.exports = mongoose.model('Job', JobSchema);
