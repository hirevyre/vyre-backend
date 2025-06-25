const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  interviewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // minutes
    default: 60
  },
  location: {
    type: String,
    enum: ['Virtual', 'In-person', 'Phone'],
    default: 'Virtual'
  },
  linkOrAddress: {
    type: String
  },
  type: {
    type: String,
    enum: ['Screening', 'Technical', 'Behavioral', 'Final', 'Team', 'General'],
    default: 'General'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'No-show'],
    default: 'Scheduled'
  },
  feedback: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    recommendation: {
      type: String,
      enum: ['Hire', 'Shortlist', 'Consider', 'Reject']
    },
    skills: {
      type: Map,
      of: Number // 0-100 score for each skill
    },
    feedback: {
      type: String
    },
    transcript: {
      type: String
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date
    }
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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

module.exports = mongoose.model('Interview', InterviewSchema);
