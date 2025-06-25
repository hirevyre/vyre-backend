const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
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
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  jdFitScore: {
    type: Number,
    min: 0,
    max: 100
  },
  result: {
    type: String,
    enum: ['Hire', 'Shortlist', 'Consider', 'Reject']
  },
  skills: {
    softSkills: {
      type: Map,
      of: Number // 0-100 score for each soft skill
    },
    hardSkills: {
      type: Map,
      of: Number // 0-100 score for each hard skill
    }
  },
  summary: {
    type: String
  },
  feedback: {
    type: String
  },
  strengths: [{
    type: String
  }],
  areasForImprovement: [{
    type: String
  }],
  transcript: {
    type: String
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
  generatedBy: {
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
  timestamps: true
});

module.exports = mongoose.model('Report', ReportSchema);
